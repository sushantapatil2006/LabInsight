"""
LabInsight – Lab value extraction from raw PDF text.

Uses a battery of regular expressions to pull structured lab values from
the many different formats laboratories use. The extractor is intentionally
lenient: partial results are always returned so the downstream AI analyser
still has context to work with.
"""

from __future__ import annotations

import logging
import re
from typing import Any

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Header / metadata patterns
# ---------------------------------------------------------------------------

_PATIENT_NAME_PATTERNS: list[re.Pattern] = [
    re.compile(r"(?:Patient\s*(?:Name)?|Name)\s*[:\-]\s*(.+)", re.IGNORECASE),
    re.compile(r"(?:Mr\.|Mrs\.|Ms\.|Dr\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)"),
]

_LAB_NAME_PATTERNS: list[re.Pattern] = [
    re.compile(r"(?:Lab(?:oratory)?\s*(?:Name)?|Facility|Center|Centre)\s*[:\-]\s*(.+)", re.IGNORECASE),
]

_DATE_PATTERNS: list[re.Pattern] = [
    re.compile(
        r"(?:Date|Report\s*Date|Collection\s*Date|Sample\s*Date)\s*[:\-]\s*"
        r"(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4})",
        re.IGNORECASE,
    ),
    re.compile(
        r"(?:Date|Report\s*Date)\s*[:\-]\s*"
        r"(\d{1,2}\s+\w+\s+\d{4})",
        re.IGNORECASE,
    ),
]


def _extract_patient_info(text: str) -> dict[str, Any]:
    """Return a dict with patient_name, lab_name, report_date (all optional)."""
    info: dict[str, Any] = {
        "name": None,
        "lab_name": None,
        "report_date": None,
    }

    # Only search in the first ~1500 chars (header area)
    header = text[:1500]

    for pat in _PATIENT_NAME_PATTERNS:
        m = pat.search(header)
        if m:
            info["name"] = m.group(1).strip()
            break

    for pat in _LAB_NAME_PATTERNS:
        m = pat.search(header)
        if m:
            info["lab_name"] = m.group(1).strip()
            break

    for pat in _DATE_PATTERNS:
        m = pat.search(header)
        if m:
            info["report_date"] = m.group(1).strip()
            break

    return info


# ---------------------------------------------------------------------------
# Lab-value patterns
# ---------------------------------------------------------------------------

# Each pattern is a compiled regex that must expose named groups:
#   test_name, value, unit (optional), ref_low/ref_high or ref_range (optional)

_LAB_VALUE_PATTERNS: list[re.Pattern] = [
    # Format: "Test Name : 5.2 mg/dL (3.5 - 5.5)"  or  "Test Name : 5.2 mg/dL (ref: 3.5-5.5)"
    re.compile(
        r"(?P<test_name>[A-Za-z][A-Za-z0-9 \(\)/\-]{2,50}?)\s*[:]\s*"
        r"(?P<value>\d+\.?\d*)\s*"
        r"(?P<unit>[a-zA-Z/%µμ][a-zA-Z0-9/%µμ·\.]*(?:/[a-zA-Z0-9µμ]+)?)?\s*"
        r"(?:\(?\s*(?:ref(?:erence)?[:\s]*)?\s*(?P<ref_low>\d+\.?\d*)\s*[\-–]\s*(?P<ref_high>\d+\.?\d*)\s*\)?)?",
        re.IGNORECASE,
    ),
    # Format: "Test Name    5.2    mg/dL    3.5 - 5.5"  (tabular, whitespace-separated)
    re.compile(
        r"(?P<test_name>[A-Za-z][A-Za-z0-9 \(\)/\-]{2,50}?)\s{2,}"
        r"(?P<value>\d+\.?\d*)\s+"
        r"(?P<unit>[a-zA-Z/%µμ][a-zA-Z0-9/%µμ·\.]*(?:/[a-zA-Z0-9µμ]+)?)\s+"
        r"(?P<ref_low>\d+\.?\d*)\s*[\-–]\s*(?P<ref_high>\d+\.?\d*)",
    ),
    # Format: "Test Name .... 5.2 mg/dL Reference: 3.5-5.5"
    re.compile(
        r"(?P<test_name>[A-Za-z][A-Za-z0-9 \(\)/\-]{2,50}?)\s*[\.]{2,}\s*"
        r"(?P<value>\d+\.?\d*)\s*"
        r"(?P<unit>[a-zA-Z/%µμ][a-zA-Z0-9/%µμ·\.]*(?:/[a-zA-Z0-9µμ]+)?)?\s*"
        r"(?:Reference\s*[:\-]\s*(?P<ref_low>\d+\.?\d*)\s*[\-–]\s*(?P<ref_high>\d+\.?\d*))?",
        re.IGNORECASE,
    ),
    # Simpler fallback: "Test Name  value  unit"
    re.compile(
        r"(?P<test_name>[A-Za-z][A-Za-z0-9 \(\)/\-]{2,50}?)\s{2,}"
        r"(?P<value>\d+\.?\d*)\s+"
        r"(?P<unit>[a-zA-Z/%µμ][a-zA-Z0-9/%µμ·\.]*(?:/[a-zA-Z0-9µμ]+)?)",
    ),
]


def _determine_status(value_str: str, ref_low: str | None, ref_high: str | None) -> str:
    """Compare a measured value against a reference range and return a status string."""
    if not ref_low or not ref_high:
        return "normal"  # Cannot determine without reference range

    try:
        val = float(value_str)
        lo = float(ref_low)
        hi = float(ref_high)
    except (ValueError, TypeError):
        return "normal"

    if lo <= val <= hi:
        return "normal"

    # Check severity: > 20% outside range → critical
    range_span = hi - lo if hi != lo else 1.0
    if val < lo:
        deviation = (lo - val) / range_span
        return "critical" if deviation > 0.5 else "low"
    else:
        deviation = (val - hi) / range_span
        return "critical" if deviation > 0.5 else "high"


def _extract_lab_values(text: str) -> list[dict[str, str]]:
    """Return a list of dicts, each representing one lab measurement."""
    seen: set[str] = set()
    results: list[dict[str, str]] = []

    for pattern in _LAB_VALUE_PATTERNS:
        for m in pattern.finditer(text):
            test_name = m.group("test_name").strip().rstrip(".:- ")

            # Skip duplicates (first match wins)
            key = test_name.lower()
            if key in seen:
                continue
            seen.add(key)

            value = m.group("value")
            unit = (m.group("unit") or "").strip()
            ref_low = m.groupdict().get("ref_low")
            ref_high = m.groupdict().get("ref_high")

            ref_range = ""
            if ref_low and ref_high:
                ref_range = f"{ref_low}-{ref_high}"

            status = _determine_status(value, ref_low, ref_high)

            results.append(
                {
                    "test_name": test_name,
                    "measured_value": value,
                    "unit": unit,
                    "reference_range": ref_range,
                    "status": status,
                }
            )

    return results


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def extract_lab_values(text: str) -> dict[str, Any]:
    """Extract structured lab data from raw report text.

    Parameters
    ----------
    text:
        The full text extracted from the lab report PDF.

    Returns
    -------
    dict
        Keys: ``patient_info`` (dict), ``lab_values`` (list[dict]),
        ``raw_text`` (str – the original text for downstream context).
    """
    if not text or not text.strip():
        logger.warning("Received empty text for lab extraction")
        return {
            "patient_info": {"name": None, "lab_name": None, "report_date": None},
            "lab_values": [],
            "raw_text": "",
        }

    patient_info = _extract_patient_info(text)
    lab_values = _extract_lab_values(text)

    logger.info(
        "Extracted %d lab values and patient info: %s",
        len(lab_values),
        {k: ("found" if v else "not found") for k, v in patient_info.items()},
    )

    return {
        "patient_info": patient_info,
        "lab_values": lab_values,
        "raw_text": text,
    }

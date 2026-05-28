"""
LabInsight – PDF report generator.

Produces a professionally formatted PDF analysis report using ReportLab.
The output matches the LabInsight brand (deep blue / teal palette) and
includes all sections from the AnalysisResult model.

All generation happens in-memory – no temporary files are created.
"""

from __future__ import annotations

import io
import logging
from datetime import datetime, timezone

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch, mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
)

from models.schemas import AnalysisResult, OverallStatus

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Brand colours
# ---------------------------------------------------------------------------

DEEP_BLUE = colors.HexColor("#0F2B46")
TEAL = colors.HexColor("#14B8A6")
LIGHT_TEAL = colors.HexColor("#CCFBF1")
LIGHT_GRAY = colors.HexColor("#F8FAFC")
RED = colors.HexColor("#DC2626")
ORANGE = colors.HexColor("#EA580C")
GREEN = colors.HexColor("#16A34A")
WHITE = colors.white

# ---------------------------------------------------------------------------
# Style factory
# ---------------------------------------------------------------------------

def _build_styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "Title",
            parent=base["Title"],
            fontSize=22,
            textColor=DEEP_BLUE,
            spaceAfter=6,
        ),
        "subtitle": ParagraphStyle(
            "Subtitle",
            parent=base["Normal"],
            fontSize=10,
            textColor=colors.gray,
            spaceAfter=12,
        ),
        "section": ParagraphStyle(
            "Section",
            parent=base["Heading2"],
            fontSize=14,
            textColor=DEEP_BLUE,
            spaceBefore=16,
            spaceAfter=6,
            borderPadding=(0, 0, 2, 0),
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["Normal"],
            fontSize=10,
            leading=14,
            textColor=colors.black,
            alignment=TA_JUSTIFY,
        ),
        "body_bold": ParagraphStyle(
            "BodyBold",
            parent=base["Normal"],
            fontSize=10,
            leading=14,
            textColor=colors.black,
            fontName="Helvetica-Bold",
        ),
        "small": ParagraphStyle(
            "Small",
            parent=base["Normal"],
            fontSize=8,
            leading=10,
            textColor=colors.gray,
            alignment=TA_JUSTIFY,
        ),
        "badge": ParagraphStyle(
            "Badge",
            parent=base["Normal"],
            fontSize=12,
            textColor=WHITE,
            fontName="Helvetica-Bold",
            alignment=TA_CENTER,
        ),
        "table_header": ParagraphStyle(
            "TableHeader",
            parent=base["Normal"],
            fontSize=9,
            textColor=WHITE,
            fontName="Helvetica-Bold",
        ),
        "table_cell": ParagraphStyle(
            "TableCell",
            parent=base["Normal"],
            fontSize=9,
            leading=12,
        ),
    }


# ---------------------------------------------------------------------------
# Colour helpers
# ---------------------------------------------------------------------------

_STATUS_COLOURS = {
    "normal": GREEN,
    "low": ORANGE,
    "high": ORANGE,
    "critical": RED,
}

_OVERALL_STATUS_COLOURS = {
    OverallStatus.HEALTHY: GREEN,
    OverallStatus.MILD_CONCERN: ORANGE,
    OverallStatus.NEEDS_ATTENTION: ORANGE,
    OverallStatus.CRITICAL_REVIEW: RED,
}


def _status_color(status: str) -> colors.HexColor:
    return _STATUS_COLOURS.get(status, colors.black)


# ---------------------------------------------------------------------------
# Section builders
# ---------------------------------------------------------------------------

def _header(styles: dict, analysis: AnalysisResult) -> list:
    elements: list = []
    elements.append(Paragraph("LabInsight – Health Report Analysis", styles["title"]))
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    elements.append(Paragraph(f"Generated on {timestamp}", styles["subtitle"]))
    elements.append(HRFlowable(width="100%", thickness=1, color=TEAL))
    elements.append(Spacer(1, 8))
    return elements


def _patient_section(styles: dict, analysis: AnalysisResult) -> list:
    elements: list = []
    pi = analysis.patient_info
    if pi.name or pi.lab_name or pi.report_date:
        elements.append(Paragraph("Patient Information", styles["section"]))
        data = []
        if pi.name:
            data.append(["Patient Name:", pi.name])
        if pi.lab_name:
            data.append(["Laboratory:", pi.lab_name])
        if pi.report_date:
            data.append(["Report Date:", pi.report_date])
        if data:
            t = Table(data, colWidths=[120, 300])
            t.setStyle(TableStyle([
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("TEXTCOLOR", (0, 0), (0, -1), DEEP_BLUE),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]))
            elements.append(t)
            elements.append(Spacer(1, 6))
    return elements


def _status_badge(styles: dict, analysis: AnalysisResult) -> list:
    elements: list = []
    bg = _OVERALL_STATUS_COLOURS.get(analysis.overall_status, DEEP_BLUE)
    badge_data = [[Paragraph(f"Overall Status: {analysis.overall_status.value}", styles["badge"])]]
    badge = Table(badge_data, colWidths=[300])
    badge.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("ROUNDEDCORNERS", [6, 6, 6, 6]),
    ]))
    elements.append(badge)
    elements.append(Spacer(1, 10))
    return elements


def _summary_section(styles: dict, analysis: AnalysisResult) -> list:
    elements: list = []
    if analysis.overall_summary:
        elements.append(Paragraph("Summary", styles["section"]))
        elements.append(Paragraph(analysis.overall_summary, styles["body"]))
        elements.append(Spacer(1, 6))
    return elements


def _abnormal_markers_section(styles: dict, analysis: AnalysisResult) -> list:
    elements: list = []
    if not analysis.abnormal_markers:
        return elements

    elements.append(Paragraph("Abnormal Markers", styles["section"]))

    header_row = [
        Paragraph("Test", styles["table_header"]),
        Paragraph("Value", styles["table_header"]),
        Paragraph("Reference", styles["table_header"]),
        Paragraph("Status", styles["table_header"]),
        Paragraph("Explanation", styles["table_header"]),
    ]
    data_rows = [header_row]

    for marker in analysis.abnormal_markers:
        status_color = _status_color(marker.status.value)
        data_rows.append([
            Paragraph(marker.test_name, styles["table_cell"]),
            Paragraph(f"{marker.value} {marker.unit}", styles["table_cell"]),
            Paragraph(marker.reference_range, styles["table_cell"]),
            Paragraph(
                f'<font color="{status_color.hexval()}">{marker.status.value.upper()}</font>',
                styles["table_cell"],
            ),
            Paragraph(marker.explanation[:120], styles["table_cell"]),
        ])

    col_widths = [90, 70, 70, 55, 200]
    t = Table(data_rows, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        # Header
        ("BACKGROUND", (0, 0), (-1, 0), DEEP_BLUE),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        # Alternating rows
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_GRAY]),
        # Grid
        ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 8))
    return elements





def _concerns_section(styles: dict, analysis: AnalysisResult) -> list:
    elements: list = []
    if not analysis.health_concerns:
        return elements

    elements.append(Paragraph("Health Concerns", styles["section"]))
    for concern in analysis.health_concerns:
        markers_str = ", ".join(concern.related_markers) if concern.related_markers else ""
        elements.append(Paragraph(
            f"<b>{concern.area}</b> — {concern.description}"
            + (f" <i>(Related: {markers_str})</i>" if markers_str else ""),
            styles["body"],
        ))
        elements.append(Spacer(1, 4))
    return elements


def _recommendations_section(styles: dict, analysis: AnalysisResult) -> list:
    elements: list = []
    if not analysis.recommendations:
        return elements

    elements.append(Paragraph("Recommendations", styles["section"]))

    # Group by category
    by_cat: dict[str, list] = {}
    for rec in analysis.recommendations:
        cat = rec.category.value.replace("_", " ").title()
        by_cat.setdefault(cat, []).append(rec)

    for cat, recs in by_cat.items():
        elements.append(Paragraph(f"<b>{cat}</b>", styles["body_bold"]))
        for rec in sorted(recs, key=lambda r: r.priority):
            bullet = f"• {rec.text}"
            elements.append(Paragraph(bullet, styles["body"]))
        elements.append(Spacer(1, 4))

    return elements


def _disclaimer_section(styles: dict, analysis: AnalysisResult) -> list:
    elements: list = []
    elements.append(Spacer(1, 16))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.lightgrey))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph("⚠ Medical Disclaimer", styles["body_bold"]))
    elements.append(Paragraph(analysis.disclaimer, styles["small"]))
    return elements


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def generate_analysis_pdf(analysis: AnalysisResult) -> bytes:
    """Generate a branded PDF report from an AnalysisResult.

    Returns
    -------
    bytes
        The complete PDF file content.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        title="LabInsight Analysis Report",
        author="LabInsight AI",
    )

    styles = _build_styles()

    # Assemble all flowables
    story: list = []
    story.extend(_header(styles, analysis))
    story.extend(_patient_section(styles, analysis))
    story.extend(_status_badge(styles, analysis))
    story.extend(_summary_section(styles, analysis))
    story.extend(_abnormal_markers_section(styles, analysis))
    story.extend(_concerns_section(styles, analysis))
    story.extend(_recommendations_section(styles, analysis))
    story.extend(_disclaimer_section(styles, analysis))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()

    logger.info("Generated PDF report: %d bytes", len(pdf_bytes))
    return pdf_bytes

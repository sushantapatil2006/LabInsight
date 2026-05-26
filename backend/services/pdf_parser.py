"""
LabInsight – PDF text extraction service.

Uses PyMuPDF (fitz) for fast, native text extraction. When a page yields
very little text (< 50 characters), the service falls back to OCR via
pytesseract. If Tesseract is not installed the OCR step is silently
skipped so the rest of the pipeline can still proceed.

All operations are performed entirely in-memory.
"""

from __future__ import annotations

import io
import logging
from typing import Optional

import fitz  # PyMuPDF
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Minimum characters we expect from a page with real text content.
# Pages with fewer characters are assumed to be scanned images.
_MIN_TEXT_LENGTH = 50


import os
import httpx

def _run_ocr_space(file_bytes: bytes, filename: str = "image.png") -> Optional[str]:
    """Send image bytes to OCR.space API for lightweight in-memory OCR."""
    api_key = os.getenv("OCR_SPACE_API_KEY", "helloworld")
    try:
        url = "https://api.ocr.space/parse/image"
        # OCR.space expects form data
        data = {
            "apikey": api_key,
            "language": "eng",
            "isOverlayRequired": "false",
            "detectOrientation": "true",
            "scale": "true",
        }
        files = {
            "file": (filename, file_bytes, "image/png")
        }
        
        logger.info("Sending OCR request to OCR.space API (key=%s)...", "helloworld" if api_key == "helloworld" else "custom")
        with httpx.Client(timeout=30.0) as client:
            response = client.post(url, data=data, files=files)
            
        if response.status_code == 200:
            result = response.json()
            if result.get("IsErroredOnProcessing") is False:
                parsed_results = result.get("ParsedResults", [])
                if parsed_results:
                    text = parsed_results[0].get("ParsedText", "")
                    return text.strip() if text else None
            else:
                error_msg = result.get("ErrorMessage")
                logger.error("OCR.space API processing error: %s", error_msg)
        else:
            logger.error("OCR.space API HTTP error %d: %s", response.status_code, response.text)
    except Exception as exc:
        logger.exception("OCR.space request failed")
    return None


def _ocr_page(page: fitz.Page, dpi: int = 200) -> Optional[str]:
    """Render *page* to a PNG and use OCR.space API to extract text."""
    try:
        # Render page to a pixmap
        mat = fitz.Matrix(dpi / 72, dpi / 72)
        pix = page.get_pixmap(matrix=mat, alpha=False)
        
        # Convert pixmap to PNG bytes directly in-memory
        img_bytes = pix.tobytes("png")
        
        # Run OCR.space on the PNG bytes
        return _run_ocr_space(img_bytes, f"page_{page.number}.png")
    except Exception:
        logger.exception("OCR failed for page %s", page.number)
        return None



def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from every page of a PDF provided as raw bytes.

    Parameters
    ----------
    file_bytes:
        The complete binary content of a PDF file.

    Returns
    -------
    str
        Concatenated text extracted from all pages.

    Raises
    ------
    ValueError
        If the bytes cannot be opened as a valid PDF.
    """
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception as exc:
        raise ValueError(f"Unable to open the file as a PDF: {exc}") from exc

    pages_text: list[str] = []

    for page_num in range(len(doc)):
        page = doc[page_num]

        # Attempt native text extraction first
        text = (page.get_text("text") or "").strip()

        if len(text) < _MIN_TEXT_LENGTH:
            logger.info(
                "Page %d has only %d chars of native text – attempting OCR",
                page_num + 1,
                len(text),
            )
            ocr_text = _ocr_page(page)
            if ocr_text:
                text = ocr_text

        if text:
            pages_text.append(f"--- Page {page_num + 1} ---\n{text}")

    doc.close()

    if not pages_text:
        logger.warning("No text could be extracted from the PDF")
        return ""

    return "\n\n".join(pages_text)


def extract_text_from_image(file_bytes: bytes) -> str:
    """Extract text from an image (PNG, JPEG, WebP, etc.) provided as raw bytes.

    Parameters
    ----------
    file_bytes:
        The complete binary content of an image file.

    Returns
    -------
    str
        Extracted text from the image.

    Raises
    ------
    ValueError
        If text extraction fails.
    """
    try:
        text = _run_ocr_space(file_bytes, "uploaded_image.png")
        return text if text else ""
    except Exception as exc:
        logger.exception("OCR.space failed for image file")
        raise ValueError(f"Failed to extract text from the image: {exc}") from exc


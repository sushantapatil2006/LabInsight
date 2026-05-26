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


# Singleton reader to avoid reloading models for every page
_easyocr_reader = None

def _ocr_page(page: fitz.Page, dpi: int = 200) -> Optional[str]:
    """Render *page* to an image and use EasyOCR to extract text."""
    global _easyocr_reader
    try:
        import easyocr
        import numpy as np
    except ImportError:
        logger.warning("easyocr not installed, skipping OCR")
        return None

    try:
        if _easyocr_reader is None:
            # Initialize reader (will download models on first run if not present)
            # verbose=False prevents the UnicodeEncodeError progress bar crash on Windows
            _easyocr_reader = easyocr.Reader(['en'], gpu=False, verbose=False)

        # Render page to a pixmap
        mat = fitz.Matrix(dpi / 72, dpi / 72)
        pix = page.get_pixmap(matrix=mat, alpha=False)
        
        # Convert pixmap to numpy array (RGB)
        img_data = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
        if pix.n == 4:
            # Drop alpha channel
            img_data = img_data[:, :, :3]

        # Read text
        results = _easyocr_reader.readtext(img_data, detail=0)
        text = "\n".join(results)
        
        return text.strip() if text else None
    except Exception:
        logger.exception("EasyOCR failed for page %s", page.number)
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
        If easyocr is not installed or text extraction fails.
    """
    global _easyocr_reader
    try:
        import easyocr
        import numpy as np
        from PIL import Image
    except ImportError as exc:
        raise ValueError(f"Required OCR libraries (easyocr, numpy, Pillow) are not installed: {exc}")

    try:
        if _easyocr_reader is None:
            # Initialize reader with verbose=False to prevent progress bar Unicode crash
            _easyocr_reader = easyocr.Reader(['en'], gpu=False, verbose=False)

        # Open image using Pillow in-memory
        img = Image.open(io.BytesIO(file_bytes))
        
        # Convert image to RGB numpy array
        img_rgb = img.convert("RGB")
        img_data = np.array(img_rgb)

        # Read text
        results = _easyocr_reader.readtext(img_data, detail=0)
        text = "\n".join(results)
        
        return text.strip() if text else ""
    except Exception as exc:
        logger.exception("EasyOCR failed for image file")
        raise ValueError(f"Failed to extract text from the image: {exc}") from exc


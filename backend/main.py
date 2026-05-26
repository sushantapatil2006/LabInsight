"""
LabInsight – FastAPI application entry-point.

Exposes the following endpoints:

- POST /api/upload-and-analyze  – Upload a lab-report PDF → AI analysis JSON
- POST /api/generate-pdf        – Convert AnalysisResult JSON → downloadable PDF
- POST /api/reset               – Stateless reset (no-op, returns cleared)
- GET  /api/health              – Health-check
"""

from __future__ import annotations

import logging
from io import BytesIO

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from models.schemas import AnalysisResult
from services.pdf_parser import extract_text_from_pdf, extract_text_from_image
from services.lab_extractor import extract_lab_values
from services.groq_analyzer import analyze_report
from services.pdf_generator import generate_analysis_pdf

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# App & middleware
# ---------------------------------------------------------------------------

app = FastAPI(
    title="LabInsight API",
    description="AI-powered laboratory health report analyser",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024  # 20 MB
ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "application/x-pdf",
    "application/octet-stream",  # some browsers send this for PDFs
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
}


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/")
async def root_welcome():
    """Welcome and health endpoint at the API root."""
    return {
        "status": "healthy",
        "message": "LabInsight API is online. Use POST /api/upload-and-analyze to analyze laboratory health reports."
    }


@app.get("/api/health")
async def health_check():
    """Simple health-check endpoint."""
    return {"status": "healthy"}


@app.post("/api/reset")
async def reset():
    """Stateless reset – nothing to clear, but the frontend expects the route."""
    return {"status": "cleared"}


@app.post("/api/upload-and-analyze", response_model=AnalysisResult)
async def upload_and_analyze(file: UploadFile = File(...)):
    """Accept a PDF lab report, extract data, and return an AI analysis.

    The entire pipeline runs in-memory: no file is ever written to disk.
    """
    # --- Validate file type ---
    filename = file.filename or ""
    is_pdf = filename.lower().endswith(".pdf")
    is_image = any(filename.lower().endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".webp"])

    if not (is_pdf or is_image):
        if file.content_type not in ALLOWED_CONTENT_TYPES:
            raise HTTPException(
                status_code=400,
                detail="Only PDF and image files (PNG, JPEG, WebP) are accepted.",
            )

    # --- Read file bytes (in-memory) ---
    file_bytes = await file.read()

    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # --- Validate size ---
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum allowed size is {MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB.",
        )

    # --- Step 1: Extract text from PDF or Image ---
    try:
        if is_pdf or file.content_type in {"application/pdf", "application/x-pdf"}:
            raw_text = extract_text_from_pdf(file_bytes)
        else:
            raw_text = extract_text_from_image(file_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logger.exception("Text extraction failed")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to extract text from the file: {exc}",
        )

    if not raw_text.strip():
        raise HTTPException(
            status_code=422,
            detail="Could not extract any text from the uploaded file. "
                   "The file may be image-only, poor quality, or OCR was unable to read it.",
        )

    # --- Step 2: Extract structured lab values ---
    try:
        extracted_data = extract_lab_values(raw_text)
    except Exception as exc:
        logger.exception("Lab value extraction failed")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to extract lab values: {exc}",
        )

    # --- Step 3: AI analysis via Groq ---
    try:
        analysis = analyze_report(extracted_data)
    except RuntimeError as exc:
        # Missing API key or config issue
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        logger.exception("Groq analysis failed")
        raise HTTPException(
            status_code=500,
            detail=f"AI analysis failed: {exc}",
        )

    logger.info(
        "Analysis complete – status=%s, lab_values=%d, abnormal=%d",
        analysis.overall_status.value,
        len(analysis.lab_values),
        len(analysis.abnormal_markers),
    )

    return analysis


@app.post("/api/generate-pdf")
async def generate_pdf(analysis: AnalysisResult):
    """Convert a previously obtained AnalysisResult into a downloadable PDF."""
    try:
        pdf_bytes = generate_analysis_pdf(analysis)
    except Exception as exc:
        logger.exception("PDF generation failed")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate PDF: {exc}",
        )

    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=LabInsight_Report.pdf",
        },
    )

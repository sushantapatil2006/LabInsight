const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:8000`
    : "http://localhost:8000");

/**
 * Upload a lab report PDF and get AI analysis
 * @param {File} file - The PDF file to analyze
 * @returns {Promise<Object>} - The analysis result JSON
 */
export async function uploadAndAnalyze(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${BACKEND_URL}/api/upload-and-analyze`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message =
        errorData?.detail ||
        getErrorMessage(response.status);
      throw new Error(message);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === "TypeError" && error.message === "Failed to fetch") {
      throw new Error(
        "Unable to connect to the analysis server. Please ensure the backend is running and try again."
      );
    }
    throw error;
  }
}

/**
 * Generate a PDF report from analysis data
 * @param {Object} analysisData - The analysis data to generate PDF from
 * @returns {Promise<Blob>} - The generated PDF as a Blob
 */
export async function generatePdf(analysisData) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/generate-pdf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(analysisData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.detail || "Failed to generate PDF report. Please try again."
      );
    }

    const blob = await response.blob();
    return blob;
  } catch (error) {
    if (error.name === "TypeError" && error.message === "Failed to fetch") {
      throw new Error(
        "Unable to connect to the server. Please check your connection and try again."
      );
    }
    throw error;
  }
}

/**
 * Reset the current session
 * @returns {Promise<Object>}
 */
export async function resetSession() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/reset`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Failed to reset session.");
    }

    return await response.json();
  } catch (error) {
    // Silently handle reset errors — not critical
    console.warn("Session reset failed:", error.message);
    return { status: "reset_failed" };
  }
}

function getErrorMessage(status) {
  switch (status) {
    case 400:
      return "Invalid file. Please upload a valid PDF lab report.";
    case 413:
      return "File is too large. Please upload a file smaller than 20MB.";
    case 415:
      return "Unsupported file type. Please upload a PDF file.";
    case 422:
      return "Could not process this file. Please ensure it is a valid lab report PDF.";
    case 500:
      return "An internal server error occurred. Please try again later.";
    case 503:
      return "The analysis service is temporarily unavailable. Please try again in a moment.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
}

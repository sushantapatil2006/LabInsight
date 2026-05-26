# 🧬 LabInsight – Instant Lab Report Analyzer

**AI-powered laboratory health report interpretation in seconds.**

LabInsight is a full-stack web application that allows users to upload a laboratory health report PDF, instantly receive a detailed AI-powered medical analysis, and optionally download the analysis as a PDF. The app is completely stateless — no authentication, no database, no persistent storage.

---

## ✨ Features

- **📄 PDF Upload** — Drag-and-drop or browse to upload lab report PDFs (up to 20MB)
- **🤖 AI Analysis** — Powered by Groq API (Llama 3) for fast, detailed medical interpretation
- **📊 Results Dashboard** — Interactive visualizations including risk meter, abnormal markers table, and recommendations
- **📥 PDF Export** — Download a professionally formatted analysis report
- **🔒 Privacy First** — All processing is in-memory; no files are ever stored on the server
- **🎨 Premium UI** — Beautiful healthcare-themed design with smooth animations

---

## 🏗️ Architecture

```
┌─────────────────────┐       ┌─────────────────────────────────┐
│   Next.js Frontend  │ HTTP  │       FastAPI Backend            │
│   (Port 3000)       │◄─────►│       (Port 8000)               │
│                     │       │                                 │
│ • React + Tailwind  │       │ • PDF Parsing (PyMuPDF)         │
│ • Framer Motion     │       │ • OCR Fallback (Tesseract)      │
│ • Recharts          │       │ • Lab Value Extraction (Regex)  │
│ • ShadCN-style UI   │       │ • AI Analysis (Groq API)        │
│                     │       │ • PDF Generation (ReportLab)    │
└─────────────────────┘       └─────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18.x
- **Python** ≥ 3.10
- **Groq API Key** — Get one at [console.groq.com](https://console.groq.com)
- **Tesseract OCR** (optional) — For scanned PDF support

### 1. Clone & Setup Backend

```bash
cd labinsight/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
```

### 2. Start Backend

```bash
cd labinsight/backend
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. Check the docs at `http://localhost:8000/docs`.

### 3. Setup & Start Frontend

```bash
cd labinsight/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GROQ_API_KEY` | ✅ Yes | — | Your Groq API key |
| `GROQ_MODEL` | No | `llama-3.3-70b-versatile` | Groq model to use |

### Frontend (`frontend/.env.local`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:8000` | Backend API URL |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload-and-analyze` | Upload PDF → AI analysis JSON |
| `POST` | `/api/generate-pdf` | Analysis JSON → downloadable PDF |
| `POST` | `/api/reset` | Clear session (stateless no-op) |
| `GET` | `/api/health` | Health check |

---

## 🛡️ Privacy & Security

- **No file storage** — PDFs are processed entirely in memory and discarded immediately
- **No database** — Zero persistent storage of any kind
- **No authentication** — Completely anonymous usage
- **No logging of report content** — Only operational logs (errors, timing)
- **Stateless architecture** — Each request is independent

---

## 📋 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js, React, Tailwind CSS, Framer Motion, Recharts, Lucide Icons |
| Backend | Python FastAPI, Uvicorn |
| AI | Groq API, Llama 3.3 70B |
| PDF Parsing | PyMuPDF (fitz) |
| OCR | Tesseract (optional fallback) |
| PDF Generation | ReportLab |

---

## 📄 License

This project is for educational and portfolio purposes. Not intended for clinical use.

**Medical Disclaimer**: This AI-generated analysis is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.

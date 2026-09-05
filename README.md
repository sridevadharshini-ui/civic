# CIVICFLOW - AI-Based Packaged Commodity Compliance & Inspection System

**SMART INDIA HACKATHON 2026**
**Problem Domain:** Legal Metrology / Packaged Commodities Compliance (Rule 6 of LMPC Rules, 2011)

---

## 1. Project Overview

**CivicFlow** is an enterprise-grade AI-powered packaged commodity compliance checking and inspection support system.

The application empowers **Legal Metrology Inspectors**, **System Administrators**, and **Public Consumers** to capture/upload images of pre-packaged commodities and automatically:
1. Assess image quality (blur, contrast, illumination).
2. Run OpenCV pre-processing & computer vision OCR.
3. Extract mandatory Legal Metrology Rule 6 declarations (MRP, Net Qty, Mfg/Packing Date, Manufacturer/Packer/Importer Details, Country of Origin, Consumer Care Cell).
4. Classify product category (Food, Beverage, Cosmetics, Household, Personal Care, Electrical, etc.).
5. Run configurable Legal Metrology Rule Engine checks.
6. Calculate **CivicFlow Preliminary Compliance Score (0–100)** & assign dynamic Risk Ratings (**LOW**, **MEDIUM**, **HIGH**, **CRITICAL**).
7. Display explainable bounding box evidence overlays.
8. Enable human-in-the-loop field edits & audit logging.
9. Export official downloadable PDF Inspection Reports.
10. Manage consumer grievances & geo-tagged inspection maps.

---

## 2. Technology Stack

- **Frontend:** React.js, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, Leaflet, React Router, Axios.
- **Backend:** Python 3.11, FastAPI, Pydantic v2, SQLAlchemy 2.0, ReportLab PDF, PyJWT, Passlib (bcrypt).
- **Database:** PostgreSQL (Production) / SQLite (Lightweight local fallback).
- **AI & Computer Vision:** OpenCV pre-processor, Tesseract OCR, NLP regex & pattern parser, fuzzy matcher.
- **DevOps:** Docker, Docker Compose.

---

## 3. Quick Start & Execution Commands

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker & Docker Compose (Optional for containerized run)

---

### Option A: One-Command Docker Setup (Recommended)

```bash
docker-compose up --build
```
- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:8000](http://localhost:8000)
- **Swagger Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option B: Local Environment Setup

#### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python seed_data.py
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 4. Demo Login Credentials

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **Legal Inspector** | `inspector@civicflow.gov.in` | `inspector123` | Label scanning, OCR verification, evidence viewer, PDF report export, inspection history |
| **System Admin** | `admin@civicflow.gov.in` | `admin123` | Rule engine CRUD, rule versioning, user directory, analytics oversight |
| **Public Consumer** | `consumer@civicflow.gov.in` | `consumer123` | Public scanner, grievance filing, complaint tracking |

*(Note: On the login page, quick demo buttons are available for instant one-click login).*

---

## 5. Main Features Completed

- [x] **Role-Based Access Control (RBAC)** (Admin, Inspector, Consumer).
- [x] **Product Scanning Module** (Image upload, quality check rating: Good/Moderate/Poor, angle selection, demo presets).
- [x] **Computer Vision & AI Extraction** (MRP, Net Qty, Mfg Date, Country of Origin, Customer Care Cell).
- [x] **Configurable Rule Engine** (Database-driven Legal Metrology Rule 6 checks).
- [x] **Dynamic Risk Scoring** (0-100 score calculation & LOW/MEDIUM/HIGH/CRITICAL risk assignment).
- [x] **Explainable Evidence System** (Interactive Bounding Box Evidence Viewer modal).
- [x] **Human-in-the-Loop Override** (Inspector field editing & dynamic score recalculation).
- [x] **Downloadable PDF Reports** (Official preliminary assessment report generated via ReportLab).
- [x] **Geo-Tagged Map Analytics** (Leaflet map displaying inspection locations & Recharts graphs).
- [x] **Consumer Grievance Cell** (Complaint filing & status tracker).

---

## 6. Statutory Legal Disclaimer

> **IMPORTANT DISCLAIMER:** CivicFlow is designed as an **Inspection Support Tool** and **Preliminary Compliance Assessment System**. Automated OCR predictions, AI field extractions, and preliminary compliance scores do **not** constitute legally binding determinations. Final statutory legal determination and enforcement belong exclusively to competent statutory authorities under the Legal Metrology Act, 2009.

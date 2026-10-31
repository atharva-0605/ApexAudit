# ApexAudit 🛡️

> **Intelligent Decision-Readiness Web Platform**
> 
> *Know what you don't know before you decide. Evaluates how ready your collected information is for real-world decisions before you act. Surfaces missing requirements, conflicting claims, outdated rules, and echo sources with quote-grounded verification and a live Decision Readiness Score.*

---

## 🏗️ Architecture & Monorepo Structure

```
ApexAudit/
├── PRD.md                          # Product Requirements Document
├── README.md                       # Project overview and run guide
├── package.json                    # Root monorepo scripts
├── .gitignore                      # Git ignore rules for Next.js & Python
│
├── frontend/                       # Next.js 14+ (App Router, TypeScript, Tailwind CSS)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx          # Root layout with navigation & theme
│   │   │   ├── page.tsx            # Main Decision-Readiness Workspace
│   │   │   ├── globals.css         # Global styles & design system
│   │   │   └── api/                # Next.js API proxy routes
│   │   ├── components/             # Reusable UI components
│   │   │   ├── EvidenceMatrix.tsx  # Aspects × Sources matrix
│   │   │   ├── ConflictDetector.tsx# Side-by-side claim conflict cards
│   │   │   ├── EchoGraph.tsx       # Independence & echo source graph
│   │   │   ├── TrustDashboard.tsx  # 3-lane trust dashboard
│   │   │   ├── VerificationKit.tsx # Impact × Uncertainty checklist & emails
│   │   │   └── ReadinessScore.tsx  # Live score meter & penalty breakdown
│   │   └── lib/                    # Types, API client, and utilities
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.ts
│
└── backend/                        # FastAPI Python 3.12 Backend
    ├── requirements.txt            # Python dependencies (FastAPI, uvicorn, pydantic, etc.)
    ├── app/
    │   ├── main.py                 # FastAPI application & CORS configuration
    │   ├── config.py               # Application settings
    │   ├── models/
    │   │   └── schemas.py          # Pydantic data schemas
    │   ├── services/
    │   │   ├── blueprint_service.py   # Pre-mortem blueprint generator
    │   │   ├── verifier_service.py    # Strict verbatim quote verifier
    │   │   ├── conflict_service.py    # Conflict & temporal drift detection
    │   │   ├── independence_service.py# Source echo & syndication detector
    │   │   ├── readiness_service.py   # Live Readiness Score & Verification Kit
    │   │   └── source_service.py      # URL fetcher, parser & demo pack loader
    │   ├── routes/
    │   │   ├── blueprint.py        # POST /api/blueprint/generate
    │   │   ├── sources.py          # GET /api/sources/demos, POST /api/sources/fetch
    │   │   ├── analyze.py          # POST /api/analyze
    │   │   └── verify.py           # POST /api/verify/mark
    │   └── data/
    │       └── demo_csss.json      # Pre-cached CSSS Scholarship demo pack
    └── venv/                       # Python Virtual Environment
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (tested on v24.13.0)
- **Python**: 3.10+ (tested on Python 3.12.0)
- **npm** or **pnpm**

---

### 1. Backend Setup & Run

Open a terminal in the `backend/` directory:

```bash
cd backend

# Create virtual environment (if not already created)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

The backend API will be live at:
- **API Root**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

### 2. Frontend Setup & Run

In a separate terminal, navigate to the `frontend/` directory:

```bash
cd frontend

# Install dependencies (if not already installed)
npm install

# Start Next.js development server
npm run dev
```

The frontend will be running at [http://localhost:3000](http://localhost:3000).

---

## 🌟 Key Features Fulfilling PRD Requirements

1. **Goal & Multi-Source Ingestor**:
   - Accepts any decision goal (e.g. CSSS Scholarship renewal, Visa application, Business licensing).
   - Ingests URLs via live scraper, text extraction, pasted-text fallback, and 1-click **CSSS Demo Pack**.
2. **Pre-Mortem Blueprint Generator**:
   - Generates catastrophic failure scenarios worked backward into required knowledge items with criticality weights (`HIGH`, `MEDIUM`, `LOW`).
   - Interactive user-editable blueprint.
3. **Strict Quote Verifier**:
   - Every finding and claim is verified verbatim against the source's raw text.
   - Any hallucinated or ungrounded claim is discarded.
4. **Coverage & Conflict Analysis**:
   - **Evidence Matrix (Aspects × Sources)**: Color-coded cells (*Covered*, *Conflicting*, *Outdated*, *Missing*).
   - **Conflict Detector**: Side-by-side contrasting quotes and values with severity indicators.
   - **Temporal Drift**: Identifies outdated publication years and obsolete circular citations.
   - **Source Independence Graph**: Detects echo sources where blogs copy each other verbatim.
5. **Readiness Score & Verification Kit**:
   - **Live Decision Readiness Score (0-100)**: Dynamically adjusted for coverage, conflicts, echoes, and freshness.
   - **Prioritized Checklist**: Ranked by `Impact × Uncertainty`.
   - **Actionable Verification Kit**: Official portal links, customized draft clarification emails, and **"Mark as Verified"** action that updates the live score in real time.
   - **Three-Lane Trust Dashboard**: Quote-grounded facts, AI-suggested rules, and Not Found gaps.

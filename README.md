# IndusTrace AI: Uncertainty-Aware Manufacturing Waste Investigation & Resource Recovery Decision Support System

A University IDEA Lab Project for **Semester V, Session 2026–27**.

### Team Members
- **Deeya Saoji** — Roll No. 50 — Section A3_B4
- **Simran Chawla** — Roll No. 28 — Section A3_B2
- **Shriram Gosavi** — Roll No. 58 — Section A3_B4
- **Anushree Agrawal** — Roll No. 45 — Section A3_B3
- **Project Guide:** Dr. Abhishek Sahu

---

## 1. Project Overview & Core Novelty

Industrial manufacturing produces heterogeneous, uncharacterized waste streams (e.g., precision machining swarf, electroplating sludges, metallurgical dross, solvent residues). Investigating every stream involves costly laboratory assays, logistics, and engineering hours.

**The Core Problem:** Prioritizing waste investigations **under incomplete information**, rather than merely matching known scrap with recycling dealers.

**IndusTrace AI** is an explainable decision-support system that:
1. Registers manufacturing facilities and waste streams while explicitly flagging unknown data.
2. Compares waste streams against a **Waste Intelligence Repository (WIR)** seeded with research literature.
3. Computes a transparent, reproducible **Test Worthiness Score (TWS)** on a 0–100 scale using 6 prototype weights.
4. Ranks streams by investigation priority to determine which waste stream should be sent to the lab first.
5. Ingests certified laboratory results while preserving reported analytical qualifiers (`<0.030`, `ND`, `bal.`).
6. Automatically recalculates TWS and missing-information gaps when laboratory results are entered.
7. Computes mass-balance recovery quantities and net economics when valid assay fractions are provided, preventing gross revenue from posing as net profit.
8. Generates explainable, rule-based recommendations with attached literature citations and known limitations.
9. Exports genuine, professional PDF reports for executive, technical, and strategic decision pathways.

---

## 2. Mandatory Scientific & Engineering Boundaries

- **No Composition Hallucinations:** The system does not infer exact chemical composition or metal concentrations from textual descriptions alone.
- **Process Matching is Screening Only:** A process match indicates a *candidate* characteristic, not proof of composition.
- **Data Source Boundaries:** Public arrival/logistics data (Plant C Zenodo 17633305) and public experimental melts (CAESAR Zenodo 15737122) are kept strictly separate from company plant records.
- **Transparent Prototype Weights:** TWS factor weights are documented prototype engineering assumptions configured in `TWS_Prototype_Config.csv`.
- **Decision-Support Guardrail:** Outputs are decision-support aids, not regulatory clearance certificates or hazardous waste disposal approvals.

---

## 3. Technology Stack & Security Architecture

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Recharts, Lucide React, React Router v6.
- **Backend:** Python 3.13, FastAPI, SQLAlchemy 2.0, SQLite (local file in `backend/data/industrace.db`), Pydantic v2, Pandas, NumPy, ReportLab.
- **Security & Multi-Tenant Isolation:**
  - Password Hashing: Industry-standard **Bcrypt** with random salt (`$2b$`).
  - Session Management: Cryptographically signed **HMAC-SHA256 JWT tokens** with 72-hour expiry.
  - Strict Authorization: No fallback to default company/user; every data route verifies authenticated company ownership.
  - Cross-Tenant Enforcement: Returns 403 Forbidden on attempts to query, update, delete, or export data belonging to another tenant.
- **Testing:** Pytest with FastAPI TestClient running against an **isolated test database** (`test_industrace_isolated.db`) so production data is protected.

---

## 4. Folder Structure

```text
IndusTrace-AI/
├── frontend/                     # React + Vite + TypeScript application
│   ├── public/images/            # Curated local industrial photography assets
│   ├── src/
│   │   ├── components/           # Sidebar, Header, ScientificNotice
│   │   ├── context/              # AuthContext (multi-tenant JWT sessions)
│   │   ├── pages/                # 11 Reference panels & Dedicated Research Console
│   │   ├── services/             # API client with full TypeScript interfaces
│   │   ├── App.tsx               # Client router
│   │   └── main.tsx              # Application entrypoint
│   └── package.json
├── backend/                      # FastAPI Python application
│   ├── app/
│   │   ├── database/             # SQLite connection and session management
│   │   ├── models/               # SQLAlchemy ORM entities & Pydantic schemas
│   │   ├── services/             # Data loading, CAESAR ingestion, ReportLab PDF generators
│   │   ├── decision_engine/      # Transparent matcher, TWS scorer, recommender
│   │   ├── recovery/             # Mass balance and economic calculator
│   │   └── main.py               # API routes, JWT auth, and CORS configuration
│   ├── data/                     # Local SQLite database location (industrace.db)
│   └── requirements.txt
├── dataset/                      # Extracted dataset package & raw Zenodo records
├── docs/                         # Architecture diagrams and research methodology
├── tests/                        # Pytest suite with isolated test DB fixture
└── README.md
```

---

## 5. How to Run IndusTrace AI Locally on Windows

Follow these steps using two separate Command Prompt (CMD) or PowerShell terminals.

### Terminal 1 — Backend (FastAPI)

```powershell
cd C:\Users\VICTUS\Desktop\IndusTrace-AI

# 1. Install backend dependencies (if not already installed)
pip install -r backend\requirements.txt

# 2. Run the FastAPI backend server
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```
*API docs accessible at:* `http://127.0.0.1:8000/docs`
*Health Check endpoint:* `http://127.0.0.1:8000/api/health`

### Terminal 2 — Frontend (Vite + React)

```powershell
cd C:\Users\VICTUS\Desktop\IndusTrace-AI\frontend

# 1. Install npm packages (if not already installed)
npm install

# 2. Start the Vite development server
npm run dev
```
*Web application accessible at:* `http://localhost:5173`

---

## 6. How to Run Backend Tests & Verify Build

### Run Pytest Suite (13/13 passing on isolated test DB)
```powershell
cd C:\Users\VICTUS\Desktop\IndusTrace-AI
python -m pytest tests\test_backend.py -v
```
*All 13 tests pass:*
1. `test_health_check` — Project metadata & guide verification.
2. `test_auth_and_tamper_protection` — Rejection of unauthenticated / tampered tokens (401).
3. `test_company_registration_and_login_lifecycle` — 3-step registration & bcrypt login.
4. `test_waste_stream_persistence_and_deletion` — Full stream persistence & cascade deletion.
5. `test_wir_matching_relevance` — Keyword & category alignment against literature.
6. `test_tws_scoring_and_factor_breakdown` — 6-factor normalization summing to 100%.
7. `test_laboratory_assay_lifecycle_and_assessment_recalculation` — Qualifier preservation & automated assessment update.
8. `test_unit_normalization_and_recovery_economics` — Mass-balance formula accuracy.
9. `test_missing_data_recovery_guardrail` — Prevention of phantom profits when costs/quantities missing.
10. `test_dynamic_tws_config_loader` — CSV loader validation and fallback.
11. `test_recovery_analysis_linked_assay_validation` — Assay linkage enforcement and material compatibility check.
12. `test_multi_tenant_company_isolation` — Cross-tenant isolation (Tenant A cannot see or manipulate Tenant B's streams).
13. `test_pdf_report_generation_and_tenant_security` — Genuine ReportLab PDF generation and download delivery.

### Run Frontend Production Build Check (0 errors)
```powershell
cd C:\Users\VICTUS\Desktop\IndusTrace-AI\frontend
npm run build
```

---

## 7. Seminar Demonstration Script (October 24, 2026)

To demonstrate the full end-to-end platform during the seminar presentation:

1. **Open Landing Page (`/`):**
   - Review problem statement: Investigating heterogeneous manufacturing waste under incomplete information.
   - Show research grounding, team details, and design theme (sage-green & off-white).

2. **Login or Register (`/signin` or `/create-account`):**
   - Use default demo credentials:
     - **Email:** `simran@abcmfg.com`
     - **Password:** `password123`
   - Or register a new company via the 3-step wizard (Company Details $\rightarrow$ Admin Account $\rightarrow$ Review & Launch).

3. **Dashboard & Facilities (`/app/dashboard` & `/app/facilities`):**
   - Inspect facility cards and real-time metrics computed strictly from DB queries.
   - Add a facility and register a new waste stream with quantity, frequency, and estimated handling costs.

4. **Investigation Priority & TWS Scoring (`/app/investigation`):**
   - View the circular TWS gauge and the 6-factor horizontal bars.
   - Review transparent factor contributions and the explainable decision recommendation.

5. **Laboratory Assays (`/app/laboratory`):**
   - Record an accredited laboratory assay (e.g. Optical Emission Spectroscopy, Zn 5.62 wt%).
   - Preserves analytical qualifiers (`<0.030`, `ND`, `bal.`).
   - Notice how the TWS and information gaps update automatically upon saving the assay.

6. **Recovery & Economic Analysis (`/app/recovery`):**
   - Mode A (Confirmed Assay): Computes mass-balance yield linked to the verified assay.
   - Mode B (Hypothetical Exploration): Explicitly labeled as a hypothetical scenario for planning.
   - Notice that if operational processing costs are unrecorded, gross material value is not presented as profit.

7. **Generate & Download Genuine PDF Reports (`/app/recommendations`):**
   - Click "Executive Summary (PDF)", "Technical Report (PDF)", or "Recommendations (PDF)".
   - Real, styled PDF files are generated on the server and downloaded directly to browser Downloads.

8. **Research Intelligence & Provenance Console (`/console`):**
   - Internal console showing the **Waste Intelligence Repository (WIR)** literature citations and the **Data Provenance Register** tracking Zenodo datasets without cluttering customer operational navigation.

9. **Multi-Tenant Security Proof:**
   - Log out, log in as another company or create a second tenant.
   - Demonstrate that Tenant A's private streams, facilities, assays, and PDF reports are completely invisible to Tenant B.

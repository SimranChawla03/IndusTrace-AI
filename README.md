# IndusTrace AI

### An Uncertainty-Aware Industrial Waste Investigation and Resource Recovery Decision Support System

[![Frontend Status](https://img.shields.io/badge/Frontend-Vercel%20Live-brightgreen)](https://indus-trace-ai-beta.vercel.app/)
[![Backend API](https://img.shields.io/badge/Backend-Render%20Live-blue)](https://industrace-ai-backend.onrender.com/api/health)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%2016%20%7C%20SQLite3-purple)](#dual-engine-database-architecture)
[![Pytest Suites](https://img.shields.io/badge/Tests-25%20Passed%20%2F%200%20Failed-success)](tests/test_backend.py)
[![Academic Affiliation](https://img.shields.io/badge/Ramdeobaba%20University-Idea%20Lab%202026--27-orange)](#team)

- **Production Frontend (Vercel):** [https://indus-trace-ai-beta.vercel.app/](https://indus-trace-ai-beta.vercel.app/)
- **Production Backend API (Render):** [https://industrace-ai-backend.onrender.com/](https://industrace-ai-backend.onrender.com/)
- **Interactive Swagger/OpenAPI Docs:** [https://industrace-ai-backend.onrender.com/docs](https://industrace-ai-backend.onrender.com/docs)
- **Source Code Repository:** [https://github.com/SimranChawla03/IndusTrace-AI](https://github.com/SimranChawla03/IndusTrace-AI)

---

## Table of Contents
- [Executive Overview](#executive-overview)
- [The Core Challenge: Compositional Uncertainty](#the-core-challenge-compositional-uncertainty)
- [System Architecture & Technology Stack](#system-architecture--technology-stack)
- [Key Features](#key-features)
- [The Mathematical Decision Engine (TWS & Economics)](#the-mathematical-decision-engine-tws--economics)
- [Dual-Engine Database Architecture (PostgreSQL + SQLite)](#dual-engine-database-architecture)
- [Empirical Dataset Integration](#empirical-dataset-integration)
- [Local Development & Quickstart](#local-development--quickstart)
- [Automated Verification & Test Suites](#automated-verification--test-suites)
- [Project Documentation & Deliverables](#project-documentation--deliverables)
- [Team & Institutional Credits](#team--institutional-credits)

---

## Executive Overview

Industrial manufacturing facilities (automotive fabrication, foundry casting, CNC machining, electroplating) generate hundreds of tons of metal turnings, casting dross, spent wash, and hazardous residues annually. 

Historically, manufacturing companies have viewed these streams as disposal liabilities, paying waste haulers for landfill dumping or selling uncharacterized scrap for fractions of its true metallurgical value. 

**IndusTrace AI** is an uncertainty-aware, multi-company decision-support web platform. It enables industrial manufacturers to:
1. Register companies, facilities, manufacturing processes, and waste streams.
2. Identify critical missing chemical and physical characterization parameters.
3. Compute a transparent, deterministic **Test Worthiness Score (TWS)** to prioritize which streams warrant expenditure on laboratory assays.
4. Record and review laboratory spectrometry measurements (ICP-OES, XRD, moisture assays).
5. Simulate circular recovery scenarios evaluating mass balances, recovery yields, and net economic viability ($/ton).
6. Automatically generate audit-ready **Executive Summary** and **Technical Characterization** PDF reports.

---

## The Core Challenge: Compositional Uncertainty

The primary bottleneck preventing circular reuse in manufacturing is **compositional uncertainty**. 

If a manufacturing plant sells aluminium turning scrap containing unknown quantities of iron (> 0.2%) or cutting coolant moisture (> 2.0%), secondary smelters reject the feedstock due to melt contamination. However, testing every barrel indiscriminately in commercial testing laboratories is financially prohibitive.

IndusTrace AI solves this by functioning as an **intelligent triage system**: it quantifies missingness uncertainty against required testing parameters, weighs hazard severity and generation volumes, and directs capital toward laboratory testing only when the secondary resource recovery value outweighs the assay expense.

---

## System Architecture & Technology Stack

IndusTrace AI is built as a cloud-native, decoupled 4-tier application:

```
┌────────────────────────────────────────────────────────┐
│  Presentation Layer: React 18 + Vite 5 + Tailwind CSS   │
│  - Sage-green & Off-white sustainability visual palette│
│  - Interactive Recharts priority grids & scenario math │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTPS / RESTful API (JWT Bearer)
┌──────────────────────────▼─────────────────────────────┐
│  Application Layer: Python 3.13 + FastAPI 0.115        │
│  - Asynchronous request pipeline (sub-15ms latency)     │
│  - Pydantic v2 strict payload validation               │
│  - Multi-tenant tenant isolation middleware            │
└──────────────────────────┬─────────────────────────────┘
                           │
       ┌───────────────────┴───────────────────┐
       ▼                                       ▼
┌───────────────────────────────┐ ┌──────────────────────────────┐
│ Analytics & Decision Engine   │ │ Dual-Engine Persistence      │
│ - TWS Matrix Scoring Engine   │ │ - Cloud: PostgreSQL 16       │
│ - WIR Heuristic Rule Matcher  │ │ - Local: SQLite 3            │
│ - Circular Recovery Calculator│ │ - SQLAlchemy 2.0 ORM Pooling │
│ - ReportLab PDF Engine (RAM)  │ │ - Automatic URL Normalization│
└───────────────────────────────┘ └──────────────────────────────┘
```

### Full-Stack Specifications
| Component | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React + TypeScript | 18.3.1 | Single Page Application UI |
| **Build Tool** | Vite | 5.4.21 | Sub-second HMR and production bundling |
| **Styling** | Tailwind CSS | 3.4.1 | Custom Sage-Green (#E5EEE3) & Forest palette |
| **Charting** | Recharts | 2.13.0 | Priority bubble charts & recovery yield curves |
| **Backend API** | FastAPI (Python) | 0.115.0 | High-performance asynchronous REST API |
| **Data Validation** | Pydantic | 2.9.0 | Schema enforcement and type safety |
| **ORM** | SQLAlchemy | 2.0.35 | Database transactions & connection pooling |
| **Cloud Database** | PostgreSQL | 16.0 | Production cloud persistence on Render |
| **Local Database** | SQLite | 3.x | Frictionless zero-setup local development |
| **PDF Generation** | ReportLab | 5.0.1 | In-memory dynamic PDF compilation |
| **Testing** | Pytest + Starlette TestClient | 8.3.0 | 25 integration and unit test suites |

---

## Key Features

- **Multi-Tenant Company Registration:** Isolated enterprise accounts with secure password hashing (BCrypt, 12 rounds) and JWT authentication.
- **Facility & Waste Stream Hierarchy:** Granular tracking of manufacturing processes (CNC Machining, Surface Treatment, Casting).
- **Test Worthiness Score (TWS):** Transparent 0–100 ranking engine based on missing characterization data, hazard level, volume, and recovery upside.
- **Dynamic Recalculation:** Recording laboratory assay measurements immediately reduces uncertainty, automatically lowering TWS and activating circular reuse recommendations.
- **Waste Investigation Rules (WIR):** Built-in knowledge base linking waste categories to published empirical research, standards, and testing triggers.
- **Circular Scenario Modeling:** Real-time mass balance simulator calculating recovered tonnage, furnace losses, processing costs, and net economic gain.
- **Enterprise PDF Generation:** Direct streaming of audit-grade Executive Summaries and Technical Reports directly from memory (`io.BytesIO`).
- **Platform Owner Governance:** System-wide macro metrics and compliance monitoring with strict tenant confidentiality guardrails (trade-secret assay values hidden).

---

## The Mathematical Decision Engine (TWS & Economics)

### 1. Test Worthiness Score (TWS) Formulation

The TWS is computed as a weighted sum of four normalized dimensions:

$$\text{TWS} = (0.35 \cdot U_{\text{missing}}) + (0.25 \cdot H_{\text{hazard}}) + (0.20 \cdot V_{\text{volume}}) + (0.20 \cdot R_{\text{recovery}})$$

Where:
- **$U_{\text{missing}}$ (Uncertainty Factor, 35%):** Measured as $1.0 - \frac{N_{\text{measured}}}{N_{\text{required}}}$. As laboratory assays are recorded, missingness drops to 0.
- **$H_{\text{hazard}}$ (Hazard Severity, 25%):** Regulatory toxicity index (heavy metals = 1.0, caustic wash = 0.85, inert scrap = 0.20).
- **$V_{\text{volume}}$ (Volume Penalty, 20%):** Min-max scaled annual generation volume: $\min(1.0, \frac{\text{Volume}}{1000})$.
- **$R_{\text{recovery}}$ (Recovery Value, 20%):** Market valuation factor based on secondary commodity prices (e.g., high-purity aluminium = 0.88).

### 2. Material Recovery Yield & Net Economic Benefit

$$\text{M}_{\text{recovered}} = \text{M}_{\text{total}} \times \eta_{\text{recovery}} \times (1 - \sigma_{\text{loss}})$$

$$\text{Net Economic Benefit (\$) } = (\text{M}_{\text{recovered}} \times \text{P}_{\text{market}}) - (\text{M}_{\text{total}} \times \text{C}_{\text{processing}}) - \text{C}_{\text{logistics}}$$

---

## Dual-Engine Database Architecture

Render's free-tier web services run inside ephemeral virtual containers that sleep after 15 minutes of inactivity and reset their filesystem on restart. To guarantee **zero data loss in cloud production** while maintaining **zero-setup local development**, IndusTrace AI implements a dual-engine architecture in `backend/app/database/connection.py`:

- **Local Machine:** Defaults to `sqlite:///backend/data/industrace.db` (instant setup, no database server required).
- **Cloud Production:** Reads `DATABASE_URL` pointing to **Render Managed PostgreSQL 16**.
- **Engine Guardrails:** Automatically normalizes legacy `postgres://` prefixes to SQLAlchemy 2.0 `postgresql://`, configures connection pooling (`pool_pre_ping=True`), and recycles connections every 300 seconds.

---

## Empirical Dataset Integration

IndusTrace AI is grounded in real-world industrial benchmarks rather than synthetic placeholders:
1. **Plant C Industrial Scrap Logistics:** 9,400+ real-world manufacturing records tracking collection dates, scrap types, and contamination variances.
2. **CAESAR European Metallurgical Characterization:** Experimental laboratory ICP spectrometry samples of tapped metal and recovered non-ferrous fractions.
3. **Research Source Library:** Curated metallurgical rules establishing characterization thresholds for secondary smelting.

---

## Local Development & Quickstart

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Clone the Repository
```bash
git clone https://github.com/SimranChawla03/IndusTrace-AI.git
cd IndusTrace-AI
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API runs at `http://localhost:8000` (Docs: `http://localhost:8000/docs`).

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Automated Verification & Test Suites

The backend includes a comprehensive automated test suite verifying authentication, multi-tenancy, scoring math, recovery algorithms, and PDF exports.

Run tests using pytest:
```bash
pytest tests/test_backend.py -v
```
**Results:** `25 passed, 0 failed in 11.07s` (100% pass rate).

---

## Project Documentation & Deliverables

The repository includes complete engineering reports compiled to university standards:
1. **Official College Project Report (`IndusTrace_AI_College_Project_Report.pdf`):** Formatted to Ramdeobaba University School of Computer Science & Engineering Idea Lab standards with Title Page, Certificate, Declaration, Approval Sheet, Chapters 1–6, 20 IEEE references, and Annexures.
2. **Team Technical Manual & Defense Guide (`IndusTrace_AI_Team_Technical_Explanation_and_Defense_Guide.pdf`):** Internal architectural manual containing data flow traces, mathematical derivations, database ER details, and Top 15 Viva Defense Questions with model answers.

---

## Team & Institutional Credits

**Ramdeobaba University, Nagpur**  
*School of Computer Science and Engineering — Idea Lab (Academic Year 2026–27)*  
*B.Tech in Computer Science and Engineering (Artificial Intelligence and Machine Learning)*

- **Deeya Saoji** — Roll No. 50 (Section A3_B4)
- **Simran Chawla** — Roll No. 28 (Section A3_B2)
- **Shriram Gosavi** — Roll No. 58 (Section A3_B4)
- **Anushree Agrawal** — Roll No. 45 (Section A3_B3)

**Project Guide:** Dr. Abhishek Sahu *(Assistant Professor, Department of Computer Science & Engineering)*  
**Dean SoCSE:** Dr. P. D. Adane

---
*IndusTrace AI — Transforming Industrial Waste Uncertainty into Circular Economic Value.*

# IndusTrace AI

### An Uncertainty-Aware Manufacturing Waste Investigation and Resource Recovery Decision Support System

**Live demo:** https://indus-trace-ai-beta.vercel.app/?
**Repository:** https://github.com/SimranChawla03/IndusTrace-AI

IndusTrace AI helps manufacturing teams organize waste-stream
information, identify critical data gaps, prioritize further
investigation, and explore potential resource-recovery scenarios. It is
a decision-support prototype---not a replacement for laboratory
analysis, process engineers, environmental specialists, or regulatory
guidance.

## Table of Contents

-   [Problem](#problem)
-   [Solution](#solution)
-   [Key Features](#key-features)
-   [How It Works](#how-it-works)
-   [Technology Stack](#technology-stack)
-   [Project Structure](#project-structure)
-   [Getting Started](#getting-started)
-   [Environment Configuration](#environment-configuration)
-   [Deployment](#deployment)
-   [Data and Evidence Limitations](#data-and-evidence-limitations)
-   [Current Scope](#current-scope)
-   [Team](#team)

## Problem

Manufacturing facilities can generate waste streams whose composition,
handling requirements, and recovery potential are not fully documented.
Decisions made with incomplete information can lead to missed recovery
opportunities, unnecessary testing, or unsuitable handling choices.

## Solution

IndusTrace AI provides a structured workflow to:

1.  Record companies, facilities, and waste streams.
2.  Identify missing or uncertain information.
3.  Use a rule-based Waste Investigation Rules (WIR) knowledge base and
    evidence records to inform investigation.
4.  Calculate a **Test Worthiness Score (TWS)** to help prioritize which
    waste streams may need further testing.
5.  Record laboratory results when they become available.
6.  Explore theoretical material quantities and potential recovery
    scenarios using explicit assumptions and available data.
7.  Present recommendations with supporting evidence, missing
    information, and limitations.

## Key Features

-   **Company and facility records** --- organize facility and
    manufacturing-process information.
-   **Waste-stream management** --- capture waste category, generating
    process, quantity, frequency, known characteristics, and current
    handling.
-   **Evidence-aware investigation** --- connect investigation rules and
    research sources to the questions that need answering.
-   **Missing-information checks** --- highlight information gaps that
    may affect assessment.
-   **Test Worthiness Score (TWS)** --- provide a weighted, rule-based
    prioritization score.
-   **Laboratory-result records** --- store measured parameters, values,
    units, methods, and sample details.
-   **Recovery scenario analysis** --- estimate theoretical and
    potentially recovered quantities from entered composition fractions,
    recovery assumptions, and available economic inputs.
-   **Dashboards and assessments** --- summarize waste streams,
    investigation status, priorities, and activity.
-   **PDF reports** --- generate supported report types from the
    application.
-   **Role-aware workflows** --- support company-level workflows and
    platform-owner governance features implemented in the application.
-   **Dataset summaries** --- expose summaries and selected sample data
    from supported datasets.

> Feature availability and outputs depend on the data entered,
> configured rules, and the current prototype implementation.

## How It Works

1.  **Enter waste-stream information.** Record the manufacturing
    process, waste quantity, generation frequency, known
    characteristics, and current handling.
2.  **Review information gaps.** The system checks available fields and
    applies relevant investigation rules.
3.  **Prioritize investigation.** A TWS is calculated from weighted
    factors to help compare investigation priorities.
4.  **Gather evidence.** Review linked research and evidence records,
    including their scope and limitations.
5.  **Add laboratory results.** Use actual lab measurements when
    available to improve the basis for composition and recovery
    analysis.
6.  **Explore recovery scenarios.** Calculate estimates from the
    supplied values and clearly stated assumptions.
7.  **Review recommendations.** Use the suggested next steps as decision
    support for further investigation.

### Test Worthiness Score

The current prototype uses a configurable weighted scoring approach. The
default factor weights are:

  Factor                    Weight
  --------------------- ----------
  Information Gap              25%
  Quantity                     20%
  Recovery Potential           20%
  Frequency                    15%
  Evidence Confidence          10%
  Economic Relevance           10%
  **Total**               **100%**

These weights are prototype assumptions, not scientifically validated or
industry-certified coefficients. They should be calibrated and validated
before being used for operational decisions.

## Technology Stack

  Layer           Technologies
  --------------- -------------------------------------------------
  Frontend        React, TypeScript, Vite, Tailwind CSS, Recharts
  Backend         Python, FastAPI
  Data access     SQLAlchemy
  Database        SQLite for the current prototype
  Data analysis   Pandas, NumPy
  API             REST endpoints served by FastAPI

## Project Structure

``` text
IndusTrace-AI/
├── backend/       # FastAPI application and backend logic
├── dataset/       # Dataset package, templates, and evidence/data resources
├── docs/          # Project documentation
├── frontend/      # React + TypeScript + Vite application
├── tests/         # Project tests
├── .env.example   # Example environment configuration
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

-   Python version compatible with `backend/requirements.txt`
-   Node.js and npm
-   Git

### 1. Clone the repository

``` bash
git clone https://github.com/SimranChawla03/IndusTrace-AI.git
cd IndusTrace-AI
```

### 2. Configure and run the backend

Create a local environment file using `.env.example` as a reference. Set
required secrets locally; **never commit real secrets or passwords**.

Create and activate a virtual environment:

``` bash
python -m venv .venv
```

**Windows (Command Prompt):**

``` cmd
.venv\Scripts\activate
```

**macOS/Linux:**

``` bash
source .venv/bin/activate
```

Install dependencies and start the API from the repository root:

``` bash
pip install -r backend/requirements.txt
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```

Local health endpoint:

``` text
http://127.0.0.1:8000/api/health
```

Interactive API documentation may be available at
`http://127.0.0.1:8000/docs`, depending on backend configuration.

### 3. Run the frontend

Open a second terminal:

``` bash
cd frontend
npm install
npm run dev
```

Vite will print the local frontend URL, commonly
`http://localhost:5173`.

### 4. Connect the frontend to the backend

The frontend reads the API base URL from `VITE_API_URL`. For local
development, create `frontend/.env.local` with:

``` env
VITE_API_URL=http://127.0.0.1:8000
```

The frontend appends `/api` to this base URL. Do not add `/api` to
`VITE_API_URL` itself.

Vite environment variables are embedded into the frontend at build time.
Restart the development server after changing them.

## Environment Configuration

The root `.env.example` is a starting point, not necessarily a complete
list of all required settings. The backend requires a strong
`JWT_SECRET` and may use `PLATFORM_OWNER_PASSWORD` and
`DEMO_USER_PASSWORD` to provision initial accounts. Configure these
locally or through your hosting provider's environment-variable
settings.

Example non-secret settings:

``` env
PORT=8000
HOST=127.0.0.1
DATABASE_URL=sqlite:///backend/data/industrace.db
ENVIRONMENT=development
```

Use unique, strong values for all secrets. Never put real credentials in
source code, screenshots, commits, or this README. Changing
initial-account password environment variables does not necessarily
change passwords for accounts that already exist in the database.

## Deployment

The current demo is deployed as two services:

-   **Frontend (Vercel):** https://indus-trace-ai-beta.vercel.app/
-   **Backend (Render):** https://industrace-ai-backend.onrender.com

The frontend's production environment variable is:

``` env
VITE_API_URL=https://industrace-ai-backend.onrender.com
```

Backend health endpoint:

https://industrace-ai-backend.onrender.com/api/health

### Demo deployment notes

-   A free Render service may sleep when inactive, so the first request
    after inactivity can be slower.
-   The current backend uses SQLite. Free hosting without a persistent
    disk should not be treated as durable production storage; database
    contents may be lost on restarts or redeployments.
-   Before using the application for ongoing or real company data,
    configure durable database storage, production-appropriate CORS
    settings, backups, and secure secret management.
-   Do not upload confidential industrial data to the public demo unless
    the deployment has been reviewed and approved for that use.

## Data and Evidence Limitations

The project package contains different kinds of information that must
not be treated as interchangeable:

-   **Waste Investigation Rules and research records** provide
    investigation guidance and evidence references; they do not prove
    the composition of a specific company's waste.
-   **Plant C logistics data** describes logistics-related information
    and should not be treated as laboratory chemistry results.
-   **CAESAR experimental chemistry samples** are experimental sample
    data, not new assays for a user's facility.
-   **Synthetic demo cases** are illustrative examples and must remain
    labelled as synthetic.
-   **Company-entered information and laboratory results** should be
    distinguished from reference datasets and assumptions.

The application cannot determine exact waste composition merely from a
process description. Reliable composition claims require suitable
sampling and laboratory analysis. Recovery estimates depend on input
quality, composition fractions, recovery-rate assumptions, costs, and
prices.

## Current Scope

IndusTrace AI is a prototype decision-support system. Its TWS is
rule-based and weighted; it is **not currently a trained
machine-learning model**. Scores and recovery scenarios are estimates
for investigation support, not guarantees of material recovery,
profitability, regulatory compliance, or environmental impact.

Use outputs to guide further review with qualified engineers, accredited
laboratories, environmental professionals, and licensed waste or
recovery providers. Validate assumptions and applicable regulations
before acting on recommendations.

## Team

-   Deeya Saoji --- Roll No. 50, A3_B4
-   Simran Chawla --- Roll No. 28, A3_B2
-   Shriram Gosavi --- Roll No. 58, A3_B4
-   Anushree Agrawal --- Roll No. 45, A3_B3

**Project Guide:** Dr. Abhishek Sahu\
**Academic Session:** Semester V, 2026--27

------------------------------------------------------------------------

*IndusTrace AI --- investigate uncertainty, prioritize evidence, and
make more informed resource-recovery decisions.*

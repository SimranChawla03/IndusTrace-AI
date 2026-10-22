-- IndusTrace AI starter relational schema (PostgreSQL)
-- Dataset tables are separated by evidence type. Public observations are not treated as lab outcomes.
CREATE TABLE IF NOT EXISTS waste_intelligence_rules (
    wir_id TEXT PRIMARY KEY,
    waste_stream TEXT NOT NULL,
    investigation_area TEXT NOT NULL,
    missing_or_condition TEXT NOT NULL,
    rule_action TEXT NOT NULL,
    candidate_system_use TEXT,
    evidence_source_id TEXT,
    source_url TEXT,
    record_type TEXT NOT NULL,
    evidence_confidence TEXT,
    limitations TEXT
);

CREATE TABLE IF NOT EXISTS research_sources (
    source_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    authors TEXT,
    publication_year INTEGER,
    venue TEXT,
    url TEXT NOT NULL,
    source_type TEXT,
    scope TEXT,
    relevant_summary TEXT,
    caveat TEXT
);

CREATE TABLE IF NOT EXISTS company_waste_cases (
    case_id TEXT PRIMARY KEY,
    company_name TEXT,
    industry TEXT,
    process TEXT,
    waste_stream TEXT NOT NULL,
    quantity NUMERIC,
    quantity_unit TEXT,
    frequency TEXT,
    current_handling TEXT,
    known_composition_or_contamination TEXT,
    lab_result_available BOOLEAN DEFAULT FALSE,
    data_origin TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lab_measurements (
    measurement_id BIGSERIAL PRIMARY KEY,
    source_dataset TEXT NOT NULL,
    sample_id TEXT NOT NULL,
    waste_or_scrap_type TEXT,
    parameter TEXT NOT NULL,
    value_as_reported TEXT NOT NULL,
    unit TEXT,
    source_sheet TEXT,
    interpretation_note TEXT,
    data_origin TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS test_assessments (
    assessment_id BIGSERIAL PRIMARY KEY,
    case_id TEXT NOT NULL,
    score NUMERIC CHECK (score >= 0 AND score <= 100),
    factor_breakdown JSONB,
    recommendation TEXT,
    explanation TEXT,
    scoring_version TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

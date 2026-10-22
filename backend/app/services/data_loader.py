# backend/app/services/data_loader.py
import os
import pandas as pd
from sqlalchemy.orm import Session
from app.models.entities import WIRRule, ResearchSource, Company, WasteStream, LabResult

DATASET_ROOT = os.path.abspath(
    os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
        "dataset",
        "IndusTrace_AI_Final_Dataset_Package"
    )
)

def get_dataset_path(*parts) -> str:
    return os.path.join(DATASET_ROOT, *parts)

def load_research_sources(db: Session) -> int:
    csv_path = get_dataset_path("04_RESEARCH_INTELLIGENCE", "Research_Source_Library.csv")
    if not os.path.exists(csv_path):
        return 0
    df = pd.read_csv(csv_path)
    count = 0
    for _, row in df.iterrows():
        source_id = str(row.get("Source_ID", "")).strip()
        if not source_id:
            continue
        existing = db.query(ResearchSource).filter(ResearchSource.source_id == source_id).first()
        if not existing:
            year_val = row.get("Publication_Year")
            pub_year = int(year_val) if pd.notna(year_val) and str(year_val).isdigit() else None
            source = ResearchSource(
                source_id=source_id,
                title=str(row.get("Title", "")).strip(),
                authors=str(row.get("Authors", "")) if pd.notna(row.get("Authors")) else None,
                publication_year=pub_year,
                venue=str(row.get("Venue", "")) if pd.notna(row.get("Venue")) else None,
                url=str(row.get("URL", "")).strip(),
                source_type=str(row.get("Source_Type", "")) if pd.notna(row.get("Source_Type")) else None,
                scope=str(row.get("Scope", "")) if pd.notna(row.get("Scope")) else None,
                relevant_summary=str(row.get("Relevant_Summary", "")) if pd.notna(row.get("Relevant_Summary")) else None,
                caveat=str(row.get("Caveat", "")) if pd.notna(row.get("Caveat")) else None,
            )
            db.add(source)
            count += 1
    db.commit()
    return count

def load_wir_rules(db: Session) -> int:
    csv_path = get_dataset_path("04_RESEARCH_INTELLIGENCE", "WIR_Starter.csv")
    if not os.path.exists(csv_path):
        return 0
    df = pd.read_csv(csv_path)
    count = 0
    for _, row in df.iterrows():
        wir_id = str(row.get("WIR_ID", "")).strip()
        if not wir_id:
            continue
        existing = db.query(WIRRule).filter(WIRRule.id == wir_id).first()
        if not existing:
            rule = WIRRule(
                id=wir_id,
                waste_stream=str(row.get("Waste_Stream", "")).strip(),
                investigation_area=str(row.get("Investigation_Area", "")).strip(),
                missing_or_condition=str(row.get("Missing_or_Condition", "")).strip(),
                rule_action=str(row.get("Rule_Action", "")).strip(),
                candidate_system_use=str(row.get("Candidate_System_Use", "")).strip() if pd.notna(row.get("Candidate_System_Use")) else None,
                evidence_source_id=str(row.get("Evidence_Source_ID", "")).strip() if pd.notna(row.get("Evidence_Source_ID")) else None,
                source_url=str(row.get("Source_URL", "")).strip() if pd.notna(row.get("Source_URL")) else None,
                record_type=str(row.get("Record_Type", "LITERATURE_DERIVED_RULE")).strip(),
                evidence_confidence=str(row.get("Evidence_Confidence", "Moderate")).strip() if pd.notna(row.get("Evidence_Confidence")) else "Moderate",
                limitations=str(row.get("Limitations", "")).strip() if pd.notna(row.get("Limitations")) else None,
            )
            db.add(rule)
            count += 1
    db.commit()
    return count

def load_synthetic_demo_cases(db: Session) -> int:
    csv_path = get_dataset_path("06_SYNTHETIC_DEMO_DATA", "Company_Demo_Cases.csv")
    if not os.path.exists(csv_path):
        return 0
    df = pd.read_csv(csv_path)
    count = 0
    for _, row in df.iterrows():
        comp_name = str(row.get("Company_Name", "")).strip()
        industry = str(row.get("Industry", "")).strip()
        process = str(row.get("Process", "")).strip()
        stream_name = str(row.get("Waste_Stream", "")).strip()

        # Check if demo company exists or create
        company = db.query(Company).filter(Company.name == comp_name).first()
        if not company:
            company = Company(
                name=comp_name,
                industry=industry,
                location="Demo Industrial Park (Synthetic)",
                manufacturing_process=process,
                process_description="Synthetic demonstration case from IndusTrace test suite.",
                data_origin="SYNTHETIC_DEMO"
            )
            db.add(company)
            db.flush()

        # Check if stream exists
        stream = db.query(WasteStream).filter(
            WasteStream.company_id == company.id,
            WasteStream.stream_name == stream_name
        ).first()

        if not stream:
            # Parse quantity
            qty_raw = row.get("Quantity")
            qty = float(qty_raw) if pd.notna(qty_raw) else None

            # Category heuristic
            cat = "General Waste"
            if "chips" in stream_name.lower():
                cat = "Machining Chips"
            elif "sludge" in stream_name.lower():
                cat = "Sludge"
            elif "scrap" in stream_name.lower():
                cat = "Metal Scrap"

            stream = WasteStream(
                company_id=company.id,
                stream_name=stream_name,
                waste_category=cat,
                generating_process=process,
                quantity=qty,
                quantity_unit=str(row.get("Quantity_Unit", "")) if pd.notna(row.get("Quantity_Unit")) else None,
                frequency=str(row.get("Frequency", "")) if pd.notna(row.get("Frequency")) else None,
                current_handling=str(row.get("Current_Handling", "")) if pd.notna(row.get("Current_Handling")) else None,
                known_characteristics=str(row.get("Known_Composition_or_Contamination", "")) if pd.notna(row.get("Known_Composition_or_Contamination")) else None,
                data_origin="SYNTHETIC_DEMO"
            )
            db.add(stream)
            count += 1
    db.commit()
    return count

def load_caesar_reference_chemistry(db: Session, max_rows: int = 100) -> int:
    """Loads sample reference chemistry from CAESAR experimental data for sample demonstration."""
    csv_path = get_dataset_path("03_PROCESSED_PUBLIC_DATA", "CAESAR_Tapped_Metal_Chemistry_Long.csv")
    if not os.path.exists(csv_path):
        return 0
    df = pd.read_csv(csv_path)
    count = 0
    for _, row in df.head(max_rows).iterrows():
        sample_id = str(row.get("sample_id", "")).strip()
        elem = str(row.get("parameter", "")).strip()
        val_str = str(row.get("value_as_reported", "")).strip()
        if not sample_id or not elem or not val_str:
            continue
            
        val_num = None
        try:
            val_num = float(val_str)
        except ValueError:
            # Preserves qualifiers such as '<0.005', '0.012-0.016', etc.
            val_num = None
        
        existing = db.query(LabResult).filter(
            LabResult.sample_id == sample_id,
            LabResult.measured_parameter == elem,
            LabResult.data_origin == "CAESAR_EXPERIMENTAL_REFERENCE"
        ).first()

        if not existing:
            lab_res = LabResult(
                waste_stream_id=None,
                sample_id=sample_id,
                sample_date="Public Experimental Study",
                laboratory="CAESAR Project (Zenodo: 15737122)",
                test_name="Optical Emission Spectroscopy / Chemical Analysis",
                measured_parameter=elem,
                result_value_str=val_str,
                result_value_numeric=val_num,
                unit=str(row.get("unit", "wt%")) if pd.notna(row.get("unit")) else "wt%",
                notes=str(row.get("interpretation_note", "")) if pd.notna(row.get("interpretation_note")) else "Public reference experimental sample.",
                data_origin="CAESAR_EXPERIMENTAL_REFERENCE"
            )
            db.add(lab_res)
            count += 1
    db.commit()
    return count

def init_db_with_datasets(db: Session):
    sources_count = load_research_sources(db)
    wir_count = load_wir_rules(db)
    demo_count = load_synthetic_demo_cases(db)
    caesar_count = load_caesar_reference_chemistry(db)
    return {
        "research_sources_loaded": sources_count,
        "wir_rules_loaded": wir_count,
        "synthetic_demo_cases_loaded": demo_count,
        "caesar_reference_loaded": caesar_count,
    }

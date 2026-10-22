# backend/app/decision_engine/matcher.py
import re
from typing import List, Dict, Any, Tuple, Set
from sqlalchemy.orm import Session
from app.models.entities import WasteStream, WIRRule

STOPWORDS: Set[str] = {
    "waste", "scrap", "stream", "industrial", "solid", "liquid", "other",
    "from", "with", "material", "sample", "test", "type", "plant", "unit",
    "area", "general", "process", "various", "mixed", "unknown"
}

MATERIAL_KEYWORDS: Set[str] = {
    "aluminium", "aluminum", "copper", "titanium", "nickel", "iron", "steel",
    "brass", "bronze", "silicon", "zinc", "tungsten", "lead", "magnesium",
    "sludge", "dross", "swarf", "chips", "turnings", "scale", "dust", "fume",
    "coolant", "emulsion", "oil", "solvent", "acid", "flux", "cake"
}

def extract_significant_tokens(text: str) -> Set[str]:
    """Extracts normalized, non-stopword tokens of significant length."""
    if not text:
        return set()
    cleaned = re.sub(r'[^a-zA-Z0-9\s]', ' ', text.lower())
    tokens = set()
    for tok in cleaned.split():
        if len(tok) >= 3 and tok not in STOPWORDS:
            tokens.add(tok)
    return tokens

def match_stream_against_wir(stream: WasteStream, db: Session) -> Tuple[List[Dict[str, Any]], List[str]]:
    """
    Compares a registered waste stream with WIR entries using transparent, explainable rules.
    Prevents short/generic keyword overlap from posing as verified metallurgical compatibility.
    Differentiates literature benchmarks from factory-specific chemical assays.
    """
    rules = db.query(WIRRule).all()
    matched_results: List[Dict[str, Any]] = []
    
    stream_name_lower = (stream.stream_name or "").lower().strip()
    cat_lower = (stream.waste_category or "").lower().strip()
    proc_lower = (stream.generating_process or "").lower().strip()
    char_lower = (stream.known_characteristics or "").lower().strip()

    stream_tokens = extract_significant_tokens(f"{stream_name_lower} {cat_lower} {proc_lower} {char_lower}")
    stream_materials = stream_tokens.intersection(MATERIAL_KEYWORDS)

    # 1. Evaluate Information Gaps
    missing_info: List[str] = []

    # Basic operational gaps
    if stream.quantity is None or stream.quantity <= 0:
        missing_info.append("Quantitative mass (Quantity volume unrecorded)")
    if not stream.quantity_unit or stream.quantity_unit.strip().lower() in ["unknown", "n/a", ""]:
        missing_info.append("Standardized measurement unit undefined")
    if not stream.frequency or stream.frequency.strip().lower() in ["unknown", "n/a", ""]:
        missing_info.append("Generation recurrence / production frequency pattern unknown")
    if not stream.known_characteristics or len(stream.known_characteristics.strip()) < 5 or "unknown" in char_lower:
        missing_info.append("Baseline composition or contaminant characteristics unrecorded")

    # Laboratory assay gap analysis
    labs = stream.lab_results if hasattr(stream, 'lab_results') and stream.lab_results else []
    if len(labs) == 0:
        missing_info.append("Sample-specific laboratory assay (No chemical or spectroscopic test records attached)")
    elif len(labs) < 3:
        missing_info.append(f"Partial assay profile on file ({len(labs)} parameter(s)); comprehensive multi-element matrix uncharacterized")

    # 2. Match Against WIR Rules
    seen_rule_ids: Set[str] = set()

    for rule in rules:
        rule_id = rule.id
        if rule_id in seen_rule_ids:
            continue

        rule_topic = (rule.waste_stream or "").lower().strip()
        rule_area = (rule.investigation_area or "").lower().strip()
        rule_tokens = extract_significant_tokens(f"{rule_topic} {rule_area}")
        rule_materials = rule_tokens.intersection(MATERIAL_KEYWORDS)

        match_score = 0
        reasons: List[str] = []

        # A. Direct topic match
        if rule_topic and (rule_topic in stream_name_lower or stream_name_lower in rule_topic):
            match_score += 50
            reasons.append(f"Exact material phrase matches research topic '{rule.waste_stream}'")
        
        # B. Shared specific material keyword (not generic words)
        shared_materials = stream_materials.intersection(rule_materials)
        if shared_materials:
            match_score += 30
            reasons.append(f"Shared target metallurgical matrix ({', '.join(sorted(shared_materials))})")

        # C. Shared operational tokens (category, process)
        shared_general = (stream_tokens.intersection(rule_tokens)) - shared_materials
        if len(shared_general) >= 2:
            match_score += 20
            reasons.append(f"Shared process/category terminology ({', '.join(sorted(shared_general))})")
        elif len(shared_general) == 1:
            match_score += 10
            reasons.append(f"Related operational context ({list(shared_general)[0]})")

        # D. Investigation area context
        if rule_area and (rule_area in stream_name_lower or rule_area in char_lower or rule_area in proc_lower):
            match_score += 15
            reasons.append(f"Investigation area context aligns with '{rule.investigation_area}'")

        # Threshold: At least 45 required for a meaningful literature link
        if match_score >= 45:
            seen_rule_ids.add(rule_id)
            confidence = rule.evidence_confidence or "Moderate"
            if match_score >= 65 and confidence == "High":
                match_strength = "Strong"
            elif match_score >= 45:
                match_strength = "Moderate"
            else:
                match_strength = "Screening"

            matched_results.append({
                "rule_id": rule.id,
                "waste_stream_topic": rule.waste_stream,
                "investigation_area": rule.investigation_area,
                "condition_or_trigger": rule.missing_or_condition,
                "action_prescribed": rule.rule_action,
                "record_type": rule.record_type,
                "evidence_confidence": confidence,
                "evidence_strength": match_strength,
                "evidence_source_id": rule.evidence_source_id,
                "source_url": rule.source_url,
                "limitations": rule.limitations or "General literature precedent; does not confirm specific factory batch purity.",
                "match_reasons": reasons,
                "match_score": match_score
            })

            # Check if this rule highlights a specific missing gap
            cond_lower = (rule.missing_or_condition or "").lower()
            if "unknown" in cond_lower or "missing" in cond_lower or "critical" in cond_lower:
                gap_desc = f"{rule.investigation_area}: {rule.missing_or_condition}"
                if gap_desc not in missing_info:
                    missing_info.append(gap_desc)

    # Sort descending by match score
    matched_results.sort(key=lambda x: x["match_score"], reverse=True)
    return matched_results, missing_info

# backend/app/decision_engine/tws_scorer.py
import os
from typing import Dict, Any, List, Optional
import pandas as pd

from app.models.entities import WasteStream
from app.models.schemas import FactorScore
from app.recovery.calculator import normalize_quantity_to_kg_month

# Default Prototype weights as documented fallback (Sum = 100%)
DEFAULT_TWS_WEIGHTS = {
    "Quantity": 20.0,
    "Frequency": 15.0,
    "Information_Gap": 25.0,
    "Recovery_Potential": 20.0,
    "Evidence_Confidence": 10.0,
    "Economic_Relevance": 10.0,
}

def load_tws_weights(config_path: Optional[str] = None) -> Dict[str, float]:
    """
    Dynamically loads TWS factor weights from TWS_Prototype_Config.csv.
    Validates presence of required factors, non-negativity, and checks that total sum == 100%.
    Falls back gracefully to DEFAULT_TWS_WEIGHTS if file is missing, empty, or invalid.
    """
    if not config_path:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        config_path = os.path.join(
            base_dir,
            "dataset",
            "IndusTrace_AI_Final_Dataset_Package",
            "07_SCHEMA_AND_WORKBOOK",
            "TWS_Prototype_Config.csv"
        )

    if not os.path.exists(config_path):
        return DEFAULT_TWS_WEIGHTS.copy()

    try:
        df = pd.read_csv(config_path)
        required_cols = {"Factor", "Weight_Percent"}
        if not required_cols.issubset(set(df.columns)):
            return DEFAULT_TWS_WEIGHTS.copy()

        loaded_weights: Dict[str, float] = {}
        key_map = {
            "quantity": "Quantity",
            "frequency": "Frequency",
            "generation_frequency": "Frequency",
            "generation frequency": "Frequency",
            "information_gap": "Information_Gap",
            "information gap": "Information_Gap",
            "recovery_potential": "Recovery_Potential",
            "recovery potential": "Recovery_Potential",
            "evidence_confidence": "Evidence_Confidence",
            "evidence confidence": "Evidence_Confidence",
            "economic_relevance": "Economic_Relevance",
            "economic relevance": "Economic_Relevance",
        }

        for _, row in df.iterrows():
            factor_raw = str(row.get("Factor", "")).strip().lower().replace(" ", "_")
            canonical_key = key_map.get(factor_raw)
            if canonical_key:
                val = float(row.get("Weight_Percent", 0.0))
                if val < 0.0:
                    raise ValueError(f"Negative weight for factor {canonical_key}")
                loaded_weights[canonical_key] = val

        required_factors = set(DEFAULT_TWS_WEIGHTS.keys())
        if not required_factors.issubset(set(loaded_weights.keys())):
            return DEFAULT_TWS_WEIGHTS.copy()

        total = sum(loaded_weights[f] for f in required_factors)
        if abs(total - 100.0) > 0.05:
            return DEFAULT_TWS_WEIGHTS.copy()

        return loaded_weights
    except Exception:
        return DEFAULT_TWS_WEIGHTS.copy()

TWS_WEIGHTS = load_tws_weights()

def calculate_tws(
    stream: WasteStream,
    matched_rules: List[Dict[str, Any]],
    missing_info: List[str],
    has_lab_results: bool
) -> Dict[str, Any]:
    """
    Calculates the Test Worthiness Score (0-100) and detailed factor contributions.
    Adheres strictly to scientific constraints:
    - Transparent, rule-based formula
    - Consistent unit and frequency normalization
    - Explicitly handles missing data without false precision
    - Discloses prototype assumptions
    """
    weights = load_tws_weights()
    factor_scores: List[FactorScore] = []

    # -------------------------------------------------------------
    # 1. Quantity Factor (20%)
    # Normalized via normalize_quantity_to_kg_month to ensure consistent monthly mass baseline
    # -------------------------------------------------------------
    monthly_kg = normalize_quantity_to_kg_month(stream.quantity, stream.quantity_unit, stream.frequency)
    qty_status = "PRESENT"

    if stream.quantity is None or monthly_kg is None:
        qty_norm = 20.0
        qty_status = "UNKNOWN"
        qty_expl = "Quantity or measurement unit unrecorded; minimum baseline screening score applied."
        raw_qty_display = "Unknown"
    else:
        raw_qty_display = f"{stream.quantity} {stream.quantity_unit or 'units'} (≈ {monthly_kg:,.1f} kg/month)"
        # Monotonic log-linear scale capped at 10,000 kg/month:
        # >= 5000 kg/month -> 95
        # 1000 - 5000 kg/month -> 85
        # 250 - 1000 kg/month -> 70
        # 50 - 250 kg/month -> 50
        # < 50 kg/month -> 30
        if monthly_kg >= 5000.0:
            qty_norm = 95.0
            qty_expl = f"High commercial volume ({monthly_kg:,.0f} kg/month); high economic/testing leverage."
        elif monthly_kg >= 1000.0:
            qty_norm = 85.0
            qty_expl = f"Substantial industrial throughput ({monthly_kg:,.0f} kg/month); priority investigation candidate."
        elif monthly_kg >= 250.0:
            qty_norm = 70.0
            qty_expl = f"Moderate industrial generation volume ({monthly_kg:,.0f} kg/month)."
        elif monthly_kg >= 50.0:
            qty_norm = 50.0
            qty_expl = f"Small-scale generation volume ({monthly_kg:,.0f} kg/month)."
        else:
            qty_norm = 30.0
            qty_expl = f"Minimal batch volume ({monthly_kg:,.1f} kg/month); lower aggregate material impact."

    w_contrib_qty = qty_norm * (weights["Quantity"] / 100.0)
    factor_scores.append(FactorScore(
        name="Quantity",
        weight_percent=weights["Quantity"],
        raw_value=raw_qty_display,
        normalized_score=round(qty_norm, 1),
        weighted_contribution=round(w_contrib_qty, 2),
        data_status=qty_status,
        explanation=qty_expl
    ))

    # -------------------------------------------------------------
    # 2. Generation Frequency Factor (15%)
    # Documented schedule mapping
    # -------------------------------------------------------------
    freq_str = (stream.frequency or "").lower().strip()
    freq_status = "PRESENT"
    if not freq_str or freq_str in ["unknown", "n/a"]:
        freq_norm = 20.0
        freq_status = "UNKNOWN"
        freq_expl = "Generation pattern unrecorded; low screening weight applied."
    elif any(k in freq_str for k in ["continuous", "daily", "shift"]):
        freq_norm = 90.0
        freq_expl = f"Continuous or daily generation schedule ('{stream.frequency}'); regular testing delivers continuous feedback."
    elif "weekly" in freq_str:
        freq_norm = 75.0
        freq_expl = f"Regular weekly generation pattern ('{stream.frequency}'); stable recurring investigation cycle."
    elif any(k in freq_str for k in ["monthly", "batch", "campaign"]):
        freq_norm = 55.0
        freq_expl = f"Batch or episodic generation pattern ('{stream.frequency}'); testing warranted prior to campaign processing."
    else:
        freq_norm = 35.0
        freq_expl = f"Sporadic or intermittent generation pattern ('{stream.frequency}')."

    w_contrib_freq = freq_norm * (weights["Frequency"] / 100.0)
    factor_scores.append(FactorScore(
        name="Generation Frequency",
        weight_percent=weights["Frequency"],
        raw_value=stream.frequency or "Unknown",
        normalized_score=round(freq_norm, 1),
        weighted_contribution=round(w_contrib_freq, 2),
        data_status=freq_status,
        explanation=freq_expl
    ))

    # -------------------------------------------------------------
    # 3. Information Gap Factor (25%)
    # Under incomplete information, higher uncertainty increases testing urgency.
    # Differentiates zero assays vs partial assays vs full assays.
    # -------------------------------------------------------------
    gap_count = len(missing_info)
    gap_status = "EVALUATED"
    labs = stream.lab_results if hasattr(stream, 'lab_results') and stream.lab_results else []
    lab_count = len(labs)

    if lab_count >= 3:
        # Substantial lab data on file
        gap_norm = 30.0
        gap_expl = f"Comprehensive assay profile on file ({lab_count} verified parameters); compositional uncertainty substantially reduced."
    elif lab_count > 0:
        # Partial lab data: still has tramp/impurity uncertainty
        gap_norm = 55.0
        gap_expl = f"Partial assay profile on file ({lab_count} parameter(s)); supplementary characterization recommended for complete alloy confirmation."
    else:
        # No lab data at all
        if gap_count >= 4:
            gap_norm = 95.0
            gap_expl = f"Severe information deficit ({gap_count} unknown parameters); testing urgently needed to prevent contamination or disposal loss."
        elif gap_count >= 2:
            gap_norm = 80.0
            gap_expl = f"Substantial uncertainty ({gap_count} unidentified parameters); laboratory testing strongly justified."
        else:
            gap_norm = 65.0
            gap_expl = "Baseline characteristics known, but chemical confirmation test remains unrecorded."

    w_contrib_gap = gap_norm * (weights["Information_Gap"] / 100.0)
    factor_scores.append(FactorScore(
        name="Information Gap",
        weight_percent=weights["Information_Gap"],
        raw_value=f"{gap_count} gap(s), {lab_count} assay(s)",
        normalized_score=round(gap_norm, 1),
        weighted_contribution=round(w_contrib_gap, 2),
        data_status=gap_status,
        explanation=gap_expl
    ))

    # -------------------------------------------------------------
    # 4. Recovery Potential Factor (20%)
    # Literature-derived or category indications of valuable recoverable elements
    # -------------------------------------------------------------
    name_and_cat = f"{stream.stream_name} {stream.waste_category} {stream.generating_process} {stream.known_characteristics}".lower()
    rec_status = "EVALUATED"
    
    if any(metal in name_and_cat for metal in ["copper", "cu", "titanium", "ti", "nickel", "ni", "tungsten"]):
        rec_norm = 90.0
        rec_expl = "High theoretical intrinsic value (high-value non-ferrous / transition metal matrix suggested)."
    elif any(metal in name_and_cat for metal in ["aluminium", "aluminum", "brass", "bronze", "zinc"]):
        rec_norm = 80.0
        rec_expl = "Strong recovery potential (standard recyclable non-ferrous alloy candidate)."
    elif any(term in name_and_cat for term in ["steel", "iron", "swarf", "chips", "machining"]):
        rec_norm = 65.0
        rec_expl = "Moderate recovery potential (secondary ferrous or mechanical briquetting candidate)."
    elif any(term in name_and_cat for term in ["sludge", "filter cake", "dust"]):
        rec_norm = 50.0
        rec_expl = "Hydrometallurgical/pyrometallurgical recovery candidate; highly contingent on certified assay concentration."
    elif any(term in name_and_cat for term in ["effluent", "wastewater"]):
        rec_norm = 40.0
        rec_expl = "Resource recovery depends strictly on heavy metal precipitation and compliance limits."
    else:
        rec_norm = 25.0
        rec_status = "UNKNOWN"
        rec_expl = "Uncharacterized waste category; low default screening recovery score."

    w_contrib_rec = rec_norm * (weights["Recovery_Potential"] / 100.0)
    factor_scores.append(FactorScore(
        name="Recovery Potential",
        weight_percent=weights["Recovery_Potential"],
        raw_value=stream.waste_category or "Unspecified",
        normalized_score=round(rec_norm, 1),
        weighted_contribution=round(w_contrib_rec, 2),
        data_status=rec_status,
        explanation=rec_expl
    ))

    # -------------------------------------------------------------
    # 5. Evidence Confidence Factor (10%)
    # Provenance and rigour of supporting literature
    # -------------------------------------------------------------
    if matched_rules:
        top_rule = matched_rules[0]
        conf = top_rule.get("evidence_confidence", "Moderate")
        rule_id = top_rule.get("rule_id", "WIR-RULE")
        if conf == "High":
            conf_norm = 85.0
            conf_expl = f"Corroborated by high-confidence experimental research ({rule_id})."
        elif conf == "Moderate":
            conf_norm = 65.0
            conf_expl = f"Corroborated by peer-reviewed literature ({rule_id})."
        else:
            conf_norm = 45.0
            conf_expl = f"Preliminary literature precedent ({rule_id}); exploratory screening rule."
        conf_status = "PRESENT"
    else:
        conf_norm = 25.0
        conf_status = "NO_MATCH"
        conf_expl = "No direct literature rule matched in WIR; exploratory screening baseline applied."

    w_contrib_conf = conf_norm * (weights["Evidence_Confidence"] / 100.0)
    factor_scores.append(FactorScore(
        name="Evidence Confidence",
        weight_percent=weights["Evidence_Confidence"],
        raw_value=conf_expl,
        normalized_score=round(conf_norm, 1),
        weighted_contribution=round(w_contrib_conf, 2),
        data_status=conf_status,
        explanation=conf_expl
    ))

    # -------------------------------------------------------------
    # 6. Economic Relevance Factor (10%)
    # Documented handling cost, disposal fee, or documented scrap monetization
    # Explicit low floor if missing
    # -------------------------------------------------------------
    if stream.estimated_handling_cost is not None and stream.estimated_handling_cost > 0:
        cost_val = float(stream.estimated_handling_cost)
        if cost_val >= 50000:
            econ_norm = 90.0
            econ_expl = f"Substantial handling/disposal cost (₹{cost_val:,.0f}); direct incentive for testing & diversion."
        elif cost_val >= 10000:
            econ_norm = 75.0
            econ_expl = f"Moderate documented handling cost (₹{cost_val:,.0f}); economic mitigation candidate."
        else:
            econ_norm = 55.0
            econ_expl = f"Documented baseline handling cost (₹{cost_val:,.0f})."
        econ_status = "PRESENT"
        econ_raw = f"₹{cost_val:,.0f}"
    elif stream.current_handling and "scrap" in stream.current_handling.lower():
        econ_norm = 50.0
        econ_status = "ESTIMATED"
        econ_expl = "Currently monetized as basic mixed scrap; testing could uncover alloy premium upgrading opportunities."
        econ_raw = "Basic scrap sales"
    else:
        econ_norm = 20.0
        econ_status = "MISSING"
        econ_expl = "Handling/disposal financials completely unrecorded; minimum baseline weight applied without false certainty."
        econ_raw = "Unrecorded"

    w_contrib_econ = econ_norm * (weights["Economic_Relevance"] / 100.0)
    factor_scores.append(FactorScore(
        name="Economic Relevance",
        weight_percent=weights["Economic_Relevance"],
        raw_value=econ_raw,
        normalized_score=round(econ_norm, 1),
        weighted_contribution=round(w_contrib_econ, 2),
        data_status=econ_status,
        explanation=econ_expl
    ))

    # Total Score Calculation
    total_score = sum(f.weighted_contribution for f in factor_scores)
    total_score = round(min(100.0, max(0.0, total_score)), 1)

    # Documented Priority Thresholds
    if total_score >= 70.0:
        priority = "High"
    elif total_score >= 50.0:
        priority = "Medium"
    else:
        priority = "Low"

    return {
        "tws_score": total_score,
        "priority_level": priority,
        "factor_breakdown": [f.model_dump() for f in factor_scores],
        "missing_critical_info": missing_info,
        "scoring_version": "v1.1-production"
    }

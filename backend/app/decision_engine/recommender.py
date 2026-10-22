# backend/app/decision_engine/recommender.py
from typing import Dict, Any, List
from app.models.entities import WasteStream
from app.models.schemas import RecommendationDetail

def generate_recommendation(
    stream: WasteStream,
    tws_data: Dict[str, Any],
    matched_rules: List[Dict[str, Any]],
    missing_info: List[str],
    has_lab_results: bool
) -> RecommendationDetail:
    """
    Generates rule-based, transparent, explainable recommendations adhering to scientific guardrails:
    - Collect More Data
    - Conduct Laboratory Testing
    - Conduct Supplementary Laboratory Testing
    - Evaluate Recovery Feasibility
    - Evaluate Reuse
    - Evaluate Recycling
    - Evaluate Treatment
    - Consider Authorized Disposal
    """
    score = tws_data.get("tws_score", 0.0)
    priority = tws_data.get("priority_level", "Medium")

    supporting_evidence: List[str] = []
    for r in matched_rules[:3]:
        r_id = r.get("rule_id", "WIR-RULE")
        act = r.get("action_prescribed", "Perform test")
        conf = r.get("evidence_confidence", "Moderate")
        supporting_evidence.append(f"WIR [{r_id}]: {act} (Confidence: {conf})")

    labs = stream.lab_results if hasattr(stream, 'lab_results') and stream.lab_results else []
    lab_count = len(labs)

    # 1. Critical operational data missing
    if stream.quantity is None or not stream.quantity_unit or not stream.frequency:
        return RecommendationDetail(
            action="Collect More Data",
            priority="Medium",
            reason="Essential operational metrics (volume, standardized units, or generation frequency) are unrecorded.",
            supporting_evidence=supporting_evidence or ["Baseline operational registration incomplete."],
            missing_information=missing_info,
            limitations="Without baseline throughput mass and production frequency, accurate financial modeling and test scheduling cannot be determined.",
            suggested_next_step="Update waste stream registration with measured quantities, measurement unit, and generation schedule."
        )

    # 2. Comprehensive Laboratory Assays Recorded (>= 3 parameters)
    if lab_count >= 3:
        cat_lower = (stream.waste_category or "").lower()
        if any(term in cat_lower for term in ["sludge", "filter cake", "dust"]):
            action = "Evaluate Recovery Feasibility"
            reason = f"Multi-element laboratory assays on file ({lab_count} parameters); evaluate hydrometallurgical extraction or thermal concentration against hazardous treatment costs."
            suggested_next_step = "Run Recovery & Economic Analysis using verified elemental percentages to model net recovery viability."
        elif any(term in cat_lower for term in ["chips", "swarf", "turnings", "scrap"]):
            action = "Evaluate Recycling"
            reason = f"Detailed laboratory assay profile on file ({lab_count} parameters); evaluate closed-loop remelting or secondary alloy toll-refining."
            suggested_next_step = "Conduct pilot test melt to verify tramp element tolerance and ingot mechanical properties."
        else:
            action = "Evaluate Treatment"
            reason = f"Laboratory assay matrix recorded ({lab_count} parameters); verify effluent/discharge compliance thresholds against statutory environmental limits."
            suggested_next_step = "Compare measured concentrations against regional pollution control board disposal thresholds."

        return RecommendationDetail(
            action=action,
            priority="High" if score >= 65 else "Medium",
            reason=reason,
            supporting_evidence=supporting_evidence or [f"{lab_count} verified laboratory assays recorded in IndusTrace."],
            missing_information=missing_info,
            limitations="Laboratory assays represent specific sampled batches; variation across production cycles requires ongoing quality control.",
            suggested_next_step=suggested_next_step
        )

    # 3. Partial Laboratory Assays Recorded (1 - 2 parameters)
    if lab_count > 0:
        return RecommendationDetail(
            action="Conduct Supplementary Laboratory Testing",
            priority="High" if score >= 60 else "Medium",
            reason=f"Partial laboratory profile on file ({lab_count} parameter(s)), but complete elemental matrix and tramp contaminant thresholds remain unverified.",
            supporting_evidence=supporting_evidence or ["Preliminary screening assay exists, but full characterization is pending."],
            missing_information=missing_info,
            limitations="A single measured analyte does not guarantee alloy compatibility or the absence of hazardous tramp elements.",
            suggested_next_step="Commission multi-element ICP-OES or XRF spectrometry to establish complete chemical matrix before authorizing commercial recovery."
        )

    # 4. No Laboratory Assays Recorded: High TWS Urgency (>= 70)
    if score >= 70.0:
        return RecommendationDetail(
            action="Conduct Laboratory Testing",
            priority="High",
            reason=f"High Test Worthiness Score ({score:.1f}/100) indicates substantial volume and critical compositional information deficit.",
            supporting_evidence=supporting_evidence or ["High volume throughput with substantial uncertainty regarding valuable or hazardous constituents."],
            missing_information=missing_info,
            limitations="Research literature indicates potential valorization or treatment constraints, but exact chemical composition requires certified physical assays.",
            suggested_next_step="Procure representative production sample, submit for accredited elemental assay (ICP-OES / XRF), and record results in Laboratory module."
        )

    # 5. No Laboratory Assays Recorded: Moderate TWS (50 - 69.9)
    if score >= 50.0:
        cat_lower = (stream.waste_category or "").lower()
        if "chips" in cat_lower or "swarf" in cat_lower:
            action = "Evaluate Reuse"
            reason = f"Moderate investigation score ({score:.1f}/100); evaluate shop-floor briquetting and cutting fluid centrifuge recovery prior to external smelting."
            next_step = "Measure residual cutting fluid moisture content to evaluate mechanical briquetting feasibility."
        else:
            action = "Conduct Laboratory Testing"
            reason = f"Moderate investigation priority ({score:.1f}/100); screening-level chemical assay recommended to resolve recovery or disposal pathway."
            next_step = "Run single-analyte or rapid XRF screening for primary suspect metal or hazardous component."

        return RecommendationDetail(
            action=action,
            priority="Medium",
            reason=reason,
            supporting_evidence=supporting_evidence,
            missing_information=missing_info,
            limitations="Derived from heuristic screening parameters; operating conditions and scrap clean-out practices may alter material suitability.",
            suggested_next_step=next_step
        )

    # 6. Low TWS (< 50)
    return RecommendationDetail(
        action="Consider Authorized Disposal",
        priority="Low",
        reason=f"Low investigation priority ({score:.1f}/100); minimal generation volume or low recovery potential makes advanced characterization economically unjustifiable.",
        supporting_evidence=supporting_evidence or ["Low volume or low intrinsic recovery relevance."],
        missing_information=missing_info,
        limitations="Does not exempt the facility from statutory hazardous waste characterization if toxic constituents are suspected.",
        suggested_next_step="Route through authorized licensed waste collector and maintain manifest documentation."
    )

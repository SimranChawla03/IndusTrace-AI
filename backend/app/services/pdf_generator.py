# backend/app/services/pdf_generator.py
import io
from datetime import datetime
from typing import Optional, List, Dict, Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether
)

from app.models.entities import WasteStream, TestAssessment, LabResult, Company

# Brand Color Palette
C_PRIMARY = colors.HexColor("#1B4D36")    # Deep forest green
C_ACCENT = colors.HexColor("#26734D")     # Emerald sage
C_LIGHT_BG = colors.HexColor("#F7F8F3")   # Off-white canvas
C_ALT_ROW = colors.HexColor("#EDF3EB")    # Soft sage tint
C_BORDER = colors.HexColor("#DCE5DA")     # Border line
C_DARK_TEXT = colors.HexColor("#202C25")  # Dark charcoal text
C_MUTED = colors.HexColor("#56645A")      # Secondary text
C_WHITE = colors.HexColor("#FFFFFF")
C_WARN_BG = colors.HexColor("#FFF8EA")
C_WARN_TEXT = colors.HexColor("#8A5A00")

def _get_styles():
    base = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        "IndusTitle",
        parent=base["Title"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        textColor=C_PRIMARY,
        alignment=0,
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        "IndusSubtitle",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=C_MUTED,
        spaceAfter=10
    )
    
    h1_style = ParagraphStyle(
        "IndusH1",
        parent=base["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=C_PRIMARY,
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )
    
    h2_style = ParagraphStyle(
        "IndusH2",
        parent=base["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=13,
        textColor=C_ACCENT,
        spaceBefore=7,
        spaceAfter=3,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        "IndusBody",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=12,
        textColor=C_DARK_TEXT,
        spaceAfter=4
    )

    body_bold = ParagraphStyle(
        "IndusBodyBold",
        parent=body_style,
        fontName="Helvetica-Bold"
    )
    
    table_cell = ParagraphStyle(
        "TableCell",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=11,
        textColor=C_DARK_TEXT
    )
    
    table_cell_bold = ParagraphStyle(
        "TableCellBold",
        parent=table_cell,
        fontName="Helvetica-Bold"
    )

    badge_style = ParagraphStyle(
        "BadgeStyle",
        parent=base["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=10,
        textColor=C_PRIMARY,
        alignment=1
    )

    callout_style = ParagraphStyle(
        "CalloutStyle",
        parent=base["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=8,
        leading=11,
        textColor=C_WARN_TEXT
    )

    footer_style = ParagraphStyle(
        "FooterStyle",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=7,
        leading=9.5,
        textColor=C_MUTED,
        alignment=1
    )

    return {
        "title": title_style,
        "subtitle": subtitle_style,
        "h1": h1_style,
        "h2": h2_style,
        "body": body_style,
        "body_bold": body_bold,
        "table_cell": table_cell,
        "table_cell_bold": table_cell_bold,
        "badge": badge_style,
        "callout": callout_style,
        "footer": footer_style,
    }


def _build_header(stream: WasteStream, company: Optional[Company], report_name: str, styles: dict) -> List[Any]:
    elements = []
    now_str = datetime.now().strftime("%B %d, %Y - %H:%M UTC")
    comp_name = company.name if company else "IndusTrace Industrial Partner"
    
    header_data = [
        [
            Paragraph(f"<b>IndusTrace AI</b> &bull; Manufacturing Intelligence", styles["subtitle"]),
            Paragraph(f"Generated: {now_str}", ParagraphStyle("RightSub", parent=styles["subtitle"], alignment=2))
        ],
        [
            Paragraph(report_name, styles["title"]),
            Paragraph(f"<b>Stream:</b> {stream.stream_name}<br/><b>Facility:</b> {comp_name}", 
                      ParagraphStyle("MetaRight", parent=styles["body"], alignment=2))
        ]
    ]
    t = Table(header_data, colWidths=[4.0 * inch, 3.2 * inch])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
    ]))
    elements.append(t)
    elements.append(HRFlowable(width="100%", thickness=1.5, color=C_PRIMARY, spaceBefore=4, spaceAfter=8))
    return elements


def _build_footer(styles: dict) -> List[Any]:
    elements = [
        Spacer(1, 10),
        HRFlowable(width="100%", thickness=0.75, color=C_BORDER, spaceBefore=4, spaceAfter=4),
        Paragraph(
            "IndusTrace AI Decision Support System &bull; University IDEA Lab Project &bull; "
            "Confidential operational document. All analytical conclusions are decision-support estimates "
            "and subject to certified laboratory verification. Never describes synthetic data as observed factory results.",
            styles["footer"]
        )
    ]
    return elements


def generate_executive_summary_pdf(
    stream: WasteStream,
    company: Optional[Company],
    assessment: Optional[TestAssessment],
    lab_results: List[LabResult]
) -> bytes:
    """Generates an Executive Summary PDF report."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=0.65 * inch,
        rightMargin=0.65 * inch,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch
    )
    styles = _get_styles()
    story = []

    # Header
    story.extend(_build_header(stream, company, "Executive Waste Stream Summary", styles))

    # High-level Overview Cards
    tws_val = f"{assessment.tws_score:.1f}/100" if (assessment and assessment.tws_score is not None) else "Pending"
    priority = assessment.priority_level if assessment else "Review Required"
    
    # Accurate provenance counting
    verified_count = sum(1 for r in lab_results if r.data_origin == "VERIFIED_LAB_EVIDENCE")
    user_count = sum(1 for r in lab_results if r.data_origin == "USER_ENTERED")
    demo_count = sum(1 for r in lab_results if r.data_origin == "SYNTHETIC_DEMO")
    
    if len(lab_results) == 0:
        lab_status_str = "0 tests logged (Testing Pending)"
    elif verified_count > 0:
        lab_status_str = f"{len(lab_results)} assay(s) ({verified_count} Verified)"
    elif demo_count > 0:
        lab_status_str = f"{len(lab_results)} parameter(s) (Synthetic Demo Data)"
    else:
        lab_status_str = f"{len(lab_results)} parameter(s) (Company-reported / Unverified)"

    qty_str = f"{stream.quantity or 0:,.1f} {stream.quantity_unit or 'kg/month'}"
    
    summary_data = [
        [
            Paragraph("<b>Waste Stream</b>", styles["table_cell_bold"]),
            Paragraph(stream.stream_name, styles["table_cell"]),
            Paragraph("<b>Test Worthiness (TWS)</b>", styles["table_cell_bold"]),
            Paragraph(f"<b>{tws_val}</b> ({priority})", styles["table_cell_bold"])
        ],
        [
            Paragraph("<b>Generating Process</b>", styles["table_cell_bold"]),
            Paragraph(stream.generating_process or "Machining / Production", styles["table_cell"]),
            Paragraph("<b>Generation Volume</b>", styles["table_cell_bold"]),
            Paragraph(qty_str, styles["table_cell"])
        ],
        [
            Paragraph("<b>Current Handling</b>", styles["table_cell_bold"]),
            Paragraph(stream.current_handling or "Secondary Smelting / Down-cycling", styles["table_cell"]),
            Paragraph("<b>Evidence Profile</b>", styles["table_cell_bold"]),
            Paragraph(lab_status_str, styles["table_cell"])
        ]
    ]
    t_summary = Table(summary_data, colWidths=[1.8 * inch, 2.0 * inch, 1.8 * inch, 1.6 * inch])
    t_summary.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), C_LIGHT_BG),
        ("BOX", (0, 0), (-1, -1), 1, C_BORDER),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, C_BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(t_summary)
    story.append(Spacer(1, 8))

    # Executive Narrative & Strategic Recommendation
    story.append(Paragraph("Strategic Decision Context", styles["h1"]))
    rec_text = (
        assessment.recommendation 
        if assessment and assessment.recommendation 
        else "Proceed with standard spectroscopic characterization to establish baseline elemental concentrations before selecting final recycling pathway."
    )
    story.append(Paragraph(
        f"This waste stream was evaluated under the IndusTrace Multi-Factor Decision Framework. "
        f"Based on reported throughput volume, material contamination risk, and market valorization differentials, "
        f"the platform delivers the following primary directive: <b>{rec_text}</b>",
        styles["body"]
    ))
    story.append(Spacer(1, 6))

    # TWS Factor Breakdown Summary Table
    story.append(Paragraph("Investigation Priority Breakdown", styles["h1"]))
    factor_list = assessment.factor_breakdown if assessment and assessment.factor_breakdown else []
    
    factor_rows = [
        [
            Paragraph("<b>Decision Factor</b>", styles["table_cell_bold"]),
            Paragraph("<b>Weight</b>", styles["table_cell_bold"]),
            Paragraph("<b>Score (0-100)</b>", styles["table_cell_bold"]),
            Paragraph("<b>Weighted</b>", styles["table_cell_bold"]),
            Paragraph("<b>Operational Meaning / Assessment</b>", styles["table_cell_bold"])
        ]
    ]

    if isinstance(factor_list, list) and len(factor_list) > 0:
        for f in factor_list:
            if hasattr(f, "model_dump"):
                f = f.model_dump()
            elif hasattr(f, "dict"):
                f = f.dict()
            fname = str(f.get("name", "Factor") if isinstance(f, dict) else getattr(f, "name", "Factor"))
            w_pct = float(f.get("weight_percent", 0.0) if isinstance(f, dict) else getattr(f, "weight_percent", 0.0))
            n_score = float(f.get("normalized_score", 0.0) if isinstance(f, dict) else getattr(f, "normalized_score", 0.0))
            w_cont = float(f.get("weighted_contribution", 0.0) if isinstance(f, dict) else getattr(f, "weighted_contribution", 0.0))
            expl = str(f.get("explanation", "") if isinstance(f, dict) else getattr(f, "explanation", ""))
            factor_rows.append([
                Paragraph(fname.replace("_", " "), styles["table_cell_bold"]),
                Paragraph(f"{w_pct:.0f}%", styles["table_cell"]),
                Paragraph(f"{n_score:.1f}", styles["table_cell"]),
                Paragraph(f"{w_cont:.1f}", styles["table_cell_bold"]),
                Paragraph(expl, styles["table_cell"])
            ])
        t_factors = Table(factor_rows, colWidths=[1.4 * inch, 0.7 * inch, 1.0 * inch, 0.9 * inch, 3.2 * inch])
        t_factors.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), C_ALT_ROW),
            ("BOX", (0, 0), (-1, -1), 1, C_BORDER),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, C_BORDER),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(t_factors)

    # Next steps
    story.append(Spacer(1, 8))
    story.append(Paragraph("Prescribed Next Steps & Limitations", styles["h1"]))
    rec_det = assessment.recommendation_details if assessment and assessment.recommendation_details else {}
    if hasattr(rec_det, "model_dump"):
        rec_det = rec_det.model_dump()
    elif hasattr(rec_det, "dict"):
        rec_det = rec_det.dict()
    next_step = rec_det.get("suggested_next_step", "Submit representative sample to accredited metallurgical laboratory.") if isinstance(rec_det, dict) else "Submit representative sample."
    limits = rec_det.get("limitations", "Results reflect specific batch inputs; variation between production cycles requires periodic verification.") if isinstance(rec_det, dict) else "Results reflect specific batch inputs."

    story.append(Paragraph(f"<b>Suggested Action:</b> {next_step}", styles["body"]))
    story.append(Paragraph(f"<b>Scientific Limitations:</b> {limits}", styles["body"]))

    # Footer
    story.extend(_build_footer(styles))

    doc.build(story)
    return buffer.getvalue()


def generate_technical_report_pdf(
    stream: WasteStream,
    company: Optional[Company],
    assessment: Optional[TestAssessment],
    lab_results: List[LabResult]
) -> bytes:
    """Generates a Technical Deep Dive PDF report."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=0.65 * inch,
        rightMargin=0.65 * inch,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch
    )
    styles = _get_styles()
    story = []

    # Header
    story.extend(_build_header(stream, company, "Technical Waste Characterization Report", styles))

    # Section 1: Baseline Manufacturing & Material Profile
    story.append(Paragraph("1. Manufacturing & Physical Profile", styles["h1"]))
    meta_data = [
        [
            Paragraph("<b>Waste Stream ID / Name:</b>", styles["table_cell_bold"]),
            Paragraph(f"#{stream.id} - {stream.stream_name}", styles["table_cell"]),
            Paragraph("<b>Category:</b>", styles["table_cell_bold"]),
            Paragraph(stream.waste_category, styles["table_cell"])
        ],
        [
            Paragraph("<b>Generating Process:</b>", styles["table_cell_bold"]),
            Paragraph(stream.generating_process or "Unspecified", styles["table_cell"]),
            Paragraph("<b>Operating Facility:</b>", styles["table_cell_bold"]),
            Paragraph(stream.facility.name if stream.facility else "General Facility", styles["table_cell"])
        ],
        [
            Paragraph("<b>Reported Mass Rate:</b>", styles["table_cell_bold"]),
            Paragraph(f"{stream.quantity or 'Unknown'} {stream.quantity_unit or ''} ({stream.frequency or 'Rate N/A'})", styles["table_cell"]),
            Paragraph("<b>Handling Cost:</b>", styles["table_cell_bold"]),
            Paragraph(f"INR {stream.estimated_handling_cost:,.2f}" if stream.estimated_handling_cost else "Unrecorded", styles["table_cell"])
        ],
        [
            Paragraph("<b>Reported Matrix / Contaminants:</b>", styles["table_cell_bold"]),
            Paragraph(stream.known_characteristics or "No initial chemical data logged", styles["table_cell"]),
            Paragraph("<b>Current Disposition:</b>", styles["table_cell_bold"]),
            Paragraph(stream.current_handling or "External disposal", styles["table_cell"])
        ]
    ]
    t_meta = Table(meta_data, colWidths=[1.8 * inch, 2.0 * inch, 1.6 * inch, 1.8 * inch])
    t_meta.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), C_LIGHT_BG),
        ("BOX", (0, 0), (-1, -1), 1, C_BORDER),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, C_BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 3.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 8))

    # Section 2: Laboratory Test Results & Provenance
    story.append(Paragraph("2. Laboratory Assays & Characterization Matrix", styles["h1"]))
    if lab_results:
        lab_headers = [
            Paragraph("<b>Sample ID</b>", styles["table_cell_bold"]),
            Paragraph("<b>Test / Method</b>", styles["table_cell_bold"]),
            Paragraph("<b>Analyte / Parameter</b>", styles["table_cell_bold"]),
            Paragraph("<b>Reported Value</b>", styles["table_cell_bold"]),
            Paragraph("<b>Standard Unit</b>", styles["table_cell_bold"]),
            Paragraph("<b>Evidence Status & Laboratory</b>", styles["table_cell_bold"]),
        ]
        lab_rows = [lab_headers]
        for lr in lab_results[:25]:
            val_display = lr.result_value_str or (f"{lr.result_value_numeric:.4f}" if lr.result_value_numeric is not None else "N/A")
            provenance_tag = (
                "Verified Evidence" if lr.data_origin == "VERIFIED_LAB_EVIDENCE" else
                "CAESAR Public Ref" if lr.data_origin == "CAESAR_EXPERIMENTAL_REFERENCE" else
                "Synthetic Demo" if lr.data_origin == "SYNTHETIC_DEMO" else
                "Company-Reported (Unverified)"
            )
            lab_rows.append([
                Paragraph(lr.sample_id, styles["table_cell"]),
                Paragraph(lr.test_name or "OES / ICP-MS", styles["table_cell"]),
                Paragraph(f"<b>{lr.measured_parameter}</b>", styles["table_cell"]),
                Paragraph(val_display, styles["table_cell_bold"]),
                Paragraph(lr.unit or "wt%", styles["table_cell"]),
                Paragraph(f"{provenance_tag}<br/><i>{lr.laboratory or 'Accredited Lab'}</i>", styles["table_cell"]),
            ])
        t_lab = Table(lab_rows, colWidths=[1.1 * inch, 1.4 * inch, 1.3 * inch, 0.9 * inch, 0.7 * inch, 1.8 * inch])
        t_lab.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), C_ALT_ROW),
            ("BOX", (0, 0), (-1, -1), 1, C_BORDER),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, C_BORDER),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(t_lab)
    else:
        empty_note = (
            "No verified laboratory assay results are currently linked to this stream. "
            "Characterization testing (ICP-MS, OES, or XRD) is strongly recommended to confirm "
            "impurity thresholds before industrial thermal recovery."
        )
        t_empty = Table([[Paragraph(empty_note, styles["callout"])]], colWidths=[7.2 * inch])
        t_empty.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), C_WARN_BG),
            ("BOX", (0, 0), (-1, -1), 1, C_BORDER),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 7),
            ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ]))
        story.append(t_empty)

    story.append(Spacer(1, 8))

    # Section 3: Waste Intelligence Repository (WIR) Matched Rules
    story.append(Paragraph("3. Scientific Rules & Literature Precedents", styles["h1"]))
    rules = assessment.matched_rules if assessment and assessment.matched_rules else []
    if rules:
        rule_rows = [
            [
                Paragraph("<b>Rule ID</b>", styles["table_cell_bold"]),
                Paragraph("<b>Condition / Gap</b>", styles["table_cell_bold"]),
                Paragraph("<b>Mandated Action / Testing Protocol</b>", styles["table_cell_bold"]),
                Paragraph("<b>Literature Source</b>", styles["table_cell_bold"])
            ]
        ]
        for r in rules[:5]:
            if hasattr(r, "model_dump"):
                r = r.model_dump()
            elif hasattr(r, "dict"):
                r = r.dict()
            rule_id = str(r.get("rule_id", "WIR-RULE") if isinstance(r, dict) else getattr(r, "rule_id", "WIR-RULE"))
            cond = str(r.get("missing_or_condition", "Operational constraint") if isinstance(r, dict) else getattr(r, "missing_or_condition", "Operational constraint"))
            act = str(r.get("rule_action", "Conduct chemical assay") if isinstance(r, dict) else getattr(r, "rule_action", "Conduct chemical assay"))
            src = str(r.get("evidence_source_id", "Ref") if isinstance(r, dict) else getattr(r, "evidence_source_id", "Ref"))
            rule_rows.append([
                Paragraph(rule_id, styles["table_cell_bold"]),
                Paragraph(cond, styles["table_cell"]),
                Paragraph(act, styles["table_cell"]),
                Paragraph(src, styles["table_cell"])
            ])
        t_rules = Table(rule_rows, colWidths=[1.1 * inch, 2.2 * inch, 2.7 * inch, 1.2 * inch])
        t_rules.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), C_ALT_ROW),
            ("BOX", (0, 0), (-1, -1), 1, C_BORDER),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, C_BORDER),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(t_rules)
    else:
        story.append(Paragraph("Standard baseline heuristics applied. No specialized WIR exception triggered.", styles["body"]))

    # Footer
    story.extend(_build_footer(styles))

    doc.build(story)
    return buffer.getvalue()


def generate_recommendations_pdf(
    stream: WasteStream,
    company: Optional[Company],
    assessment: Optional[TestAssessment],
    lab_results: List[LabResult]
) -> bytes:
    """Generates a Strategic Recovery & Valorization Pathway Recommendations PDF report."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=0.65 * inch,
        rightMargin=0.65 * inch,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch
    )
    styles = _get_styles()
    story = []

    # Header
    story.extend(_build_header(stream, company, "Resource Recovery & Valorization Roadmap", styles))

    cat_lower = (stream.waste_category or "").lower()
    is_liquid_or_effluent = any(w in cat_lower for w in ["wastewater", "effluent", "rinse", "acid", "liquor", "solution"])

    # Strategic Recommendation
    rec_text = assessment.recommendation if assessment else "Evaluate Processing Feasibility"
    
    # Check if a modeled recovery scenario exists on file
    scenarios = stream.recovery_scenarios if hasattr(stream, "recovery_scenarios") and stream.recovery_scenarios else []
    active_scen = scenarios[0] if scenarios else None

    if active_scen:
        target_material = active_scen.target_material
        scen_type = "Hypothetical Scenario" if active_scen.scenario_type == "HYPOTHETICAL_SCENARIO" else "Confirmed Lab Assay"
        yield_pct = f"{active_scen.recovery_rate_assumption * 100:.1f}%"
        status_note = f"Modeled Scenario ({scen_type})"
    else:
        target_material = "Pre-Assessment Screening"
        yield_pct = "Subject to Lab Assay"
        status_note = "Pre-Testing Stage"

    banner_data = [
        [
            Paragraph("<b>Recommended Pathway:</b>", styles["table_cell_bold"]),
            Paragraph(f"<b>{rec_text}</b>", ParagraphStyle("BigRoute", parent=styles["body_bold"], textColor=C_PRIMARY, fontSize=10)),
            Paragraph("<b>Yield Assumption:</b>", styles["table_cell_bold"]),
            Paragraph(f"<b>{yield_pct}</b><br/><i>{status_note}</i>", styles["table_cell"])
        ]
    ]
    t_banner = Table(banner_data, colWidths=[1.8 * inch, 2.6 * inch, 1.4 * inch, 1.4 * inch])
    t_banner.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), C_ALT_ROW),
        ("BOX", (0, 0), (-1, -1), 1, C_PRIMARY),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(t_banner)
    story.append(Spacer(1, 10))

    # Evaluated Recovery Pathways
    story.append(Paragraph("1. Evaluated Processing Pathways & Technical Suitability", styles["h1"]))
    
    if is_liquid_or_effluent:
        pathways = [
            [
                Paragraph("<b>Treatment / Valorization Route</b>", styles["table_cell_bold"]),
                Paragraph("<b>Technical Feasibility</b>", styles["table_cell_bold"]),
                Paragraph("<b>Yield Expectation</b>", styles["table_cell_bold"]),
                Paragraph("<b>Strategic Suitability</b>", styles["table_cell_bold"]),
            ],
            [
                Paragraph("Heavy Metal Chemical Precipitation", styles["table_cell_bold"]),
                Paragraph("High (Standard hydroxide / sulfide precipitation)", styles["table_cell"]),
                Paragraph("90 - 98% metal capture in sludge", styles["table_cell"]),
                Paragraph("Recommended to prevent hazardous discharge and concentrate heavy metals.", styles["table_cell"]),
            ],
            [
                Paragraph("Multi-Stage Filtration & Zero Liquid Discharge (ZLD)", styles["table_cell_bold"]),
                Paragraph("Moderate (Requires RO / Evaporator energy)", styles["table_cell"]),
                Paragraph("85 - 95% water recovery", styles["table_cell"]),
                Paragraph("Water recycling for cooling or rinse stages; complies with statutory norms.", styles["table_cell"]),
            ],
            [
                Paragraph("Direct Neutralization & Statutory Discharge", styles["table_cell_bold"]),
                Paragraph("High (Standard acidic effluent routing)", styles["table_cell"]),
                Paragraph("N/A (Discharge)", styles["table_cell"]),
                Paragraph("Permissible only if dissolved heavy metals are below Pollution Control thresholds.", styles["table_cell"]),
            ],
        ]
    else:
        pathways = [
            [
                Paragraph("<b>Valorization Route</b>", styles["table_cell_bold"]),
                Paragraph("<b>Technical Feasibility</b>", styles["table_cell_bold"]),
                Paragraph("<b>Yield Expectation</b>", styles["table_cell_bold"]),
                Paragraph("<b>Strategic Suitability</b>", styles["table_cell_bold"]),
            ],
            [
                Paragraph("Direct Closed-Loop In-House Remelt", styles["table_cell_bold"]),
                Paragraph("Conditional (Requires clean swarf, low cutting fluid)", styles["table_cell"]),
                Paragraph("82 - 88% (Theoretical)", styles["table_cell"]),
                Paragraph("Highest value retention; requires briquetting & de-oiling stage.", styles["table_cell"]),
            ],
            [
                Paragraph("Secondary Specialized Alloy Smelter", styles["table_cell_bold"]),
                Paragraph("High Feasibility (Standard industry route)", styles["table_cell"]),
                Paragraph("74 - 82% (Standard secondary)", styles["table_cell"]),
                Paragraph("Recommended immediate option. Tolerates moderate trace impurities.", styles["table_cell"]),
            ],
            [
                Paragraph("Downgraded Cascaded Remelt / Slag", styles["table_cell_bold"]),
                Paragraph("High Feasibility (Current default)", styles["table_cell"]),
                Paragraph("55 - 65% (Down-cycling)", styles["table_cell"]),
                Paragraph("Sub-optimal economic value; results in permanent alloy degradation.", styles["table_cell"]),
            ],
        ]

    t_path = Table(pathways, colWidths=[2.2 * inch, 2.0 * inch, 1.2 * inch, 1.8 * inch])
    t_path.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), C_ALT_ROW),
        ("BOX", (0, 0), (-1, -1), 1, C_BORDER),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, C_BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(t_path)
    story.append(Spacer(1, 10))

    # Implementation Milestones
    story.append(Paragraph("2. Implementation Roadmap & Quality Gates", styles["h1"]))
    roadmap_items = [
        [
            Paragraph("<b>Phase</b>", styles["table_cell_bold"]),
            Paragraph("<b>Milestone Description</b>", styles["table_cell_bold"]),
            Paragraph("<b>Required Validation & Quality Gate</b>", styles["table_cell_bold"]),
        ],
        [
            Paragraph("Phase 1: Characterization", styles["table_cell_bold"]),
            Paragraph("Procure accredited multi-element laboratory assay (ICP-OES / XRF)", styles["table_cell"]),
            Paragraph("Certified third-party lab assay sheet uploaded to Laboratory register", styles["table_cell"]),
        ],
        [
            Paragraph("Phase 2: Pilot Trial", styles["table_cell_bold"]),
            Paragraph("Bench-scale trial melt or precipitation trial with mass balance verification", styles["table_cell"]),
            Paragraph("Recovered ingot/product composition verified within commercial grade tolerance", styles["table_cell"]),
        ],
        [
            Paragraph("Phase 3: Circular Routing", styles["table_cell_bold"]),
            Paragraph("Execute commercial supply agreement with certified secondary smelter/recycler", styles["table_cell"]),
            Paragraph("Manifest tracking and periodic batch quality audits recorded in IndusTrace", styles["table_cell"]),
        ],
    ]
    t_road = Table(roadmap_items, colWidths=[1.8 * inch, 2.7 * inch, 2.7 * inch])
    t_road.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), C_ALT_ROW),
        ("BOX", (0, 0), (-1, -1), 1, C_BORDER),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, C_BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(t_road)

    # Footer
    story.extend(_build_footer(styles))

    doc.build(story)
    return buffer.getvalue()

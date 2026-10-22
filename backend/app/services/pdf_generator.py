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
        fontSize=20,
        leading=24,
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
        spaceAfter=12
    )
    
    h1_style = ParagraphStyle(
        "IndusH1",
        parent=base["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        textColor=C_PRIMARY,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )
    
    h2_style = ParagraphStyle(
        "IndusH2",
        parent=base["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=10.5,
        leading=14,
        textColor=C_ACCENT,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        "IndusBody",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
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
        fontSize=8.5,
        leading=11.5,
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
        fontSize=9,
        leading=11,
        textColor=C_PRIMARY,
        alignment=1
    )

    callout_style = ParagraphStyle(
        "CalloutStyle",
        parent=base["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=8.5,
        leading=12,
        textColor=C_WARN_TEXT
    )

    footer_style = ParagraphStyle(
        "FooterStyle",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=7.5,
        leading=10,
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
    
    # Top banner table with title and metadata
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
    elements.append(HRFlowable(width="100%", thickness=1.5, color=C_PRIMARY, spaceBefore=4, spaceAfter=10))
    return elements


def _build_footer(styles: dict) -> List[Any]:
    elements = [
        Spacer(1, 14),
        HRFlowable(width="100%", thickness=0.75, color=C_BORDER, spaceBefore=4, spaceAfter=6),
        Paragraph(
            "IndusTrace AI Decision Support System &bull; University IDEA Lab Project &bull; "
            "Confidential operational document. All analytical conclusions are decision-support estimates "
            "and subject to certified laboratory verification.",
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
    tws_val = f"{assessment.tws_score:.1f}/100" if assessment else "Pending"
    priority = assessment.priority_level if assessment else "Review Required"
    tested_count = len(lab_results)
    
    qty_str = f"{stream.quantity or 0:,.1f} {stream.quantity_unit or 'tons/month'}"
    freq_str = stream.frequency or "Continuous"
    
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
            Paragraph("<b>Lab Assays on File</b>", styles["table_cell_bold"]),
            Paragraph(f"{tested_count} verified parameters", styles["table_cell"])
        ]
    ]
    t_summary = Table(summary_data, colWidths=[1.8 * inch, 2.0 * inch, 1.8 * inch, 1.6 * inch])
    t_summary.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), C_LIGHT_BG),
        ("BOX", (0, 0), (-1, -1), 1, C_BORDER),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, C_BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(t_summary)
    story.append(Spacer(1, 10))

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
    story.append(Spacer(1, 8))

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
            norm_s = float(f.get("normalized_score", 0.0) if isinstance(f, dict) else getattr(f, "normalized_score", 0.0))
            wt_c = float(f.get("weighted_contribution", 0.0) if isinstance(f, dict) else getattr(f, "weighted_contribution", 0.0))
            expl = str(f.get("explanation", "") if isinstance(f, dict) else getattr(f, "explanation", ""))
            factor_rows.append([
                Paragraph(fname, styles["table_cell_bold"]),
                Paragraph(f"{w_pct:.0f}%", styles["table_cell"]),
                Paragraph(f"{norm_s:.1f}", styles["table_cell"]),
                Paragraph(f"{wt_c:.1f}", styles["table_cell"]),
                Paragraph(expl, styles["table_cell"])
            ])
    else:
        # Fallback if no breakdown list
        factor_rows.append([
            Paragraph("Assessment Pending", styles["table_cell"]),
            Paragraph("-", styles["table_cell"]),
            Paragraph("-", styles["table_cell"]),
            Paragraph("-", styles["table_cell"]),
            Paragraph("Detailed factor scoring pending evaluation.", styles["table_cell"])
        ])

    t_factors = Table(factor_rows, colWidths=[1.5 * inch, 0.7 * inch, 1.0 * inch, 0.8 * inch, 3.2 * inch])
    t_factors.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), C_ALT_ROW),
        ("BOX", (0, 0), (-1, -1), 1, C_BORDER),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, C_BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(t_factors)
    story.append(Spacer(1, 10))

    # Action Items
    story.append(Paragraph("Recommended Executive Actions", styles["h1"]))
    missing = assessment.missing_critical_info if assessment and assessment.missing_critical_info else []
    if missing:
        missing_text = "; ".join(missing)
        callout_text = f"<b>Immediate Data Deficits:</b> The following analytical data are currently missing: {missing_text}. Commissioning these laboratory tests will eliminate uncertainty in route selection."
    else:
        callout_text = "<b>Assay Profile Complete:</b> Basic elemental characterization exists on file. Proceed to technical melt batch qualification."
    
    t_callout = Table([[Paragraph(callout_text, styles["callout"])]], colWidths=[7.2 * inch])
    t_callout.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), C_WARN_BG),
        ("BOX", (0, 0), (-1, -1), 1, C_BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(t_callout)

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
    """Generates a Technical Waste Investigation & Laboratory Characterization PDF report."""
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
    story.extend(_build_header(stream, company, "Technical Investigation & Laboratory Report", styles))

    # Section 1: Stream Technical Metadata
    story.append(Paragraph("1. Material Specification & Process Origins", styles["h1"]))
    meta_data = [
        [
            Paragraph("<b>Stream Identification:</b>", styles["table_cell_bold"]),
            Paragraph(f"{stream.stream_name} (ID: {stream.id})", styles["table_cell"]),
            Paragraph("<b>Category:</b>", styles["table_cell_bold"]),
            Paragraph(stream.waste_category or "Unspecified", styles["table_cell"])
        ],
        [
            Paragraph("<b>Origin Process:</b>", styles["table_cell_bold"]),
            Paragraph(stream.generating_process or "N/A", styles["table_cell"]),
            Paragraph("<b>Throughput:</b>", styles["table_cell_bold"]),
            Paragraph(f"{stream.quantity or 0} {stream.quantity_unit or 'tons/mo'} ({stream.frequency or 'Regular'})", styles["table_cell"])
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
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 10))

    # Section 2: Laboratory Test Results
    story.append(Paragraph("2. Confirmed Laboratory Assays & Elemental Matrix", styles["h1"]))
    if lab_results:
        lab_headers = [
            Paragraph("<b>Sample ID</b>", styles["table_cell_bold"]),
            Paragraph("<b>Test / Method</b>", styles["table_cell_bold"]),
            Paragraph("<b>Measured Element / Analyte</b>", styles["table_cell_bold"]),
            Paragraph("<b>Reported Value</b>", styles["table_cell_bold"]),
            Paragraph("<b>Standard Unit</b>", styles["table_cell_bold"]),
            Paragraph("<b>Assay Laboratory / Provenance</b>", styles["table_cell_bold"]),
        ]
        lab_rows = [lab_headers]
        for lr in lab_results[:25]:  # include up to 25 rows
            val_display = lr.result_value_str or (f"{lr.result_value_numeric:.4f}" if lr.result_value_numeric is not None else "N/A")
            lab_rows.append([
                Paragraph(lr.sample_id, styles["table_cell"]),
                Paragraph(lr.test_name or "OES / ICP-MS", styles["table_cell"]),
                Paragraph(f"<b>{lr.measured_parameter}</b>", styles["table_cell"]),
                Paragraph(val_display, styles["table_cell_bold"]),
                Paragraph(lr.unit or "wt%", styles["table_cell"]),
                Paragraph(lr.laboratory or "Accredited Lab", styles["table_cell"]),
            ])
        t_lab = Table(lab_rows, colWidths=[1.1 * inch, 1.5 * inch, 1.3 * inch, 1.0 * inch, 0.7 * inch, 1.6 * inch])
        t_lab.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), C_ALT_ROW),
            ("BOX", (0, 0), (-1, -1), 1, C_BORDER),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, C_BORDER),
            ("TOPPADDING", (0, 0), (-1, -1), 3.5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
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
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), tramp_width := 8),
        ]))
        story.append(t_empty)

    story.append(Spacer(1, 10))

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
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
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

    # Priority Classification Banner
    tws = assessment.tws_score if assessment else 50.0
    rec_details = assessment.recommendation_details if assessment and assessment.recommendation_details else {}
    if hasattr(rec_details, "model_dump"):
        rec_details = rec_details.model_dump()
    elif hasattr(rec_details, "dict"):
        rec_details = rec_details.dict()
    target_route = rec_details.get("recommended_route", "High-Value Secondary Metallurgy") if isinstance(rec_details, dict) else getattr(rec_details, "recommended_route", "High-Value Secondary Metallurgy")
    est_yield = float(rec_details.get("estimated_recovery_yield_percent", 78.5) if isinstance(rec_details, dict) else getattr(rec_details, "estimated_recovery_yield_percent", 78.5))
    
    banner_data = [
        [
            Paragraph("<b>Recommended Recovery Route:</b>", styles["table_cell_bold"]),
            Paragraph(f"<b>{target_route}</b>", ParagraphStyle("BigRoute", parent=styles["body_bold"], textColor=C_PRIMARY, fontSize=11)),
            Paragraph("<b>Est. Metal Yield:</b>", styles["table_cell_bold"]),
            Paragraph(f"<b>{est_yield:.1f}%</b>", ParagraphStyle("BigYield", parent=styles["body_bold"], textColor=C_PRIMARY, fontSize=11))
        ]
    ]
    t_banner = Table(banner_data, colWidths=[2.0 * inch, 2.5 * inch, 1.4 * inch, 1.3 * inch])
    t_banner.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), C_ALT_ROW),
        ("BOX", (0, 0), (-1, -1), 1, C_PRIMARY),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(t_banner)
    story.append(Spacer(1, 12))

    # Evaluated Recovery Pathways
    story.append(Paragraph("1. Evaluated Processing Pathways & Trade-Offs", styles["h1"]))
    
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
            Paragraph("82 - 88%", styles["table_cell"]),
            Paragraph("Highest value retention; requires briquetting & de-oiling stage.", styles["table_cell"]),
        ],
        [
            Paragraph("Secondary Specialized Alloy Smelter", styles["table_cell_bold"]),
            Paragraph("High Feasibility (Standard industry route)", styles["table_cell"]),
            Paragraph("74 - 82%", styles["table_cell"]),
            Paragraph("Recommended immediate option. Tolerates moderate trace impurities.", styles["table_cell"]),
        ],
        [
            Paragraph("Downgraded Cascaded Remelt / Slag", styles["table_cell_bold"]),
            Paragraph("High Feasibility (Current default)", styles["table_cell"]),
            Paragraph("55 - 65%", styles["table_cell"]),
            Paragraph("Sub-optimal economic value; results in permanent alloy degradation.", styles["table_cell"]),
        ],
    ]
    t_path = Table(pathways, colWidths=[2.2 * inch, 2.0 * inch, 1.1 * inch, 1.9 * inch])
    t_path.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), C_ALT_ROW),
        ("BOX", (0, 0), (-1, -1), 1, C_BORDER),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, C_BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(t_path)
    story.append(Spacer(1, 12))

    # Implementation Milestones
    story.append(Paragraph("2. Implementation Roadmap & Quality Gates", styles["h1"]))
    roadmap_items = [
        [
            Paragraph("<b>Phase</b>", styles["table_cell_bold"]),
            Paragraph("<b>Milestone Description</b>", styles["table_cell_bold"]),
            Paragraph("<b>Required Validation & Quality Gate</b>", styles["table_cell_bold"]),
        ],
        [
            Paragraph("Phase 1: Diagnostic Gate", styles["table_cell_bold"]),
            Paragraph("Complete multi-element ICP-MS or OES profile of 3 distinct shift batches.", styles["table_cell"]),
            Paragraph("Confirm Fe < 0.25%, Cu < 0.15%, and absence of toxic halide tramp flux.", styles["table_cell"]),
        ],
        [
            Paragraph("Phase 2: Segregation", styles["table_cell_bold"]),
            Paragraph("Implement dedicated chip capture bins at generating CNC / milling cells.", styles["table_cell"]),
            Paragraph("Prevent cross-contamination with ferrous swarf or incompatible coolants.", styles["table_cell"]),
        ],
        [
            Paragraph("Phase 3: Trial Melt", styles["table_cell_bold"]),
            Paragraph("Conduct pilot 500 kg induction furnace test melt with certified flux.", styles["table_cell"]),
            Paragraph("Measure ingot chemical homogeneity and confirm final tensile properties.", styles["table_cell"]),
        ],
        [
            Paragraph("Phase 4: Full Off-take", styles["table_cell_bold"]),
            Paragraph("Formalize off-take agreement with circular recycling partner.", styles["table_cell"]),
            Paragraph("Transition from fixed scrap pricing to index-linked metal recovery value.", styles["table_cell"]),
        ],
    ]
    t_road = Table(roadmap_items, colWidths=[1.8 * inch, 2.8 * inch, 2.6 * inch])
    t_road.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), C_ALT_ROW),
        ("BOX", (0, 0), (-1, -1), 1, C_BORDER),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, C_BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(t_road)
    story.append(Spacer(1, 10))

    # Scientific Caution & Boundaries
    story.append(Paragraph("3. Scientific Boundaries & Uncertainty Disclaimers", styles["h1"]))
    caution_text = (
        "<b>Notice of Scientific Boundaries:</b> Recovery yield projections and economic estimates are derived "
        "from published pyrometallurgical literature and thermodynamic models. Actual furnace recovery yields "
        "vary according to melt temperature, flux composition, oxide skin thickness, and moisture content. "
        "Always execute certified pilot trial melts prior to commercial off-take contracts."
    )
    t_caution = Table([[Paragraph(caution_text, styles["callout"])]], colWidths=[7.2 * inch])
    t_caution.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), C_WARN_BG),
        ("BOX", (0, 0), (-1, -1), 1, C_BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(t_caution)

    # Footer
    story.extend(_build_footer(styles))

    doc.build(story)
    return buffer.getvalue()

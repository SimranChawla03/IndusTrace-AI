# scripts/generate_report_architecture_photos.py
import os
import shutil
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch

# Industrial & Academic Color Palette
C_BG = "#F8FAF8"             # Crisp off-white sage background
C_HEADER_BG = "#0D2818"      # Very dark forest green
C_PRIMARY = "#1B4D36"        # Deep Forest Green
C_ACCENT = "#2D6A4F"         # Emerald Green
C_SAGE_LIGHT = "#E8F0E6"     # Light sage fill
C_SAGE_BORDER = "#B7CEB5"    # Sage card border
C_DARK = "#1A202C"           # Crisp text dark
C_MUTED = "#4A5568"          # Secondary label text
C_WHITE = "#FFFFFF"          # White
C_BORDER = "#CBD5E0"         # Neutral border
C_BLUE = "#1E4E8C"           # Network & Client Blue
C_BLUE_LIGHT = "#EBF4FF"     # Light blue
C_PURPLE = "#553C9A"         # Database Purple
C_PURPLE_LIGHT = "#F3EBFF"   # Light purple
C_GOLD = "#8C6B14"           # Gold / Math highlight
C_GOLD_LIGHT = "#FEFCBF"     # Light gold
C_AMBER = "#975A16"          # Warning / Trigger Amber
C_AMBER_LIGHT = "#FEEBC8"    # Light amber
C_RED = "#9B2C2C"            # Danger / Loss
C_RED_LIGHT = "#FFF5F5"      # Light red

def draw_badge(ax, x, y, text, bg_color=C_PRIMARY, text_color=C_WHITE, fontsize=8, pad_x=1.2, pad_y=0.7):
    ax.text(x, y, f"  {text}  ", fontsize=fontsize, fontweight='bold', color=text_color,
            ha='center', va='center', family='sans-serif',
            bbox=dict(boxstyle='round,pad=0.25', facecolor=bg_color, edgecolor='none'))

def draw_card(ax, x, y, w, h, bg_color=C_WHITE, border_color=C_BORDER, lw=1.2, radius=0.8):
    box = FancyBboxPatch((x, y), w, h,
                         boxstyle=f"round,pad=0,rounding_size={radius}",
                         facecolor=bg_color, edgecolor=border_color,
                         linewidth=lw, zorder=2)
    ax.add_patch(box)

def draw_arrow(ax, x1, y1, x2, y2, color=C_ACCENT, lw=1.8, label="", label_pos=0.5, label_offset=(0, 1.2), fontsize=7.5, style="->"):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle=style, color=color, lw=lw,
                                shrinkA=3, shrinkB=3, mutation_scale=14),
                zorder=5)
    if label:
        lx = x1 + (x2 - x1) * label_pos + label_offset[0]
        ly = y1 + (y2 - y1) * label_pos + label_offset[1]
        ax.text(lx, ly, label, fontsize=fontsize, fontweight='bold', color=color,
                ha='center', va='center', family='sans-serif', zorder=6,
                bbox=dict(boxstyle='round,pad=0.15', facecolor=C_WHITE, edgecolor=color, lw=0.6, alpha=0.95))

# ==============================================================================
# DIAGRAM 1: OVERALL FOUR-TIER SYSTEM ARCHITECTURE
# ==============================================================================
def generate_four_tier_architecture(output_path):
    fig = plt.figure(figsize=(16, 11), dpi=300)
    fig.patch.set_facecolor(C_BG)
    ax = fig.add_subplot(111)
    ax.set_facecolor(C_BG)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Main Header
    draw_card(ax, 2, 92, 96, 6.8, bg_color=C_HEADER_BG, border_color=C_GOLD, lw=1.5, radius=0.8)
    ax.text(50, 96.2, "IndusTrace AI — Overall Four-Tier System Architecture",
            fontsize=17, fontweight='bold', color=C_WHITE, ha='center', va='center', family='sans-serif')
    ax.text(50, 93.6, "B.Tech Final Project Framework | Ramdeobaba University Idea Lab | Uncertainty-Aware Industrial Waste Decision System",
            fontsize=9.5, color="#D1E7DD", ha='center', va='center', family='sans-serif')

    # TIER 1: Presentation & Client Tier
    # (x=2, y=70, w=96, h=20)
    draw_card(ax, 2, 69.5, 96, 20.5, bg_color="#F0F4F8", border_color="#BEE3F8", lw=1.5)
    draw_badge(ax, 14, 88.5, "TIER 1: PRESENTATION & CLIENT TIER", bg_color=C_BLUE, fontsize=9)
    ax.text(96, 88.5, "Single Page Application (SPA) | Vercel Global Edge Network (HTTPS / WSS)",
            fontsize=8.5, fontweight='bold', color=C_BLUE, ha='right', va='center')

    # 4 Sub-cards in Tier 1
    t1_cards = [
        {"x": 4, "w": 21.5, "title": "Core UI Framework", "sub": "React 18.3 & Vite 5.4",
         "items": ["• TypeScript strict type safety", "• Tailwind CSS (Sage palette)", "• Lucide React icons library", "• Responsive multi-device grid"]},
        {"x": 27.5, "w": 22.5, "title": "Interactive Operations", "sub": "Role-Based Client Views",
         "items": ["• Multi-Tenant Onboarding Wizard", "• Facility & Stream Registry", "• Lab Assay Ingestion Forms", "• Company Profile Management"]},
        {"x": 52, "w": 22.5, "title": "Visual Decision Support", "sub": "Recharts & Dynamic DOM",
         "items": ["• TWS Priority Bar & Radar charts", "• Circular Recovery yield curves", "• Batch uncertainty variance view", "• Live scenario comparison cards"]},
        {"x": 76.5, "w": 20, "title": "Export & Governance", "sub": "Audit Document Client",
         "items": ["• Executive Summary PDF stream", "• Technical Report PDF export", "• Platform Owner Audit console", "• Zenodo provenance explorer"]}
    ]
    for c in t1_cards:
        draw_card(ax, c["x"], 71, c["w"], 15.5, bg_color=C_WHITE, border_color="#CBD5E0", lw=1)
        ax.text(c["x"] + c["w"]/2, 84.8, c["title"], fontsize=9.5, fontweight='bold', color=C_DARK, ha='center', va='center')
        ax.text(c["x"] + c["w"]/2, 82.8, c["sub"], fontsize=7.5, fontweight='bold', color=C_BLUE, ha='center', va='center')
        for i, item in enumerate(c["items"]):
            ax.text(c["x"] + 1.2, 79.5 - i*2.2, item, fontsize=7.5, color=C_MUTED, ha='left', va='center')

    # Downward Connectors Tier 1 -> Tier 2
    draw_arrow(ax, 25, 69.5, 25, 65.5, color=C_BLUE, label="RESTful JSON / HTTPS", label_offset=(0, 0))
    draw_arrow(ax, 50, 69.5, 50, 65.5, color=C_PRIMARY, label="JWT Bearer Token (Auth: Bearer)", label_offset=(0, 0))
    draw_arrow(ax, 75, 69.5, 75, 65.5, color=C_AMBER, label="Vercel Reverse Proxy (/api/*)", label_offset=(0, 0))

    # TIER 2: Application Gateway & Security Tier
    # (x=2, y=47, w=96, h=18.5)
    draw_card(ax, 2, 47, 96, 18.5, bg_color="#F2F7F4", border_color=C_SAGE_BORDER, lw=1.5)
    draw_badge(ax, 17, 63.8, "TIER 2: APPLICATION & API GATEWAY TIER", bg_color=C_PRIMARY, fontsize=9)
    ax.text(96, 63.8, "FastAPI Async Engine | Uvicorn ASGI Server | Render Managed Cloud Container",
            fontsize=8.5, fontweight='bold', color=C_PRIMARY, ha='right', va='center')

    t2_cards = [
        {"x": 4, "w": 21.5, "title": "API Gateway & CORS", "sub": "HTTP Traffic Ingress",
         "items": ["• Starlette CORSMiddleware", "• Allowed Origins Regex match", "• Preflight OPTIONS handling", "• Rate limiting & error logging"]},
        {"x": 27.5, "w": 22.5, "title": "Multi-Tenant Security", "sub": "Cryptographic Isolation",
         "items": ["• JWT Token Auth (HS256, 72h)", "• Passlib BCrypt password hashing", "• Auto company_id session scoping", "• Role guards (Admin / Owner)"]},
        {"x": 52, "w": 22.5, "title": "Request Controllers", "sub": "Stateless REST API",
         "items": ["• /api/auth (Login, Register)", "• /api/waste-streams (CRUD)", "• /api/lab-results (Assays)", "• /api/recovery (Economics)"]},
        {"x": 76.5, "w": 20, "title": "Data Contract Validation", "sub": "Pydantic v2 Schemas",
         "items": ["• Strict input schema validation", "• Automatic metric normalization", "• Missingness flag detection", "• JSON serialization guard"]}
    ]
    for c in t2_cards:
        draw_card(ax, c["x"], 48.5, c["w"], 13.5, bg_color=C_WHITE, border_color="#CBD5E0", lw=1)
        ax.text(c["x"] + c["w"]/2, 60.5, c["title"], fontsize=9.5, fontweight='bold', color=C_DARK, ha='center', va='center')
        ax.text(c["x"] + c["w"]/2, 58.7, c["sub"], fontsize=7.5, fontweight='bold', color=C_PRIMARY, ha='center', va='center')
        for i, item in enumerate(c["items"]):
            ax.text(c["x"] + 1.2, 55.8 - i*2.1, item, fontsize=7.5, color=C_MUTED, ha='left', va='center')

    # Downward Connectors Tier 2 -> Tier 3
    draw_arrow(ax, 25, 47, 25, 43, color=C_PRIMARY, label="Validated Stream Payload", label_offset=(0, 0))
    draw_arrow(ax, 50, 47, 50, 43, color=C_GOLD, label="Invoke Mathematical Algorithms", label_offset=(0, 0))
    draw_arrow(ax, 75, 47, 75, 43, color=C_ACCENT, label="Evaluation Context & Bounds", label_offset=(0, 0))

    # TIER 3: Intelligence & Decision Support Tier
    # (x=2, y=24.5, w=96, h=18.5)
    draw_card(ax, 2, 24.5, 96, 18.5, bg_color="#FCF9F2", border_color="#ECC94B", lw=1.5)
    draw_badge(ax, 17, 41.3, "TIER 3: INTELLIGENCE & DECISION TIER", bg_color=C_GOLD, fontsize=9)
    ax.text(96, 41.3, "Mathematical Algorithms | Rule Pattern Matcher | Economic Mass-Balance Simulation",
            fontsize=8.5, fontweight='bold', color=C_GOLD, ha='right', va='center')

    t3_cards = [
        {"x": 4, "w": 21.5, "title": "TWS Scoring Engine", "sub": "Mathematical Model",
         "items": ["• TWS = Σ (w_i · F_i) [0–100]", "• Missingness (35%): 1-(Nm/Nr)", "• Hazard Severity weight (25%)", "• Volume (20%) & Recovery (20%)"]},
        {"x": 27.5, "w": 22.5, "title": "WIR Knowledge Engine", "sub": "Heuristic Rule Matcher",
         "items": ["• Waste Investigation Rules (WIR)", "• Keyword & process classification", "• Contamination risk triggers", "• Peer-reviewed research citations"]},
        {"x": 52, "w": 22.5, "title": "Circular Recovery Engine", "sub": "Metallurgical Simulation",
         "items": ["• Mass balance: M_rec=Min·η·(1-σ)", "• Net Benefit = Value - Process - Log", "• Mode A: Verified Lab Assays", "• Mode B: Hypothetical Scenarios"]},
        {"x": 76.5, "w": 20, "title": "Dynamic PDF Engine", "sub": "ReportLab 5.0 Generator",
         "items": ["• Server-side Canvas generation", "• Flowable tables & headers", "• Executive Summary (3 pages)", "• Technical Report (4 pages)"]}
    ]
    for c in t3_cards:
        draw_card(ax, c["x"], 26, c["w"], 13.5, bg_color=C_WHITE, border_color="#CBD5E0", lw=1)
        ax.text(c["x"] + c["w"]/2, 38, c["title"], fontsize=9.5, fontweight='bold', color=C_DARK, ha='center', va='center')
        ax.text(c["x"] + c["w"]/2, 36.2, c["sub"], fontsize=7.5, fontweight='bold', color=C_GOLD, ha='center', va='center')
        for i, item in enumerate(c["items"]):
            ax.text(c["x"] + 1.2, 33.3 - i*2.1, item, fontsize=7.5, color=C_MUTED, ha='left', va='center')

    # Downward Connectors Tier 3 -> Tier 4
    draw_arrow(ax, 25, 24.5, 25, 20.5, color=C_PURPLE, label="SQLAlchemy 2.0 ORM Queries", label_offset=(0, 0))
    draw_arrow(ax, 50, 24.5, 50, 20.5, color=C_PRIMARY, label="Atomic Read/Write Sessions", label_offset=(0, 0))
    draw_arrow(ax, 75, 24.5, 75, 20.5, color=C_PURPLE, label="Curated Benchmark Datasets", label_offset=(0, 0))

    # TIER 4: Data & Persistence Tier
    # (x=2, y=2, w=96, h=18.5)
    draw_card(ax, 2, 2, 96, 18.5, bg_color="#F8F4FD", border_color="#D6BCFA", lw=1.5)
    draw_badge(ax, 15, 18.8, "TIER 4: DATA & PERSISTENCE TIER", bg_color=C_PURPLE, fontsize=9)
    ax.text(96, 18.8, "Managed Cloud Relational Store | Dual Engine (PostgreSQL 16 & SQLite 3) | Persistent Ledger",
            fontsize=8.5, fontweight='bold', color=C_PURPLE, ha='right', va='center')

    t4_cards = [
        {"x": 4, "w": 21.5, "title": "Database Engine", "sub": "ACID Relational Storage",
         "items": ["• PostgreSQL 16 (Render Managed)", "• Psycopg2 binary driver pooling", "• SQLite 3 local dev fallback", "• Serial sequence synchronization"]},
        {"x": 27.5, "w": 22.5, "title": "Relational Multi-Tenant", "sub": "7 Normalized Schemas",
         "items": ["• companies & users (Auth/Roles)", "• facilities & waste_streams", "• lab_results (Measured assays)", "• test_assessments & scenarios"]},
        {"x": 52, "w": 22.5, "title": "Empirical Benchmark Data", "sub": "Curated Open Datasets",
         "items": ["• Plant C: 9,400+ scrap logistics records", "• CAESAR: Inductively coupled plasma assays", "• Secondary metallurgy pricing curves", "• Zenodo provenance registration"]},
        {"x": 76.5, "w": 20, "title": "WIR Rules Repository", "sub": "Embedded Knowledge Base",
         "items": ["• Pre-loaded WIR rules dictionary", "• Critical threshold matrix (ppm/%)", "• Hazardous substance standards", "• Scientific literature citations"]}
    ]
    for c in t4_cards:
        draw_card(ax, c["x"], 3.5, c["w"], 13.5, bg_color=C_WHITE, border_color="#CBD5E0", lw=1)
        ax.text(c["x"] + c["w"]/2, 15.5, c["title"], fontsize=9.5, fontweight='bold', color=C_DARK, ha='center', va='center')
        ax.text(c["x"] + c["w"]/2, 13.7, c["sub"], fontsize=7.5, fontweight='bold', color=C_PURPLE, ha='center', va='center')
        for i, item in enumerate(c["items"]):
            ax.text(c["x"] + 1.2, 10.8 - i*2.1, item, fontsize=7.5, color=C_MUTED, ha='left', va='center')

    # Footer note
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, facecolor=C_BG, bbox_inches='tight')
    plt.close()
    print(f"Generated: {output_path}")

# ==============================================================================
# DIAGRAM 2: FINAL IMPLEMENTATION ARCHITECTURE AND DATA FLOW
# ==============================================================================
def generate_implementation_data_flow(output_path):
    fig = plt.figure(figsize=(16, 11), dpi=300)
    fig.patch.set_facecolor(C_BG)
    ax = fig.add_subplot(111)
    ax.set_facecolor(C_BG)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Main Header
    draw_card(ax, 2, 92, 96, 6.8, bg_color=C_HEADER_BG, border_color=C_GOLD, lw=1.5, radius=0.8)
    ax.text(50, 96.2, "IndusTrace AI — Implementation Architecture & End-to-End Data Flow",
            fontsize=17, fontweight='bold', color=C_WHITE, ha='center', va='center', family='sans-serif')
    ax.text(50, 93.6, "Live Production Pipeline: User Action → Ingress & Proxy → FastAPI Services → Decision Models → Database → PDF/UI Output",
            fontsize=9.5, color="#D1E7DD", ha='center', va='center', family='sans-serif')

    # 5 Sequential Horizontal Pipeline Columns
    # Col 1: Client Layer (x=2, w=17.5)
    # Col 2: Ingress & Network Gateway (x=21.5, w=17)
    # Col 3: FastAPI Backend Services (x=40.5, w=19)
    # Col 4: Intelligence & Decision Models (x=61.5, w=18.5)
    # Col 5: Database & Persistence Layer (x=82, w=16)

    cols = [
        {"x": 2, "w": 17.5, "badge": "1. CLIENT INTERACTIONS", "color": C_BLUE, "bg": "#F0F4F8",
         "sub": "Browser / Vercel Edge",
         "cards": [
             ("User Authentication", "Login: email & password\nRegister new company\nLocal storage token cache"),
             ("Stream Registration", "Waste stream name\nProcess category\nMonthly volume (tonnes)\nCurrent disposal cost ($)"),
             ("Assay Measurement", "Chemical parameters:\nFe%, Zn%, Cu%, Pb%\nMoisture & Contaminant"),
             ("Decision Requests", "POST /api/assessment/:id\nPOST /api/recovery/:id\nGET /reports/pdf/:id")
         ]},
        {"x": 21, "w": 17.5, "badge": "2. INGRESS & PROXY LAYER", "color": C_AMBER, "bg": "#FCF9F2",
         "sub": "Vercel & Cloudflare Edge",
         "cards": [
             ("Vercel Edge Proxy", "Rewrite Rule:\n/api/:path* → Render\nAvoids cross-origin issues\nSame-origin browser fetch"),
             ("CORS & Preflight", "FastAPI CORSMiddleware\nallow_origin_regex\nOPTIONS preflight check\n200 OK Access-Control"),
             ("Transport Security", "HTTPS / TLS 1.3 protocol\nStrict-Transport-Security\nPayload encryption in transit"),
             ("JWT Authentication", "Authorization: Bearer <tok>\nDecode HS256 payload\nExtract user_id & company_id")
         ]},
        {"x": 40.5, "w": 19, "badge": "3. FASTAPI CONTROLLERS", "color": C_PRIMARY, "bg": "#F2F7F4",
         "sub": "Uvicorn ASGI Container",
         "cards": [
             ("Tenant Middleware", "Injects active company_id\nGuarantees tenant isolation\nZero cross-company leaks"),
             ("Route Handlers", "AuthRouter (JWT issue)\nStreamRouter (CRUD)\nAssessmentRouter (TWS)\nReportRouter (PDF Canvas)"),
             ("Pydantic Validation", "StreamCreateSchema\nLabResultInputSchema\nAutomatic unit normalization\nStrict JSON error handling"),
             ("Session Management", "SQLAlchemy get_db()\nContext-managed session\nAtomic commit / rollback")
         ]},
        {"x": 61.5, "w": 18.5, "badge": "4. DECISION ALGORITHMS", "color": C_GOLD, "bg": "#FEFCBF",
         "sub": "Python Analytical Core",
         "cards": [
             ("TWS Scoring Engine", "TWS = Σ(w_i · F_i) [0–100]\nw1=0.35 Missingness (Um)\nw2=0.25 Hazard severity (H)\nw3=0.20 Volume, w4=0.20 Rec"),
             ("WIR Rule Engine", "Pattern match category\nCondition evaluation\nTriggers lab test need\nAttaches research citations"),
             ("Circular Recovery", "Mass Balance calculation:\nM_rec = M_in · η · (1-σ)\nNet Margin = Value - Cost\nVerified vs Hypothetical"),
             ("ReportLab PDF Builder", "Canvas flowable builder\nExecutive Summary PDF\nTechnical Investigation PDF\nBinary stream download")
         ]},
        {"x": 82, "w": 16, "badge": "5. PERSISTENCE LAYER", "color": C_PURPLE, "bg": "#F8F4FD",
         "sub": "PostgreSQL 16 Cloud",
         "cards": [
             ("Database Engine", "Managed PostgreSQL 16\npsycopg2-binary pooling\nSerial sequence syncing\nSQLite 3 local fallback"),
             ("Relational Tables", "companies, users\nfacilities, waste_streams\nlab_results, wir_rules\ntest_assessments, scenarios"),
             ("Empirical Datasets", "Plant C Scrap Logistics\n9,400+ historical records\nCAESAR metallurgy assays\nZenodo research records"),
             ("Data Integrity", "Foreign key constraints\nCascading deletes\nTenant-scoped queries\nAudit timestamps")
         ]}
    ]

    # Draw Columns
    for col in cols:
        draw_card(ax, col["x"], 4, col["w"], 86, bg_color=col["bg"], border_color=C_BORDER, lw=1.2)
        draw_badge(ax, col["x"] + col["w"]/2, 87.8, col["badge"], bg_color=col["color"], fontsize=8)
        ax.text(col["x"] + col["w"]/2, 85.5, col["sub"], fontsize=7.5, fontweight='bold', color=C_MUTED, ha='center', va='center')

        # Draw Cards inside column
        y_positions = [67, 47, 27, 7]
        for i, (ctitle, cdesc) in enumerate(col["cards"]):
            cy = y_positions[i]
            draw_card(ax, col["x"] + 0.8, cy, col["w"] - 1.6, 17.5, bg_color=C_WHITE, border_color="#CBD5E0", lw=1)
            ax.text(col["x"] + col["w"]/2, cy + 15.2, ctitle, fontsize=8.5, fontweight='bold', color=C_DARK, ha='center', va='center')
            lines = cdesc.split('\n')
            for j, line in enumerate(lines):
                ax.text(col["x"] + 1.8, cy + 12 - j*2.8, line, fontsize=7.2, color=C_MUTED, ha='left', va='center')

    # Draw Data Flow Connecting Arrows Between Stages
    # Step 1 -> Step 2
    draw_arrow(ax, 19.5, 75.5, 21, 75.5, color=C_BLUE, label="HTTPS Req", label_offset=(0, 1.8), fontsize=6.8)
    draw_arrow(ax, 19.5, 55.5, 21, 55.5, color=C_BLUE, label="FormData", label_offset=(0, 1.8), fontsize=6.8)
    draw_arrow(ax, 19.5, 35.5, 21, 35.5, color=C_BLUE, label="Assay JSON", label_offset=(0, 1.8), fontsize=6.8)
    draw_arrow(ax, 19.5, 15.5, 21, 15.5, color=C_BLUE, label="Eval Triggers", label_offset=(0, 1.8), fontsize=6.8)

    # Step 2 -> Step 3
    draw_arrow(ax, 38.5, 75.5, 40.5, 75.5, color=C_AMBER, label="Proxied /api/*", label_offset=(0, 1.8), fontsize=6.8)
    draw_arrow(ax, 38.5, 55.5, 40.5, 55.5, color=C_AMBER, label="CORS OK", label_offset=(0, 1.8), fontsize=6.8)
    draw_arrow(ax, 38.5, 35.5, 40.5, 35.5, color=C_AMBER, label="JWT Validated", label_offset=(0, 1.8), fontsize=6.8)
    draw_arrow(ax, 38.5, 15.5, 40.5, 15.5, color=C_AMBER, label="Scoped Session", label_offset=(0, 1.8), fontsize=6.8)

    # Step 3 -> Step 4
    draw_arrow(ax, 59.5, 75.5, 61.5, 75.5, color=C_PRIMARY, label="Compute TWS", label_offset=(0, 1.8), fontsize=6.8)
    draw_arrow(ax, 59.5, 55.5, 61.5, 55.5, color=C_PRIMARY, label="Match WIR", label_offset=(0, 1.8), fontsize=6.8)
    draw_arrow(ax, 59.5, 35.5, 61.5, 35.5, color=C_PRIMARY, label="Simulate Yield", label_offset=(0, 1.8), fontsize=6.8)
    draw_arrow(ax, 59.5, 15.5, 61.5, 15.5, color=C_PRIMARY, label="Build Report", label_offset=(0, 1.8), fontsize=6.8)

    # Step 4 -> Step 5
    draw_arrow(ax, 80, 75.5, 82, 75.5, color=C_GOLD, label="Read Assays", label_offset=(0, 1.8), fontsize=6.8)
    draw_arrow(ax, 80, 55.5, 82, 55.5, color=C_GOLD, label="Query WIR", label_offset=(0, 1.8), fontsize=6.8)
    draw_arrow(ax, 80, 35.5, 82, 35.5, color=C_GOLD, label="Save Assessment", label_offset=(0, 1.8), fontsize=6.8)
    draw_arrow(ax, 80, 15.5, 82, 15.5, color=C_GOLD, label="Commit Scenario", label_offset=(0, 1.8), fontsize=6.8)

    # Return Flow Arrow (Bottom feedback bar from DB/Engine back to UI)
    draw_card(ax, 4, 1, 92, 2.5, bg_color=C_WHITE, border_color=C_PRIMARY, lw=1.2, radius=0.4)
    ax.annotate("", xy=(4, 2.25), xytext=(96, 2.25),
                arrowprops=dict(arrowstyle="->", color=C_PRIMARY, lw=2, mutation_scale=15),
                zorder=7)
    ax.text(50, 2.25, "◀ ◀ ◀ RETURN DATA FLOW: Evaluated TWS Scores, Yield Forecasts, Recharts JSON State & Audit PDF Binary Streams ◀ ◀ ◀",
            fontsize=7.8, fontweight='bold', color=C_PRIMARY, ha='center', va='center', family='sans-serif', zorder=8,
            bbox=dict(boxstyle='round,pad=0.2', facecolor=C_WHITE, edgecolor=C_PRIMARY, lw=0.8))

    plt.tight_layout()
    plt.savefig(output_path, dpi=300, facecolor=C_BG, bbox_inches='tight')
    plt.close()
    print(f"Generated: {output_path}")

if __name__ == "__main__":
    out_dir = "C:/Users/VICTUS/Desktop/IndusTrace-AI"
    downloads_dir = "C:/Users/VICTUS/Downloads"
    artifacts_dir = "C:/Users/VICTUS/.gemini/antigravity/brain/2cabe382-1a3f-417b-8023-4ef1eb110e8d"

    # Photo 1: Overall Four-Tier System Architecture
    f1_name = "IndusTrace_Four_Tier_System_Architecture.png"
    p1_local = os.path.join(out_dir, f1_name)
    generate_four_tier_architecture(p1_local)
    shutil.copy(p1_local, os.path.join(downloads_dir, f1_name))
    shutil.copy(p1_local, os.path.join(artifacts_dir, f1_name))

    # Photo 2: Implementation Architecture & Data Flow
    f2_name = "IndusTrace_Implementation_Architecture_and_Data_Flow.png"
    p2_local = os.path.join(out_dir, f2_name)
    generate_implementation_data_flow(p2_local)
    shutil.copy(p2_local, os.path.join(downloads_dir, f2_name))
    shutil.copy(p2_local, os.path.join(artifacts_dir, f2_name))

    print("\nSUCCESS: Both high-resolution photos generated and copied to Workspace, Downloads, and Artifacts!")

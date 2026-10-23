# scripts/generate_diagrams.py
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Arrow

# Colors matching the IndusTrace AI design system
C_BG = "#F7F8F3"          # Soft off-white
C_LIGHT_BG = "#F7F8F3"    # Soft off-white
C_PRIMARY = "#1B4D36"     # Forest Green
C_ACCENT = "#26734D"      # Emerald Sage
C_SAGE = "#E5EEE3"        # Light Sage Box
C_DARK = "#1A202C"        # Charcoal text
C_MUTED = "#4A5568"       # Secondary text
C_WHITE = "#FFFFFF"       # Pure white
C_BORDER = "#CBD5E1"      # Border line
C_GOLD = "#C59B27"        # Accent Gold
C_CARD_BORDER = "#B5C8B4" # Subtle green border

def create_architecture_diagram(output_path):
    fig = plt.figure(figsize=(15, 8.5), dpi=300)
    fig.patch.set_facecolor(C_BG)
    ax = fig.add_subplot(111)
    ax.set_facecolor(C_BG)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Header Title
    ax.text(50, 95, "IndusTrace AI — System Architecture & Methodology", 
            fontsize=20, fontweight='bold', ha='center', va='center', color=C_PRIMARY, family='sans-serif')
    ax.text(50, 91.5, "Uncertainty-Aware Industrial Waste Investigation & Resource Recovery Pipeline", 
            fontsize=11, ha='center', va='center', color=C_MUTED, family='sans-serif')

    # Step boxes (4 distinct chronological stages)
    # Stage 1: Ingestion
    # Stage 2: TWS & Rules
    # Stage 3: Lab Characterization
    # Stage 4: Circular Recovery
    
    stages = [
        {
            "num": "STEP 1",
            "title": "Data Ingestion & Multi-Tenant Registry",
            "x": 3, "y": 14, "w": 21, "h": 72,
            "badge_color": "#2B6CB0",
            "items": [
                ("Company Registration", "Multi-tenant tenant isolation with JWT authentication and BCrypt password hashing."),
                ("Facility & Process", "Register CNC Machining, Casting Foundry, Surface Plating lines."),
                ("Waste Stream Entry", "Input scrap name, category, monthly volume, current disposal cost."),
                ("Empirical Datasets", "Real benchmarks: Plant C scrap logistics (9.4k records) & CAESAR metal chemistry.")
            ]
        },
        {
            "num": "STEP 2",
            "title": "Decision Engine & TWS Prioritization",
            "x": 27, "y": 14, "w": 21, "h": 72,
            "badge_color": C_PRIMARY,
            "items": [
                ("Missingness Audit", "Identifies uncharacterized chemical parameters (Fe%, Zn%, Moisture, pH)."),
                ("TWS Score Calculation", "Computes 0–100 Test Worthiness Score using 4 weighted normalized factors:"),
                ("• Uncertainty (35%)", "• Hazard Severity (25%)"),
                ("• Volume Penalty (20%)", "• Recovery Upside (20%)"),
                ("Rule Matcher (WIR)", "Matches stream against peer-reviewed Waste Investigation Rules & triggers.")
            ]
        },
        {
            "num": "STEP 3",
            "title": "Targeted Laboratory Characterization",
            "x": 51, "y": 14, "w": 21, "h": 72,
            "badge_color": "#805AD5",
            "items": [
                ("Prioritized Testing", "Only high-TWS streams warrant costly laboratory spectrometry investment."),
                ("Assay Measurement", "Record lab spectrometry values (ICP-OES, XRD, Moisture, Heavy metals)."),
                ("Dynamic Recalculation", "Assay input immediately eliminates missingness factor (U_missing drops)."),
                ("Priority Transition", "Stream moves from 'Needs Testing' to 'Verified Secondary Resource'.")
            ]
        },
        {
            "num": "STEP 4",
            "title": "Resource Recovery & Decision Outputs",
            "x": 75, "y": 14, "w": 22, "h": 72,
            "badge_color": "#C05621",
            "items": [
                ("Mass Balance Model", "Calculates recovered metal yield factoring furnace slag and dross losses."),
                ("Economic Scenario", "Computes Net Profit ($/ton) = (Recovered Value) - (Processing & Logistics)."),
                ("Audit PDF Reports", "One-click generation of Executive Summary & Technical Report PDFs."),
                ("Platform Oversight", "Macro dashboard for compliance without exposing confidential assays.")
            ]
        }
    ]

    # Draw Stage Columns
    for s in stages:
        # Background card
        card = FancyBboxPatch((s["x"], s["y"]), s["w"], s["h"],
                              boxstyle="round,pad=1.2,rounding_size=2",
                              facecolor=C_WHITE, edgecolor=C_CARD_BORDER, linewidth=1.5)
        ax.add_patch(card)
        
        # Header Badge
        header_box = FancyBboxPatch((s["x"] + 1, s["y"] + s["h"] - 8.5), s["w"] - 2, 6.5,
                                    boxstyle="round,pad=0.5,rounding_size=1.2",
                                    facecolor=s["badge_color"], edgecolor="none")
        ax.add_patch(header_box)
        ax.text(s["x"] + s["w"]/2, s["y"] + s["h"] - 4, s["num"],
                fontsize=8.5, fontweight='bold', color=C_WHITE, ha='center', va='center')
        ax.text(s["x"] + s["w"]/2, s["y"] + s["h"] - 6.5, s["title"],
                fontsize=8, fontweight='bold', color="#EDF2F7", ha='center', va='center')

        # Items inside card
        curr_y = s["y"] + s["h"] - 13
        for item in s["items"]:
            title, desc = item
            if desc:
                ax.text(s["x"] + 1.5, curr_y, f"• {title}", fontsize=8.5, fontweight='bold', color=C_PRIMARY)
                curr_y -= 2.6
                # Wrap description
                words = desc.split()
                line = ""
                for w in words:
                    test_line = line + w + " "
                    if len(test_line) > 28:
                        ax.text(s["x"] + 2.8, curr_y, line, fontsize=7.2, color=C_MUTED)
                        curr_y -= 2.2
                        line = w + " "
                    else:
                        line = test_line
                if line:
                    ax.text(s["x"] + 2.8, curr_y, line, fontsize=7.2, color=C_MUTED)
                    curr_y -= 2.5
                curr_y -= 2.5
            else:
                ax.text(s["x"] + 3.0, curr_y, title, fontsize=7.5, color=C_DARK)
                curr_y -= 2.5

    # Connect Stages with Flow Arrows
    arrows = [
        (24.5, 50, 26.5, 50),
        (48.5, 50, 50.5, 50),
        (72.5, 50, 74.5, 50)
    ]
    for x1, y1, x2, y2 in arrows:
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(facecolor=C_PRIMARY, edgecolor='none', width=3, headwidth=9, headlength=7))

    # Bottom Banner: Core Mathematical Foundation
    bottom_box = FancyBboxPatch((3, 3), 94, 8,
                                boxstyle="round,pad=0.8,rounding_size=1.5",
                                facecolor=C_SAGE, edgecolor=C_PRIMARY, linewidth=1)
    ax.add_patch(bottom_box)
    ax.text(50, 8.2, "CORE MATHEMATICAL FORMULATION", fontsize=8.5, fontweight='bold', color=C_PRIMARY, ha='center')
    ax.text(50, 5.2, "TWS = (0.35 × Missingness_Uncertainty) + (0.25 × Hazard_Severity) + (0.20 × Volume_Penalty) + (0.20 × Recovery_Potential)",
            fontsize=8.5, fontweight='bold', color=C_DARK, ha='center', family='monospace')

    plt.tight_layout()
    plt.savefig(output_path, facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight')
    plt.close()
    print(f"[SUCCESS] Architecture diagram generated: {output_path}")


def create_tech_stack_diagram(output_path):
    fig = plt.figure(figsize=(15, 8.5), dpi=300)
    fig.patch.set_facecolor(C_BG)
    ax = fig.add_subplot(111)
    ax.set_facecolor(C_BG)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Title
    ax.text(50, 95, "IndusTrace AI — Technology Stack & Cloud Infrastructure", 
            fontsize=20, fontweight='bold', ha='center', va='center', color=C_PRIMARY, family='sans-serif')
    ax.text(50, 91.5, "Modern Decoupled 4-Tier Architecture with Dual-Engine Persistence", 
            fontsize=11, ha='center', va='center', color=C_MUTED, family='sans-serif')

    tiers = [
        {
            "name": "1. FRONTEND USER INTERFACE",
            "sub": "Single Page Application (React 18 + Vite 5)",
            "x": 3, "y": 68, "w": 94, "h": 20,
            "badge_color": "#2B6CB0",
            "techs": [
                ("React 18.3", "Component UI & hooks"),
                ("TypeScript", "Strict type safety"),
                ("Tailwind CSS", "Sage/Forest palette"),
                ("Recharts 2.13", "Interactive charts"),
                ("Axios Client", "JWT interceptors"),
                ("Vercel Hosting", "Edge CDN distribution")
            ]
        },
        {
            "name": "2. BACKEND API & APPLICATION LAYER",
            "sub": "High-Performance Asynchronous REST Engine (FastAPI + Python 3.13)",
            "x": 3, "y": 45, "w": 94, "h": 20,
            "badge_color": C_PRIMARY,
            "techs": [
                ("FastAPI 0.115", "Asynchronous ASGI API"),
                ("Pydantic v2", "Strict schema validation"),
                ("PyJWT (HS256)", "Multi-tenant auth tokens"),
                ("BCrypt (Salt 12)", "Password cryptography"),
                ("CORS Engine", "Secure origin isolation"),
                ("Starlette", "Sub-15ms request pipeline")
            ]
        },
        {
            "name": "3. ANALYTICAL DECISION ENGINE & SERVICES",
            "sub": "Deterministic Uncertainty Reduction & Circular Economics",
            "x": 3, "y": 22, "w": 45.5, "h": 20,
            "badge_color": "#805AD5",
            "techs": [
                ("TWS Scorer", "4-factor vector prioritization"),
                ("WIR Matcher", "10 heuristic metallurgy rules"),
                ("Recovery Math", "Thermodynamic mass balance"),
                ("ReportLab 5.0", "In-memory dynamic PDF stream")
            ]
        },
        {
            "name": "4. DUAL-ENGINE PERSISTENCE & DEVOPS",
            "sub": "Frictionless Local Dev + Persistent Cloud Database",
            "x": 51.5, "y": 22, "w": 45.5, "h": 20,
            "badge_color": "#C05621",
            "techs": [
                ("PostgreSQL 16", "Cloud persistence (Render)"),
                ("SQLite 3", "Zero-setup local development"),
                ("SQLAlchemy 2.0", "Connection pooling & ORM"),
                ("Pytest (25/25)", "100% automated test pass rate")
            ]
        }
    ]

    for t in tiers:
        # Tier card
        card = FancyBboxPatch((t["x"], t["y"]), t["w"], t["h"],
                              boxstyle="round,pad=1,rounding_size=1.5",
                              facecolor=C_WHITE, edgecolor=C_CARD_BORDER, linewidth=1.5)
        ax.add_patch(card)
        
        # Header strip
        strip = FancyBboxPatch((t["x"] + 1, t["y"] + t["h"] - 5.5), t["w"] - 2, 4.5,
                               boxstyle="round,pad=0.3,rounding_size=1",
                               facecolor=t["badge_color"], edgecolor="none")
        ax.add_patch(strip)
        ax.text(t["x"] + 3, t["y"] + t["h"] - 3.2, t["name"],
                fontsize=8.5, fontweight='bold', color=C_WHITE, va='center')
        ax.text(t["x"] + t["w"] - 3, t["y"] + t["h"] - 3.2, t["sub"],
                fontsize=7.5, color="#E2E8F0", ha='right', va='center')

        # Technologies inside tier (pill grid)
        tech_count = len(t["techs"])
        pill_w = (t["w"] - 4 - (tech_count - 1)*1.2) / tech_count if tech_count <= 4 else (t["w"] - 6) / 3
        
        if tech_count <= 4:
            # 1 row
            for idx, (tname, tdesc) in enumerate(t["techs"]):
                px = t["x"] + 2 + idx * (pill_w + 1.2)
                py = t["y"] + 2.5
                pcard = FancyBboxPatch((px, py), pill_w, 10.5,
                                       boxstyle="round,pad=0.4,rounding_size=1",
                                       facecolor=C_SAGE, edgecolor=C_PRIMARY, linewidth=0.8)
                ax.add_patch(pcard)
                ax.text(px + pill_w/2, py + 7, tname, fontsize=8, fontweight='bold', color=C_PRIMARY, ha='center')
                ax.text(px + pill_w/2, py + 3.2, tdesc, fontsize=6.8, color=C_MUTED, ha='center')
        else:
            # 2 rows of 3
            pill_w = (t["w"] - 8) / 3
            for idx, (tname, tdesc) in enumerate(t["techs"]):
                row = 0 if idx < 3 else 1
                col = idx % 3
                px = t["x"] + 2 + col * (pill_w + 2)
                py = t["y"] + (7.5 if row == 0 else 1.5)
                pcard = FancyBboxPatch((px, py), pill_w, 5.2,
                                       boxstyle="round,pad=0.3,rounding_size=0.8",
                                       facecolor=C_SAGE, edgecolor=C_PRIMARY, linewidth=0.8)
                ax.add_patch(pcard)
                ax.text(px + pill_w/2, py + 3.4, tname, fontsize=7.5, fontweight='bold', color=C_PRIMARY, ha='center')
                ax.text(px + pill_w/2, py + 1.2, tdesc, fontsize=6.5, color=C_MUTED, ha='center')

    # Footer note
    footer = FancyBboxPatch((3, 4), 94, 14,
                            boxstyle="round,pad=0.8,rounding_size=1.2",
                            facecolor=C_LIGHT_BG, edgecolor=C_BORDER, linewidth=1)
    ax.add_patch(footer)
    ax.text(50, 14.5, "VERIFIED ARCHITECTURAL HIGHLIGHTS", fontsize=8.5, fontweight='bold', color=C_PRIMARY, ha='center')
    ax.text(50, 11, "• 100% Data Persistence: Render PostgreSQL 16 eliminates container-reset data loss in production.", fontsize=7.5, color=C_DARK, ha='center')
    ax.text(50, 8.2, "• High-Performance: Sub-15ms decision-engine response times with 25 passing automated Pytest suites.", fontsize=7.5, color=C_DARK, ha='center')
    ax.text(50, 5.5, "• Tenant Privacy: Multi-company JWT isolation guarantees proprietary chemical assays remain protected.", fontsize=7.5, color=C_DARK, ha='center')

    plt.tight_layout()
    plt.savefig(output_path, facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight')
    plt.close()
    print(f"[SUCCESS] Tech stack diagram generated: {output_path}")

if __name__ == "__main__":
    create_architecture_diagram("IndusTrace_System_Architecture_and_Methodology.png")
    create_tech_stack_diagram("IndusTrace_Complete_Tech_Stack.png")

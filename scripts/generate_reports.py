# scripts/generate_reports.py
"""
Script to generate:
1. IndusTrace_AI_College_Project_Report.pdf (Strictly formatted to Ramdeobaba University Idea Lab B.Tech Project Report standard)
2. IndusTrace_AI_Team_Technical_Explanation_and_Defense_Guide.pdf (Deep-dive technical architecture, data flows, math models, and viva defense guide)
"""

import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch, cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

# Palettes
C_NAVY = colors.HexColor("#0B2545")
C_PRIMARY = colors.HexColor("#1B4D36")    # Forest Green
C_ACCENT = colors.HexColor("#26734D")     # Sage Accent
C_DARK = colors.HexColor("#1A202C")
C_MUTED = colors.HexColor("#4A5568")
C_LIGHT_BG = colors.HexColor("#F7F8F3")   # Off-white / Sage tint
C_ALT_ROW = colors.HexColor("#EDF3EB")
C_BORDER = colors.HexColor("#CBD5E1")
C_WHITE = colors.HexColor("#FFFFFF")
C_GOLD = colors.HexColor("#C59B27")

class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to dynamically compute and print accurate 'Page X of Y' numbers"""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, total_pages):
        # Don't draw headers/footers on page 1 (Title page)
        if self._pageNumber == 1:
            return
            
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(C_MUTED)
        
        # Header (Top)
        self.drawString(54, 800, "Ramdeobaba University, Nagpur — School of Computer Science & Engineering")
        self.drawRightString(A4[0] - 54, 800, "IndusTrace AI Project Report")
        self.setStrokeColor(C_BORDER)
        self.setLineWidth(0.5)
        self.line(54, 792, A4[0] - 54, 792)
        
        # Footer (Bottom)
        self.line(54, 45, A4[0] - 54, 45)
        self.drawString(54, 32, "Idea Lab (2026–27) | Confidential & Academic Assessment")
        page_str = f"Page {self._pageNumber} of {total_pages}"
        self.drawRightString(A4[0] - 54, 32, page_str)
        self.restoreState()


class TeamGuideCanvas(canvas.Canvas):
    """Two-pass canvas for Team Guide"""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, total_pages):
        if self._pageNumber == 1:
            return
            
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(C_PRIMARY)
        self.drawString(54, 800, "IndusTrace AI — Internal Architecture, Data Flow & Viva Defense Guide")
        self.setFont("Helvetica", 8)
        self.setFillColor(C_MUTED)
        self.drawRightString(A4[0] - 54, 800, "Team Internal Manual")
        self.setStrokeColor(C_PRIMARY)
        self.setLineWidth(0.75)
        self.line(54, 792, A4[0] - 54, 792)
        
        # Footer (Bottom)
        self.line(54, 45, A4[0] - 54, 45)
        self.drawString(54, 32, "IndusTrace AI Engineering Core | Comprehensive Project Anatomy")
        page_str = f"Page {self._pageNumber} of {total_pages}"
        self.drawRightString(A4[0] - 54, 32, page_str)
        self.restoreState()


def get_styles():
    base = getSampleStyleSheet()
    styles = {}
    
    styles['Normal'] = ParagraphStyle(
        'Normal',
        parent=base['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=C_DARK,
        alignment=4 # Justified
    )
    
    styles['CoverUni'] = ParagraphStyle(
        'CoverUni',
        parent=base['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=C_NAVY,
        alignment=1, # Center
        spaceAfter=4
    )
    
    styles['CoverDept'] = ParagraphStyle(
        'CoverDept',
        parent=base['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=C_MUTED,
        alignment=1,
        spaceAfter=15
    )
    
    styles['CoverReportType'] = ParagraphStyle(
        'CoverReportType',
        parent=base['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=C_PRIMARY,
        alignment=1,
        spaceAfter=6
    )
    
    styles['CoverSub'] = ParagraphStyle(
        'CoverSub',
        parent=base['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=C_DARK,
        alignment=1,
        spaceAfter=15
    )
    
    styles['CoverTitle'] = ParagraphStyle(
        'CoverTitle',
        parent=base['Normal'],
        fontName='Helvetica-Bold',
        fontSize=17,
        leading=22,
        textColor=C_NAVY,
        alignment=1,
        spaceBefore=12,
        spaceAfter=18
    )
    
    styles['CoverMeta'] = ParagraphStyle(
        'CoverMeta',
        parent=base['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=C_DARK,
        alignment=1
    )
    
    styles['CoverMetaBold'] = ParagraphStyle(
        'CoverMetaBold',
        parent=base['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=C_NAVY,
        alignment=1
    )
    
    styles['ChapterTitle'] = ParagraphStyle(
        'ChapterTitle',
        parent=base['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=C_NAVY,
        spaceBefore=15,
        spaceAfter=12,
        keepWithNext=True
    )
    
    styles['SectionTitle'] = ParagraphStyle(
        'SectionTitle',
        parent=base['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=15,
        textColor=C_PRIMARY,
        spaceBefore=10,
        spaceAfter=6,
        keepWithNext=True
    )

    styles['SubSectionTitle'] = ParagraphStyle(
        'SubSectionTitle',
        parent=base['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=C_DARK,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )
    
    styles['Formula'] = ParagraphStyle(
        'Formula',
        parent=base['Normal'],
        fontName='Courier-Bold',
        fontSize=9,
        leading=13,
        textColor=C_PRIMARY,
        alignment=1, # Center
        spaceBefore=4,
        spaceAfter=6
    )
    
    styles['TableHeader'] = ParagraphStyle(
        'TableHeader',
        parent=base['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=C_WHITE,
        alignment=1
    )
    
    styles['TableCell'] = ParagraphStyle(
        'TableCell',
        parent=base['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=C_DARK,
        alignment=0
    )

    styles['TableCellBold'] = ParagraphStyle(
        'TableCellBold',
        parent=base['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=C_NAVY,
        alignment=0
    )
    
    styles['Callout'] = ParagraphStyle(
        'Callout',
        parent=base['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
        textColor=C_MUTED,
        spaceBefore=4,
        spaceAfter=6
    )
    
    return styles

print("Styles initialized successfully.")

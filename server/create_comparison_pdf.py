"""
Generate PDF from model comparison report
"""
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
import os

def create_comparison_pdf():
    """Create professional PDF from comparison report"""
    
    # Read the text report
    with open('../MODEL_COMPARISON_REPORT.txt', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Create PDF
    pdf_file = '../MODEL_COMPARISON_REPORT.pdf'
    doc = SimpleDocTemplate(pdf_file, pagesize=letter,
                           rightMargin=50, leftMargin=50,
                           topMargin=50, bottomMargin=50)
    
    # Container for elements
    elements = []
    
    # Define styles
    styles = getSampleStyleSheet()
    
    # Title style
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=16,
        textColor=colors.HexColor('#1a1a1a'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    # Heading style
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=12,
        textColor=colors.HexColor('#2c5282'),
        spaceAfter=12,
        spaceBefore=16,
        fontName='Helvetica-Bold'
    )
    
    # Subheading style
    subheading_style = ParagraphStyle(
        'CustomSubheading',
        parent=styles['Heading3'],
        fontSize=11,
        textColor=colors.HexColor('#2d3748'),
        spaceAfter=10,
        spaceBefore=12,
        fontName='Helvetica-Bold'
    )
    
    # Body style
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['BodyText'],
        fontSize=10,
        textColor=colors.HexColor('#2d3748'),
        spaceAfter=6,
        alignment=TA_LEFT,
        fontName='Helvetica'
    )
    
    # Code style for tables
    code_style = ParagraphStyle(
        'CustomCode',
        parent=styles['Code'],
        fontSize=8,
        textColor=colors.HexColor('#1a202c'),
        spaceAfter=4,
        leftIndent=10,
        fontName='Courier'
    )
    
    # Parse content
    lines = content.split('\n')
    
    for i, line in enumerate(lines):
        line_stripped = line.strip()
        
        # Skip divider lines
        if not line_stripped or line_stripped == '=' * len(line_stripped) or line_stripped == '-' * len(line_stripped):
            if line_stripped:
                elements.append(Spacer(1, 0.05 * inch))
            continue
        
        # Main title
        if 'COMPREHENSIVE ML MODEL COMPARISON REPORT' in line_stripped:
            elements.append(Spacer(1, 0.2 * inch))
            elements.append(Paragraph(line_stripped, title_style))
            continue
        
        # Subtitle
        if 'Water Quality Prediction' in line_stripped and 'Mithi River' in line_stripped:
            subtitle_style = ParagraphStyle(
                'Subtitle',
                parent=styles['Normal'],
                fontSize=12,
                textColor=colors.HexColor('#4a5568'),
                alignment=TA_CENTER,
                spaceAfter=20
            )
            elements.append(Paragraph(line_stripped, subtitle_style))
            continue
        
        # Generated date
        if line_stripped.startswith('Generated:') or line_stripped.startswith('Dataset:') or line_stripped.startswith('Test Set:'):
            elements.append(Paragraph(line_stripped, body_style))
            continue
        
        # Part headings
        if line_stripped.startswith('PART '):
            elements.append(PageBreak())
            elements.append(Paragraph(line_stripped, heading_style))
            continue
        
        # Section numbers (1.1, 1.2, 2.1, etc.)
        if len(line_stripped) > 3 and line_stripped[0].isdigit() and line_stripped[1] == '.' and line_stripped[2].isdigit():
            elements.append(Spacer(1, 0.15 * inch))
            elements.append(Paragraph(line_stripped, subheading_style))
            continue
        
        # Main section headings with numbers
        if line_stripped and line_stripped[0].isdigit() and '. ' in line_stripped:
            parts = line_stripped.split('. ', 1)
            if len(parts) == 2 and len(parts[0]) <= 3:
                elements.append(Spacer(1, 0.15 * inch))
                elements.append(Paragraph(line_stripped, heading_style))
                continue
        
        # Check marks and bullets
        if line_stripped.startswith('✓') or line_stripped.startswith('•'):
            line_formatted = line_stripped.replace('✓', '&#10003;')
            elements.append(Paragraph(line_formatted, body_style))
            continue
        
        # Indented lines (details)
        if line.startswith('  ') and line_stripped:
            elements.append(Paragraph('&nbsp;&nbsp;&nbsp;&nbsp;' + line_stripped, body_style))
            continue
        
        # Task description
        if line_stripped.startswith('Task:'):
            task_style = ParagraphStyle(
                'Task',
                parent=body_style,
                textColor=colors.HexColor('#1a202c'),
                fontName='Helvetica-Oblique'
            )
            elements.append(Paragraph(line_stripped, task_style))
            continue
        
        # Winner announcements
        if 'WINNER:' in line_stripped or 'RECOMMENDATION:' in line_stripped:
            winner_style = ParagraphStyle(
                'Winner',
                parent=body_style,
                textColor=colors.HexColor('#2f855a'),
                fontName='Helvetica-Bold',
                fontSize=11
            )
            elements.append(Paragraph(line_stripped, winner_style))
            continue
        
        # Reasons section
        if line_stripped == 'Reasons:' or line_stripped.startswith('Reasons for'):
            elements.append(Paragraph('<b>' + line_stripped + '</b>', body_style))
            continue
        
        # Performance improvements
        if 'Performance Improvements' in line_stripped or 'Benefits of' in line_stripped or 'Advantages:' in line_stripped:
            elements.append(Paragraph('<b>' + line_stripped + '</b>', body_style))
            continue
        
        # Regular text
        if line_stripped:
            elements.append(Paragraph(line_stripped, body_style))
    
    # Build PDF
    doc.build(elements)
    print(f"✓ PDF comparison report created: {pdf_file}")
    print(f"  File size: {os.path.getsize(pdf_file) / 1024:.1f} KB")
    print(f"  Location: {os.path.abspath(pdf_file)}")

if __name__ == '__main__':
    try:
        create_comparison_pdf()
    except Exception as e:
        print(f"Error: {e}")
        print("\nTrying simpler PDF generation...")
        
        # Fallback
        from reportlab.pdfgen import canvas
        
        pdf_file = '../MODEL_COMPARISON_REPORT.pdf'
        c = canvas.Canvas(pdf_file, pagesize=letter)
        width, height = letter
        
        with open('../MODEL_COMPARISON_REPORT.txt', 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        y = height - 50
        c.setFont("Courier", 8)
        
        for line in lines:
            if y < 50:
                c.showPage()
                c.setFont("Courier", 8)
                y = height - 50
            
            line = line.rstrip()
            if len(line) > 100:
                line = line[:100] + '...'
            
            c.drawString(50, y, line)
            y -= 10
        
        c.save()
        print(f"✓ Simple PDF created: {pdf_file}")

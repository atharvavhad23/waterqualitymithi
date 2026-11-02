"""
Generate PDF report from ML model performance text file
"""
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfgen import canvas
import os

def create_pdf_report():
    """Create professional PDF report"""
    
    # Read the text report
    with open('../ML_MODEL_PERFORMANCE_REPORT_ACTUAL.txt', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Create PDF
    pdf_file = '../ML_MODEL_PERFORMANCE_REPORT.pdf'
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
        fontSize=13,
        textColor=colors.HexColor('#2c5282'),
        spaceAfter=12,
        spaceBefore=16,
        fontName='Helvetica-Bold'
    )
    
    # Body style
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['BodyText'],
        fontSize=10,
        textColor=colors.HexColor('#2d3748'),
        spaceAfter=8,
        alignment=TA_JUSTIFY,
        fontName='Helvetica'
    )
    
    # Code style
    code_style = ParagraphStyle(
        'CustomCode',
        parent=styles['Code'],
        fontSize=9,
        textColor=colors.HexColor('#1a202c'),
        spaceAfter=6,
        leftIndent=20,
        fontName='Courier'
    )
    
    # Parse content and add to PDF
    lines = content.split('\n')
    
    for line in lines:
        line = line.strip()
        
        # Skip empty lines in specific sections
        if not line or line == '=' * len(line) or line == '-' * len(line):
            if line:
                elements.append(Spacer(1, 0.1 * inch))
            continue
        
        # Main title
        if 'MITHI RIVER WATER QUALITY' in line and 'ML MODEL' in line:
            elements.append(Paragraph(line, title_style))
            continue
        
        # Section headings (numbered)
        if line[0].isdigit() and '. ' in line and line.split('. ')[0].isdigit():
            elements.append(Spacer(1, 0.15 * inch))
            elements.append(Paragraph(line, heading_style))
            continue
        
        # Sub-headings (contains colons)
        if ':' in line and not line.startswith(' ') and not line.startswith('•'):
            parts = line.split(':', 1)
            if len(parts) == 2 and len(parts[0]) < 60:
                # Bold the part before colon
                formatted = f"<b>{parts[0]}:</b>{parts[1]}"
                elements.append(Paragraph(formatted, body_style))
                continue
        
        # Bullet points
        if line.startswith('•') or line.startswith('✓') or line.startswith('✗') or line.startswith('⭐'):
            # Replace special characters
            line_formatted = line.replace('✓', '&#10003;').replace('✗', '&#10007;').replace('⭐', '&#9733;')
            elements.append(Paragraph(line_formatted, body_style))
            continue
        
        # Tables (simple detection)
        if '│' in line or '├' in line or '└' in line or '┌' in line:
            # Use code style for table formatting
            line_formatted = line.replace('│', '|').replace('├', '+').replace('└', '+').replace('┌', '+')
            line_formatted = line_formatted.replace('─', '-').replace('┴', '+').replace('┼', '+')
            elements.append(Paragraph(line_formatted, code_style))
            continue
        
        # Add page break for main sections
        if 'CLASSIFICATION MODEL' in line or 'REGRESSION MODELS' in line or \
           'FEATURE IMPORTANCE' in line or 'DATASET INFORMATION' in line or \
           'MODEL DEPLOYMENT' in line or 'KEY STRENGTHS' in line or \
           'USE CASES' in line or 'COMPETITIVE ADVANTAGES' in line or \
           'AREAS FOR IMPROVEMENT' in line or 'INVESTMENT' in line or \
           'MARKET OPPORTUNITY' in line or 'TEAM & EXECUTION' in line or \
           'RISK ANALYSIS' in line or 'CONCLUSION' in line:
            if elements:  # Don't add page break at the very start
                elements.append(PageBreak())
            elements.append(Paragraph(line, heading_style))
            continue
        
        # Regular text
        if line:
            elements.append(Paragraph(line, body_style))
    
    # Build PDF
    doc.build(elements)
    print(f"✓ PDF report created successfully: {pdf_file}")
    print(f"  File size: {os.path.getsize(pdf_file) / 1024:.1f} KB")
    print(f"  Location: {os.path.abspath(pdf_file)}")

if __name__ == '__main__':
    try:
        create_pdf_report()
    except Exception as e:
        print(f"Error creating PDF: {e}")
        print("\nFalling back to simple text-to-PDF conversion...")
        
        # Fallback: Try simpler PDF generation
        from reportlab.pdfgen import canvas
        
        pdf_file = '../ML_MODEL_PERFORMANCE_REPORT.pdf'
        c = canvas.Canvas(pdf_file, pagesize=letter)
        width, height = letter
        
        with open('../ML_MODEL_PERFORMANCE_REPORT_ACTUAL.txt', 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        y = height - 50
        page_num = 1
        
        c.setFont("Courier", 8)
        
        for line in lines:
            # Check if we need a new page
            if y < 50:
                c.showPage()
                c.setFont("Courier", 8)
                y = height - 50
                page_num += 1
            
            # Write line (truncate if too long)
            line = line.rstrip()
            if len(line) > 100:
                line = line[:100] + '...'
            
            c.drawString(50, y, line)
            y -= 10
        
        c.save()
        print(f"✓ Simple PDF created: {pdf_file}")

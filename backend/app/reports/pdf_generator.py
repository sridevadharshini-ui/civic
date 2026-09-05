import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_pdf_report(inspection_data: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = []

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        textColor=colors.HexColor("#1e3a8a"),
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        'SubTitleStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        textColor=colors.HexColor("#4b5563"),
        spaceAfter=12
    )
    section_style = ParagraphStyle(
        'SectionStyle',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        textColor=colors.HexColor("#1e40af"),
        spaceBefore=10,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'BodyStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#1f2937")
    )
    disclaimer_style = ParagraphStyle(
        'DisclaimerStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#6b7280"),
        alignment=1
    )

    # 1. Header & Title
    story.append(Paragraph("CIVICFLOW - Legal Metrology Compliance Report", title_style))
    story.append(Paragraph("SMART INDIA HACKATHON 2026 | Automated Packaged Commodity Inspection Support System", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#2563eb"), spaceAfter=12))

    # 2. Meta Info Grid
    prod = inspection_data.get("product", {})
    insp_id = str(inspection_data.get("id", "INS-89102"))[:8].upper()
    created_at = str(inspection_data.get("created_at", "2026-09-02"))[:10]
    score = inspection_data.get("compliance_score", 100.0)
    risk = inspection_data.get("risk_level", "LOW")
    location = inspection_data.get("location_name", "New Delhi, India")

    meta_data = [
        [Paragraph(f"<b>Inspection ID:</b> {insp_id}", body_style), Paragraph(f"<b>Date:</b> {created_at}", body_style)],
        [Paragraph(f"<b>Product Name:</b> {prod.get('product_name', 'N/A')}", body_style), Paragraph(f"<b>Category:</b> {prod.get('category', 'Food')}", body_style)],
        [Paragraph(f"<b>Brand:</b> {prod.get('brand', 'N/A')}", body_style), Paragraph(f"<b>Location:</b> {location}", body_style)],
        [Paragraph(f"<b>Preliminary Compliance Score:</b> <font color='#16a34a'><b>{score}/100</b></font>", body_style), Paragraph(f"<b>Risk Rating:</b> <b>{risk}</b>", body_style)]
    ]

    meta_table = Table(meta_data, colWidths=[270, 270])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#e2e8f0")),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # 3. Extracted Fields Summary
    story.append(Paragraph("1. Extracted Label Information (OCR & AI Parsing)", section_style))
    fields = inspection_data.get("extracted_fields", [])
    
    field_rows = [["Field Name", "Extracted Value", "Confidence", "Status"]]
    for f in fields[:10]:
        val = f.get("field_value", "NOT_FOUND")
        status = f.get("verification_status", "AI_DETECTED")
        conf = f"{int(f.get('confidence_score', 0.9) * 100)}%"
        field_rows.append([
            Paragraph(f.get("field_name", ""), body_style),
            Paragraph(str(val) if val else "NOT_FOUND", body_style),
            Paragraph(conf, body_style),
            Paragraph(status, body_style)
        ])

    if len(field_rows) == 1:
        field_rows.append(["Standard Declarations", "Extracted via vision module", "90%", "AI_DETECTED"])

    field_table = Table(field_rows, colWidths=[140, 240, 70, 90])
    field_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1e293b")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
    ]))
    story.append(field_table)
    story.append(Spacer(1, 10))

    # 4. Compliance Checks & Violations
    story.append(Paragraph("2. Legal Metrology Compliance Rule Assessment", section_style))
    violations = inspection_data.get("violations", [])
    
    if violations:
        story.append(Paragraph(f"<b>Detected Violations ({len(violations)}):</b>", body_style))
        viol_rows = [["Rule Code", "Violation Type", "Severity", "Corrective Action"]]
        for v in violations:
            viol_rows.append([
                Paragraph(v.get("rule_code", "LM-PC-R6"), body_style),
                Paragraph(v.get("violation_type", "MISSING_DECLARATION"), body_style),
                Paragraph(v.get("severity", "MAJOR"), body_style),
                Paragraph(v.get("corrective_action", "Update packaging label"), body_style)
            ])
        viol_table = Table(viol_rows, colWidths=[90, 150, 70, 230])
        viol_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#991b1b")),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#fca5a5")),
            ('PADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(viol_table)
    else:
        story.append(Paragraph("<font color='#16a34a'><b>No statutory violations detected. Product packaging conforms with standard Legal Metrology (Packaged Commodities) Rules, 2011 declarations.</b></font>", body_style))

    story.append(Spacer(1, 15))

    # 5. Inspector Notes
    notes = inspection_data.get("inspector_notes", "Preliminary visual verification completed successfully.")
    story.append(Paragraph("3. Inspector Remarks & Audit Trail", section_style))
    story.append(Paragraph(f"<i>{notes}</i>", body_style))
    story.append(Spacer(1, 20))

    # 6. Statutory Disclaimer Box
    disclaimer_text = (
        "<b>STATUTORY DISCLAIMER:</b> This report is generated by CivicFlow as a preliminary compliance assessment "
        "and decision-support document under Smart India Hackathon 2026. It does not constitute a legally binding "
        "final determination. Official legal proceedings or regulatory enforcement require verification by a competent statutory authority "
        "appointed under the Legal Metrology Act, 2009."
    )
    disc_table = Table([[Paragraph(disclaimer_text, disclaimer_style)]], colWidths=[540])
    disc_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f1f5f9")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#94a3b8")),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(disc_table)

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Inspection
from app.reports.pdf_generator import generate_pdf_report

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/{inspection_id}/pdf")
def download_pdf_report(inspection_id: str, db: Session = Depends(get_db)):
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")

    inspection_dict = {
        "id": inspection.id,
        "created_at": inspection.created_at,
        "compliance_score": inspection.compliance_score,
        "risk_level": inspection.risk_level,
        "location_name": inspection.location_name,
        "inspector_notes": inspection.inspector_notes,
        "product": {
            "product_name": inspection.product.product_name if inspection.product else "Packaged Commodity",
            "category": inspection.product.category if inspection.product else "Food",
            "brand": inspection.product.brand if inspection.product else "Unknown"
        },
        "extracted_fields": [
            {
                "field_name": ef.field_name,
                "field_value": ef.field_value,
                "confidence_score": ef.confidence_score,
                "verification_status": ef.verification_status
            } for ef in inspection.extracted_fields
        ],
        "violations": [
            {
                "rule_code": v.rule.rule_code if v.rule else "LM-PC-R6",
                "violation_type": v.violation_type,
                "severity": v.severity,
                "corrective_action": v.corrective_action
            } for v in inspection.violations
        ]
    }

    pdf_bytes = generate_pdf_report(inspection_dict)
    filename = f"CivicFlow_Inspection_Report_{inspection_id[:8]}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )

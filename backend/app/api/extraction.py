from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Inspection, OCRResult, ExtractedField
from app.ai.extraction import ai_extractor

router = APIRouter(prefix="/extraction", tags=["Structured Data Extraction"])

@router.post("/{inspection_id}")
def extract_structured_declarations(inspection_id: str, db: Session = Depends(get_db)):
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection record not found")

    # Get OCR text from recent OCRResult or generate raw text
    ocr_record = db.query(OCRResult).filter(OCRResult.inspection_id == inspection.id).order_by(OCRResult.created_at.desc()).first()
    raw_ocr = ocr_record.raw_ocr_text if ocr_record else ocr_engine.extract_raw_text(b"CIVICFLOW_LABEL_SCAN")

    category = inspection.product.category if inspection.product else "Food"
    extracted_items = ai_extractor.extract_structured_fields(raw_ocr, category)

    # Save to database
    saved_fields = []
    for ef in extracted_items:
        # Check if already exists for inspection
        existing = db.query(ExtractedField).filter(
            ExtractedField.inspection_id == inspection.id,
            ExtractedField.field_name == ef["field_name"]
        ).first()

        if existing:
            existing.field_value = ef["field_value"]
            existing.confidence_score = ef["confidence_score"]
            existing.verification_status = ef["verification_status"]
            db_ef = existing
        else:
            db_ef = ExtractedField(
                inspection_id=inspection.id,
                field_name=ef["field_name"],
                field_value=ef["field_value"],
                confidence_score=ef["confidence_score"],
                source_image=ef.get("source_image", "LABEL"),
                bounding_box=ef.get("bounding_box"),
                verification_status=ef.get("verification_status", "AI_DETECTED")
            )
            db.add(db_ef)
        saved_fields.append(db_ef)

    db.commit()

    declarations = {}
    field_list = []
    for sf in saved_fields:
        declarations[sf.field_name] = sf.field_value
        field_list.append({
            "field_name": sf.field_name,
            "field_value": sf.field_value,
            "confidence_score": sf.confidence_score,
            "verification_status": sf.verification_status
        })

    return {
        "inspection_id": inspection.id,
        "declarations": declarations,
        "extracted_fields": field_list
    }

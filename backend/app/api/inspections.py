from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import (
    Inspection, Product, ProductImage, ExtractedField, ComplianceCheck, Violation, ComplianceRule, AuditLog, User
)
from app.schemas.schemas import InspectionCreate, InspectionOut, InspectionUpdate
from app.api.deps import get_current_user, get_optional_current_user
from app.rules.rule_engine import rule_engine
from app.ai.extraction import ai_extractor
from app.ocr.ocr_engine import ocr_engine

router = APIRouter(prefix="/inspections", tags=["Inspections"])

@router.get("", response_model=List[InspectionOut])
def list_inspections(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    risk_level: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Inspection)
    if status:
        query = query.filter(Inspection.inspection_status == status)
    if risk_level:
        query = query.filter(Inspection.risk_level == risk_level)
    if category:
        query = query.join(Product).filter(Product.category == category)
        
    inspections = query.order_by(Inspection.created_at.desc()).offset(skip).limit(limit).all()
    return inspections

@router.post("", response_model=InspectionOut)
def create_inspection(
    insp_in: InspectionCreate,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    # 1. Create or match Product
    product = db.query(Product).filter(Product.product_name == insp_in.product_name).first()
    if not product:
        product = Product(
            product_name=insp_in.product_name,
            brand=insp_in.brand or "Brand Unknown",
            category=insp_in.category or "Food",
            country_of_origin="India"
        )
        db.add(product)
        db.commit()
        db.refresh(product)

    # Image URL
    img_url = insp_in.image_url or "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80"
    product_image = ProductImage(
        product_id=product.id,
        image_url=img_url,
        image_type=insp_in.image_type or "FRONT",
        image_quality_score=0.88
    )
    db.add(product_image)
    db.commit()

    # 2. Extract OCR & Rules
    raw_ocr = ocr_engine.extract_raw_text(b"CIVICFLOW_SCAN")
    extracted_raw = ai_extractor.extract_structured_fields(raw_ocr, product.category)
    
    comp_eval = rule_engine.evaluate_compliance(product.category, extracted_raw)

    # 3. Create Inspection record
    inspection = Inspection(
        inspector_id=current_user.id if current_user else None,
        product_id=product.id,
        inspection_status="COMPLETED",
        compliance_score=comp_eval["compliance_score"],
        risk_level=comp_eval["risk_level"],
        latitude=insp_in.latitude or 28.6139,
        longitude=insp_in.longitude or 77.2090,
        location_name=insp_in.location_name or "New Delhi, India",
        inspector_notes=insp_in.inspector_notes or "Initial AI inspection performed."
    )
    db.add(inspection)
    db.commit()
    db.refresh(inspection)

    # 4. Save Extracted Fields
    for ef in extracted_raw:
        db_ef = ExtractedField(
            inspection_id=inspection.id,
            field_name=ef["field_name"],
            field_value=ef["field_value"],
            confidence_score=ef["confidence_score"],
            source_image=img_url,
            bounding_box=ef["bounding_box"],
            verification_status=ef["verification_status"]
        )
        db.add(db_ef)

    # 5. Save Compliance Checks & Violations
    for chk in comp_eval["checks"]:
        # Find matching rule
        rule = db.query(ComplianceRule).filter(ComplianceRule.rule_code == chk["rule_code"]).first()
        rule_id = rule.id if rule else "default-rule-id"
        db_chk = ComplianceCheck(
            inspection_id=inspection.id,
            rule_id=rule_id,
            field_name=chk["field_name"],
            detected_value=chk["detected_value"],
            expected_condition=chk["expected_condition"],
            status=chk["status"],
            confidence=chk["confidence"],
            explanation=chk["explanation"]
        )
        db.add(db_chk)

    for viol in comp_eval["violations"]:
        rule = db.query(ComplianceRule).filter(ComplianceRule.rule_code == viol["rule_code"]).first()
        rule_id = rule.id if rule else None
        db_viol = Violation(
            inspection_id=inspection.id,
            rule_id=rule_id,
            violation_type=viol["violation_type"],
            description=viol["description"],
            severity=viol["severity"],
            evidence_image=img_url,
            evidence_text=viol["evidence_text"],
            corrective_action=viol["corrective_action"]
        )
        db.add(db_viol)

    db.commit()
    db.refresh(inspection)

    # Audit log
    if current_user:
        audit = AuditLog(
            user_id=current_user.id,
            action="CREATE_INSPECTION",
            entity_type="INSPECTION",
            entity_id=inspection.id,
            log_metadata={"score": inspection.compliance_score, "risk": inspection.risk_level}
        )
        db.add(audit)
        db.commit()

    return inspection

@router.get("/{inspection_id}", response_model=InspectionOut)
def get_inspection(inspection_id: str, db: Session = Depends(get_db)):
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection record not found")
    return inspection

@router.put("/{inspection_id}", response_model=InspectionOut)
def update_inspection(
    inspection_id: str,
    insp_update: InspectionUpdate,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")

    if insp_update.inspector_notes:
        inspection.inspector_notes = insp_update.inspector_notes
    if insp_update.inspection_status:
        inspection.inspection_status = insp_update.inspection_status

    # Human-in-the-loop field edits / overrides
    if insp_update.field_updates:
        for upd in insp_update.field_updates:
            field_id = upd.get("field_id")
            new_val = upd.get("field_value")
            status = upd.get("verification_status", "HUMAN_VERIFIED")

            db_field = db.query(ExtractedField).filter(ExtractedField.id == field_id).first()
            if db_field:
                db_field.field_value = new_val
                db_field.verification_status = status
                db_field.confidence_score = 1.0  # 100% human confirmed

        # Recalculate compliance score and risk level dynamically
        all_fields = db.query(ExtractedField).filter(ExtractedField.inspection_id == inspection.id).all()
        extracted_dicts = [{
            "field_name": f.field_name,
            "field_value": f.field_value,
            "confidence_score": f.confidence_score,
            "verification_status": f.verification_status
        } for f in all_fields]

        category = inspection.product.category if inspection.product else "Food"
        new_eval = rule_engine.evaluate_compliance(category, extracted_dicts)

        inspection.compliance_score = new_eval["compliance_score"]
        inspection.risk_level = new_eval["risk_level"]
        inspection.inspection_status = "VERIFIED"

    db.commit()
    db.refresh(inspection)

    if current_user:
        audit = AuditLog(
            user_id=current_user.id,
            action="UPDATE_VERIFICATION",
            entity_type="INSPECTION",
            entity_id=inspection.id,
            log_metadata={"new_score": inspection.compliance_score}
        )
        db.add(audit)
        db.commit()

    return inspection

@router.delete("/{inspection_id}")
def delete_inspection(inspection_id: str, db: Session = Depends(get_db)):
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection record not found")

    db.delete(inspection)
    db.commit()
    return {"message": "Inspection record deleted successfully", "id": inspection_id}

@router.post("/{inspection_id}/images")
async def upload_inspection_images(
    inspection_id: str,
    image_type: str = "FRONT",
    image_url: Optional[str] = None,
    db: Session = Depends(get_db)
):
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")

    img_link = image_url or "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80"
    
    product_image = ProductImage(
        product_id=inspection.product_id,
        image_url=img_link,
        image_type=image_type.upper(),
        image_quality_score=0.90
    )
    db.add(product_image)
    db.commit()
    db.refresh(product_image)

    return {
        "message": "Product image uploaded successfully",
        "image": {
            "id": product_image.id,
            "product_id": product_image.product_id,
            "image_url": product_image.image_url,
            "image_type": product_image.image_type,
            "upload_time": product_image.upload_time,
            "image_quality_score": product_image.image_quality_score
        }
    }


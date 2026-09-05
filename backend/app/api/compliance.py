from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Inspection, ExtractedField, ComplianceCheck, Violation, ComplianceRule
from app.rules.rule_engine import rule_engine

router = APIRouter(prefix="/compliance", tags=["Compliance Rule Engine"])

@router.post("/{inspection_id}")
def run_compliance_evaluation(inspection_id: str, db: Session = Depends(get_db)):
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")

    category = inspection.product.category if inspection.product else "Food"

    # Get extracted fields
    extracted_fields = db.query(ExtractedField).filter(ExtractedField.inspection_id == inspection.id).all()
    extracted_dicts = [{
        "field_name": ef.field_name,
        "field_value": ef.field_value,
        "confidence_score": ef.confidence_score,
        "verification_status": ef.verification_status
    } for ef in extracted_fields]

    # Fetch active DB rules
    db_rules = db.query(ComplianceRule).filter(ComplianceRule.active == True).all()
    rules_list = [{
        "rule_code": r.rule_code,
        "rule_name": r.rule_name,
        "description": r.description,
        "product_category": r.product_category,
        "required_field": r.required_field,
        "validation_type": r.validation_type,
        "severity": r.severity,
        "active": r.active,
        "source_reference": r.source_reference
    } for r in db_rules]

    comp_eval = rule_engine.evaluate_compliance(category, extracted_dicts, db_rules=rules_list if rules_list else None)

    # Determine status
    if comp_eval["compliance_score"] >= 90.0:
        overall_status = "PASS"
    elif comp_eval["compliance_score"] >= 75.0:
        overall_status = "WARNING"
    elif comp_eval["compliance_score"] >= 50.0:
        overall_status = "NEEDS_MANUAL_REVIEW"
    else:
        overall_status = "FAIL"

    inspection.compliance_score = comp_eval["compliance_score"]
    inspection.risk_level = comp_eval["risk_level"]
    inspection.inspection_status = overall_status

    # Save checks
    db.query(ComplianceCheck).filter(ComplianceCheck.inspection_id == inspection.id).delete()
    db.query(Violation).filter(Violation.inspection_id == inspection.id).delete()

    checks_out = []
    for chk in comp_eval["checks"]:
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
        checks_out.append({
            "field": chk["field_name"],
            "status": "PASS" if chk["status"] == "COMPLIANT" else ("FAIL" if chk["status"] == "NON_COMPLIANT" else "WARNING"),
            "message": chk["explanation"],
            "confidence": chk["confidence"]
        })

    for viol in comp_eval["violations"]:
        rule = db.query(ComplianceRule).filter(ComplianceRule.rule_code == viol["rule_code"]).first()
        rule_id = rule.id if rule else None

        db_viol = Violation(
            inspection_id=inspection.id,
            rule_id=rule_id,
            violation_type=viol["violation_type"],
            description=viol["description"],
            severity=viol["severity"],
            evidence_image=inspection.product.images[0].image_url if (inspection.product and inspection.product.images) else None,
            evidence_text=viol["evidence_text"],
            corrective_action=viol["corrective_action"]
        )
        db.add(db_viol)

    db.commit()
    db.refresh(inspection)

    return {
        "inspection_id": inspection.id,
        "overall_status": overall_status,
        "compliance_score": inspection.compliance_score,
        "risk_level": inspection.risk_level,
        "checks": checks_out,
        "violations": comp_eval["violations"]
    }

@router.get("/{inspection_id}")
def get_compliance_result(inspection_id: str, db: Session = Depends(get_db)):
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")

    checks = db.query(ComplianceCheck).filter(ComplianceCheck.inspection_id == inspection.id).all()
    violations = db.query(Violation).filter(Violation.inspection_id == inspection.id).all()

    checks_out = [{
        "field": c.field_name,
        "status": "PASS" if c.status == "COMPLIANT" else "FAIL",
        "message": c.explanation,
        "confidence": c.confidence
    } for c in checks]

    return {
        "inspection_id": inspection.id,
        "overall_status": inspection.inspection_status,
        "compliance_score": inspection.compliance_score,
        "risk_level": inspection.risk_level,
        "checks": checks_out,
        "violations_count": len(violations)
    }

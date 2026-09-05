from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import ComplianceRule
from app.schemas.schemas import RuleCreate, RuleOut

router = APIRouter(prefix="/rules", tags=["Compliance Rules Management"])

@router.get("", response_model=List[RuleOut])
def get_rules(db: Session = Depends(get_db)):
    return db.query(ComplianceRule).order_by(ComplianceRule.rule_code.asc()).all()

@router.post("", response_model=RuleOut)
def create_rule(rule_in: RuleCreate, db: Session = Depends(get_db)):
    existing = db.query(ComplianceRule).filter(ComplianceRule.rule_code == rule_in.rule_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Rule code already exists")

    rule = ComplianceRule(**rule_in.model_dump())
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule

@router.put("/{rule_id}", response_model=RuleOut)
def update_rule(rule_id: str, rule_in: RuleCreate, db: Session = Depends(get_db)):
    rule = db.query(ComplianceRule).filter(ComplianceRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")

    for k, v in rule_in.model_dump().items():
        setattr(rule, k, v)
        
    db.commit()
    db.refresh(rule)
    return rule

@router.delete("/{rule_id}")
def delete_rule(rule_id: str, db: Session = Depends(get_db)):
    rule = db.query(ComplianceRule).filter(ComplianceRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")

    db.delete(rule)
    db.commit()
    return {"message": "Rule deleted successfully"}

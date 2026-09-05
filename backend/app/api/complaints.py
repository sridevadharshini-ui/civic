from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Complaint, User
from app.schemas.schemas import ComplaintCreate, ComplaintOut, ComplaintUpdate
from app.api.deps import get_current_user

router = APIRouter(prefix="/complaints", tags=["Consumer Complaints"])

@router.get("", response_model=List[ComplaintOut])
def get_complaints(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Complaint).order_by(Complaint.created_at.desc()).offset(skip).limit(limit).all()

@router.post("", response_model=ComplaintOut)
def create_complaint(
    complaint_in: ComplaintCreate,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    complaint = Complaint(
        consumer_id=current_user.id if current_user else None,
        product_name=complaint_in.product_name or "Unknown Packaged Product",
        brand_name=complaint_in.brand_name or "Unknown Brand",
        complaint_type=complaint_in.complaint_type,
        description=complaint_in.description,
        image=complaint_in.image or "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
        location=complaint_in.location or "New Delhi",
        status="SUBMITTED"
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return complaint

@router.put("/{complaint_id}", response_model=ComplaintOut)
def update_complaint_status(
    complaint_id: str,
    update_in: ComplaintUpdate,
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint.status = update_in.status
    db.commit()
    db.refresh(complaint)
    return complaint

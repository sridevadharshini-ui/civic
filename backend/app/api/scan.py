import base64
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.ocr.ocr_engine import ocr_engine
from app.ai.extraction import ai_extractor
from app.rules.rule_engine import rule_engine
from app.schemas.schemas import ScanProcessRequest

router = APIRouter(prefix="/scan", tags=["Scanning & OCR"])

@router.post("/process")
async def process_scan(
    file: UploadFile = File(None),
    image_data: str = Form(None),
    category_hint: str = Form("Food"),
    image_type: str = Form("FRONT"),
    db: Session = Depends(get_db)
):
    """
    Accepts either an uploaded file or base64 image_data.
    Performs image quality check, raw OCR text extraction, AI label field extraction,
    category detection, and initial rule engine evaluation.
    """
    image_bytes = None
    if file:
        image_bytes = await file.read()
    elif image_data:
        if "," in image_data:
            image_data = image_data.split(",")[1]
        try:
            image_bytes = base64.b64decode(image_data)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid base64 image data string")
    
    if not image_bytes:
        # Fallback sample image for testing
        image_bytes = b"CIVICFLOW_DEMO_IMAGE_BYTES"

    # 1. Quality check
    quality_result = ocr_engine.analyze_image_quality(image_bytes)

    # 2. Raw OCR Text
    raw_ocr = ocr_engine.extract_raw_text(image_bytes)

    # 3. Category Detection
    detected_category = ai_extractor.detect_category(raw_ocr, category_hint)

    # 4. Structured AI Extraction
    extracted_fields = ai_extractor.extract_structured_fields(raw_ocr, detected_category)

    # 5. Rule Engine evaluation
    compliance_res = rule_engine.evaluate_compliance(detected_category, extracted_fields)

    return {
        "quality": quality_result,
        "raw_ocr_text": raw_ocr,
        "detected_category": detected_category,
        "extracted_fields": extracted_fields,
        "compliance_score": compliance_res["compliance_score"],
        "risk_level": compliance_res["risk_level"],
        "compliance_checks": compliance_res["checks"],
        "violations": compliance_res["violations"]
    }

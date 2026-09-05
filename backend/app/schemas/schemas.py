from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import datetime

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class LoginRequest(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str = "CONSUMER"  # ADMIN, INSPECTOR, CONSUMER
    phone: Optional[str] = None

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str
    phone: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- Product & Image Schemas ---
class ProductImageBase(BaseModel):
    image_url: str
    image_type: str = "FRONT"
    image_quality_score: float = 0.85

class ProductImageOut(ProductImageBase):
    id: str
    product_id: str
    upload_time: Optional[datetime] = None

    class Config:
        from_attributes = True

class ProductCreate(BaseModel):
    product_name: str
    brand: Optional[str] = None
    category: str = "Food"
    manufacturer: Optional[str] = None
    packer: Optional[str] = None
    importer: Optional[str] = None
    barcode: Optional[str] = None
    country_of_origin: Optional[str] = "India"
    net_quantity: Optional[str] = None
    mrp: Optional[str] = None
    batch_number: Optional[str] = None
    manufacturing_date: Optional[str] = None
    expiry_date: Optional[str] = None
    consumer_care_details: Optional[str] = None

class ProductUpdate(BaseModel):
    product_name: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    manufacturer: Optional[str] = None
    packer: Optional[str] = None
    importer: Optional[str] = None
    barcode: Optional[str] = None
    country_of_origin: Optional[str] = None
    net_quantity: Optional[str] = None
    mrp: Optional[str] = None
    batch_number: Optional[str] = None
    manufacturing_date: Optional[str] = None
    expiry_date: Optional[str] = None
    consumer_care_details: Optional[str] = None

class ProductOut(ProductCreate):
    id: str
    created_at: Optional[datetime] = None
    images: List[ProductImageOut] = []

    class Config:
        from_attributes = True


# --- OCR Results ---
class OCRResultOut(BaseModel):
    id: str
    inspection_id: str
    image_url: Optional[str] = None
    raw_ocr_text: str
    confidence_score: float
    bounding_boxes: Optional[dict] = None
    is_demo_fallback: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- Extracted Fields ---
class ExtractedFieldBase(BaseModel):
    field_name: str
    field_value: Optional[str] = None
    confidence_score: float = 0.90
    source_image: Optional[str] = None
    bounding_box: Optional[dict] = None
    verification_status: str = "AI_DETECTED"  # AI_DETECTED, HUMAN_VERIFIED, REJECTED, EDITED

class ExtractedFieldUpdate(BaseModel):
    field_value: Optional[str] = None
    verification_status: str = "HUMAN_VERIFIED"

class ExtractedFieldOut(ExtractedFieldBase):
    id: str
    inspection_id: str

    class Config:
        from_attributes = True


# --- Rules & Compliance ---
class RuleBase(BaseModel):
    rule_code: str
    rule_name: str
    description: Optional[str] = None
    product_category: str = "ALL"
    required_field: str
    validation_type: str = "PRESENCE"
    validation_parameters: Optional[dict] = None
    severity: str = "MAJOR"  # CRITICAL, MAJOR, MINOR
    active: bool = True
    source_reference: Optional[str] = "Legal Metrology (Packaged Commodities) Rules, 2011"
    effective_from: Optional[datetime] = None
    effective_to: Optional[datetime] = None
    version: str = "1.0"

class RuleCreate(RuleBase):
    pass

class RuleOut(RuleBase):
    id: str

    class Config:
        from_attributes = True

class ComplianceCheckOut(BaseModel):
    id: str
    inspection_id: str
    rule_id: str
    field_name: str
    detected_value: Optional[str] = None
    expected_condition: Optional[str] = None
    status: str
    confidence: float
    explanation: Optional[str] = None

    class Config:
        from_attributes = True

class ViolationOut(BaseModel):
    id: str
    inspection_id: str
    rule_id: Optional[str] = None
    violation_type: str
    description: str
    severity: str
    evidence_image: Optional[str] = None
    evidence_text: Optional[str] = None
    corrective_action: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- Inspection Schemas ---
class InspectionCreate(BaseModel):
    product_name: str
    category: str = "Food"
    brand: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = "New Delhi, India"
    image_url: Optional[str] = None
    image_type: Optional[str] = "FRONT"
    inspector_notes: Optional[str] = None

class InspectionUpdate(BaseModel):
    inspection_status: Optional[str] = None
    inspector_notes: Optional[str] = None
    field_updates: Optional[List[dict]] = None

class InspectionOut(BaseModel):
    id: str
    inspector_id: Optional[str] = None
    product_id: str
    inspection_status: str
    compliance_score: float
    risk_level: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None
    inspector_notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    product: Optional[ProductOut] = None
    extracted_fields: List[ExtractedFieldOut] = []
    compliance_checks: List[ComplianceCheckOut] = []
    violations: List[ViolationOut] = []
    ocr_results: List[OCRResultOut] = []

    class Config:
        from_attributes = True


# --- Complaint Schemas ---
class ComplaintCreate(BaseModel):
    product_name: Optional[str] = None
    brand_name: Optional[str] = None
    complaint_type: str
    description: str
    image: Optional[str] = None
    location: Optional[str] = None

class ComplaintUpdate(BaseModel):
    status: str  # SUBMITTED, UNDER_REVIEW, ASSIGNED, RESOLVED, REJECTED

class ComplaintOut(BaseModel):
    id: str
    consumer_id: Optional[str] = None
    product_id: Optional[str] = None
    product_name: Optional[str] = None
    brand_name: Optional[str] = None
    complaint_type: str
    description: str
    image: Optional[str] = None
    location: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- Analytics & Dashboard Schemas ---
class DashboardAnalytics(BaseModel):
    total_inspections: int
    compliant_products: int
    needs_review_count: int
    high_risk_count: int
    total_violations: int
    open_complaints: int
    avg_compliance_score: float
    compliance_trend: List[dict]
    violations_by_category: List[dict]
    risk_distribution: List[dict]
    top_violation_types: List[dict]
    inspection_locations: List[dict]


# --- Scan Request ---
class ScanProcessRequest(BaseModel):
    image_data: str  # Base64 string or image URL
    image_type: str = "FRONT"
    product_category: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None

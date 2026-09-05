import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Float, Integer, Boolean, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="CONSUMER")  # ADMIN, INSPECTOR, CONSUMER
    phone = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    inspections = relationship("Inspection", back_populates="inspector", foreign_keys="Inspection.inspector_id")
    complaints = relationship("Complaint", back_populates="consumer", foreign_keys="Complaint.consumer_id")
    audit_logs = relationship("AuditLog", back_populates="user")


class Product(Base):
    __tablename__ = "products"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_name = Column(String(255), nullable=False)
    brand = Column(String(255), nullable=True)
    category = Column(String(100), nullable=False, default="Food")  # Food, Beverage, Cosmetics, Household, Personal Care, Electrical, etc.
    manufacturer = Column(String(255), nullable=True)
    packer = Column(String(255), nullable=True)
    importer = Column(String(255), nullable=True)
    barcode = Column(String(100), nullable=True, index=True)
    country_of_origin = Column(String(100), nullable=True, default="India")
    net_quantity = Column(String(100), nullable=True)
    mrp = Column(String(100), nullable=True)
    batch_number = Column(String(100), nullable=True)
    manufacturing_date = Column(String(100), nullable=True)
    expiry_date = Column(String(100), nullable=True)
    consumer_care_details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    inspections = relationship("Inspection", back_populates="product", cascade="all, delete-orphan")
    complaints = relationship("Complaint", back_populates="product")


class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    image_url = Column(Text, nullable=False)
    image_type = Column(String(50), default="FRONT")  # FRONT, BACK, SIDE, BOTTOM, TOP
    upload_time = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    image_quality_score = Column(Float, default=0.85)  # 0.0 to 1.0

    product = relationship("Product", back_populates="images")


class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    inspector_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    inspection_status = Column(String(50), default="COMPLETED")  # PASS, FAIL, WARNING, NEEDS_MANUAL_REVIEW, COMPLETED
    compliance_score = Column(Float, default=100.0)  # 0 to 100
    risk_level = Column(String(50), default="LOW")  # LOW, MEDIUM, HIGH, CRITICAL
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_name = Column(String(255), nullable=True, default="New Delhi, India")
    inspector_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    inspector = relationship("User", back_populates="inspections")
    product = relationship("Product", back_populates="inspections")
    extracted_fields = relationship("ExtractedField", back_populates="inspection", cascade="all, delete-orphan")
    compliance_checks = relationship("ComplianceCheck", back_populates="inspection", cascade="all, delete-orphan")
    violations = relationship("Violation", back_populates="inspection", cascade="all, delete-orphan")
    ocr_results = relationship("OCRResult", back_populates="inspection", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="inspection", cascade="all, delete-orphan")


class OCRResult(Base):
    __tablename__ = "ocr_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    inspection_id = Column(String(36), ForeignKey("inspections.id"), nullable=False)
    image_url = Column(Text, nullable=True)
    raw_ocr_text = Column(Text, nullable=False)
    confidence_score = Column(Float, default=0.88)
    bounding_boxes = Column(JSON, nullable=True)
    is_demo_fallback = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    inspection = relationship("Inspection", back_populates="ocr_results")


class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    inspection_id = Column(String(36), ForeignKey("inspections.id"), nullable=False)
    report_type = Column(String(50), default="PDF")
    file_path = Column(Text, nullable=True)
    generated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    inspection = relationship("Inspection", back_populates="reports")


class ExtractedField(Base):
    __tablename__ = "extracted_fields"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    inspection_id = Column(String(36), ForeignKey("inspections.id"), nullable=False)
    field_name = Column(String(100), nullable=False)
    field_value = Column(Text, nullable=True)
    confidence_score = Column(Float, default=0.90)  # 0.0 to 1.0
    source_image = Column(Text, nullable=True)
    bounding_box = Column(JSON, nullable=True)  # {x, y, width, height}
    verification_status = Column(String(50), default="AI_DETECTED")  # AI_DETECTED, HUMAN_VERIFIED, REJECTED, EDITED

    inspection = relationship("Inspection", back_populates="extracted_fields")


class ComplianceRule(Base):
    __tablename__ = "compliance_rules"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    rule_code = Column(String(50), unique=True, nullable=False, index=True)  # e.g., LM-PC-2011-R6-1A
    rule_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    product_category = Column(String(100), nullable=False, default="ALL")  # Food, Beverage, ALL, etc.
    required_field = Column(String(100), nullable=False)
    validation_type = Column(String(50), nullable=False, default="PRESENCE")  # PRESENCE, FORMAT, REGEX, VALUE_CHECK
    validation_parameters = Column(JSON, nullable=True)
    severity = Column(String(50), nullable=False, default="MAJOR")  # CRITICAL, MAJOR, MINOR
    active = Column(Boolean, default=True)
    source_reference = Column(Text, nullable=True, default="Legal Metrology (Packaged Commodities) Rules, 2011")
    effective_from = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    effective_to = Column(DateTime, nullable=True)
    version = Column(String(20), default="1.0")

    checks = relationship("ComplianceCheck", back_populates="rule")
    violations = relationship("Violation", back_populates="rule")


class ComplianceCheck(Base):
    __tablename__ = "compliance_checks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    inspection_id = Column(String(36), ForeignKey("inspections.id"), nullable=False)
    rule_id = Column(String(36), ForeignKey("compliance_rules.id"), nullable=False)
    field_name = Column(String(100), nullable=False)
    detected_value = Column(Text, nullable=True)
    expected_condition = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="COMPLIANT")  # COMPLIANT, NON_COMPLIANT, WARNING, NOT_VERIFIABLE, NEEDS_REVIEW
    confidence = Column(Float, default=0.90)
    explanation = Column(Text, nullable=True)

    inspection = relationship("Inspection", back_populates="compliance_checks")
    rule = relationship("ComplianceRule", back_populates="checks")


class Violation(Base):
    __tablename__ = "violations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    inspection_id = Column(String(36), ForeignKey("inspections.id"), nullable=False)
    rule_id = Column(String(36), ForeignKey("compliance_rules.id"), nullable=True)
    violation_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(50), nullable=False, default="MAJOR")  # CRITICAL, MAJOR, MINOR
    evidence_image = Column(Text, nullable=True)
    evidence_text = Column(Text, nullable=True)
    corrective_action = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    inspection = relationship("Inspection", back_populates="violations")
    rule = relationship("ComplianceRule", back_populates="violations")


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    consumer_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=True)
    product_name = Column(String(255), nullable=True)
    brand_name = Column(String(255), nullable=True)
    complaint_type = Column(String(100), nullable=False)  # MISSING_DECLARATION, OVERCHARGING_MRP, EXPIRED_PRODUCT, FAKE_QUANTITY, OTHER
    description = Column(Text, nullable=False)
    image = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    status = Column(String(50), default="SUBMITTED")  # SUBMITTED, UNDER_REVIEW, ASSIGNED, RESOLVED, REJECTED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    consumer = relationship("User", back_populates="complaints")
    product = relationship("Product", back_populates="complaints")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(String(36), nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    log_metadata = Column(JSON, nullable=True)

    user = relationship("User", back_populates="audit_logs")


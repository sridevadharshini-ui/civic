export type UserRole = 'ADMIN' | 'INSPECTOR' | 'CONSUMER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  created_at?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  image_type: 'FRONT' | 'BACK' | 'SIDE' | 'BOTTOM' | 'TOP';
  upload_time?: string;
  image_quality_score: number;
}

export interface Product {
  id: string;
  product_name: string;
  brand?: string;
  category: string;
  manufacturer?: string;
  packer?: string;
  importer?: string;
  barcode?: string;
  country_of_origin?: string;
  created_at?: string;
  images?: ProductImage[];
}

export interface ExtractedField {
  id: string;
  inspection_id?: string;
  field_name: string;
  field_value?: string;
  confidence_score: number;
  source_image?: string;
  bounding_box?: { x: number; y: number; width: number; height: number };
  verification_status: 'AI_DETECTED' | 'HUMAN_VERIFIED' | 'REJECTED' | 'EDITED';
}

export interface ComplianceRule {
  id: string;
  rule_code: string;
  rule_name: string;
  description?: string;
  product_category: string;
  required_field: string;
  validation_type: string;
  validation_parameters?: any;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  active: boolean;
  effective_from?: string;
  effective_to?: string;
  version: string;
}

export interface ComplianceCheck {
  id: string;
  inspection_id: string;
  rule_id: string;
  field_name: string;
  detected_value?: string;
  expected_condition?: string;
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'WARNING' | 'NOT_VERIFIABLE' | 'NEEDS_REVIEW';
  confidence: number;
  explanation?: string;
}

export interface Violation {
  id: string;
  inspection_id: string;
  rule_id?: string;
  rule_code?: string;
  violation_type: string;
  description: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  evidence_image?: string;
  evidence_text?: string;
  corrective_action?: string;
  created_at?: string;
}

export interface Inspection {
  id: string;
  inspector_id?: string;
  product_id: string;
  inspection_status: 'PENDING' | 'COMPLETED' | 'NEEDS_REVIEW' | 'VERIFIED';
  compliance_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  latitude?: number;
  longitude?: number;
  location_name?: string;
  inspector_notes?: string;
  created_at?: string;
  updated_at?: string;
  product?: Product;
  extracted_fields: ExtractedField[];
  compliance_checks: ComplianceCheck[];
  violations: Violation[];
}

export interface Complaint {
  id: string;
  consumer_id?: string;
  product_id?: string;
  product_name?: string;
  brand_name?: string;
  complaint_type: string;
  description: string;
  image?: string;
  location?: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ASSIGNED' | 'RESOLVED' | 'REJECTED';
  created_at?: string;
  updated_at?: string;
}

export interface QualityResult {
  quality_score: number;
  quality_label: 'Good' | 'Moderate' | 'Poor';
  contrast_score: number;
  blur_score: number;
  recommendation: string;
}

export interface ScanResult {
  quality: QualityResult;
  raw_ocr_text: string;
  detected_category: string;
  extracted_fields: ExtractedField[];
  compliance_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  compliance_checks: ComplianceCheck[];
  violations: Violation[];
}

export interface DashboardAnalytics {
  total_inspections: number;
  compliant_products: number;
  needs_review_count: number;
  high_risk_count: number;
  total_violations: number;
  open_complaints: number;
  avg_compliance_score: number;
  compliance_trend: { month: string; inspections: number; avg_score: number }[];
  violations_by_category: { category: string; count: number }[];
  risk_distribution: { name: string; value: number; color: string }[];
  top_violation_types: { type: string; count: number; severity: string }[];
  inspection_locations: { id: string; product_name: string; lat: number; lng: number; location_name: string; score: number; risk: string }[];
}

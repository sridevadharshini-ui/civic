from typing import List, Dict, Any

DEFAULT_LEGAL_RULES = [
    {
        "rule_code": "LM-PC-R6-1A",
        "rule_name": "Manufacturer / Packer / Importer Name & Address",
        "description": "Every package shall bear the name and complete address of the manufacturer, packer or importer as per Rule 6(1)(a) of Legal Metrology (Packaged Commodities) Rules, 2011.",
        "product_category": "ALL",
        "required_field": "Manufacturer Details",
        "validation_type": "PRESENCE",
        "severity": "CRITICAL",
        "active": True
    },
    {
        "rule_code": "LM-PC-R6-1B",
        "rule_name": "Generic or Common Name of Commodity",
        "description": "Every package shall display the generic or common name of the commodity as per Rule 6(1)(b).",
        "product_category": "ALL",
        "required_field": "Generic / Common Name",
        "validation_type": "PRESENCE",
        "severity": "MAJOR",
        "active": True
    },
    {
        "rule_code": "LM-PC-R6-1C",
        "rule_name": "Net Quantity Declaration",
        "description": "Net quantity in standard units of weight, measure or number must be clearly stated as per Rule 6(1)(c).",
        "product_category": "ALL",
        "required_field": "Net Quantity",
        "validation_type": "PRESENCE",
        "severity": "CRITICAL",
        "active": True
    },
    {
        "rule_code": "LM-PC-R6-1D",
        "rule_name": "Manufacturing or Packing Date",
        "description": "Month and year of manufacture, packing or import must be declared on the principal display panel as per Rule 6(1)(d).",
        "product_category": "ALL",
        "required_field": "Manufacturing Date",
        "validation_type": "PRESENCE",
        "severity": "MAJOR",
        "active": True
    },
    {
        "rule_code": "LM-PC-R6-1E",
        "rule_name": "Maximum Retail Price (MRP) Declaration",
        "description": "MRP inclusive of all taxes must be declared in Indian Currency (₹ or Rs.) as per Rule 6(1)(e).",
        "product_category": "ALL",
        "required_field": "MRP",
        "validation_type": "PRESENCE",
        "severity": "CRITICAL",
        "active": True
    },
    {
        "rule_code": "LM-PC-R6-1F",
        "rule_name": "Consumer Care Information",
        "description": "Complete contact details including phone number, email and contact address for consumer complaints as per Rule 6(1)(f).",
        "product_category": "ALL",
        "required_field": "Consumer Care Details",
        "validation_type": "PRESENCE",
        "severity": "CRITICAL",
        "active": True
    },
    {
        "rule_code": "LM-PC-R6-1G",
        "rule_name": "Country of Origin Declaration",
        "description": "Declaration of Country of Origin is mandatory on all pre-packaged commodities as per Legal Metrology Amendments.",
        "product_category": "ALL",
        "required_field": "Country of Origin",
        "validation_type": "PRESENCE",
        "severity": "MAJOR",
        "active": True
    },
    {
        "rule_code": "LM-PC-R6-1H",
        "rule_name": "Unit Sale Price Declaration",
        "description": "Unit sale price must be declared on pre-packaged commodities to facilitate price comparison as per amended Rule 6(11).",
        "product_category": "ALL",
        "required_field": "Unit Sale Price",
        "validation_type": "PRESENCE",
        "severity": "MINOR",
        "active": True
    }
]

class RuleEngine:
    def evaluate_compliance(
        self,
        category: str,
        extracted_fields: List[Dict[str, Any]],
        db_rules: List[Dict[str, Any]] | None = None
    ) -> Dict[str, Any]:
        """
        Evaluates extracted fields against active rules.
        Calculates preliminary compliance score (0-100), risk level, checks, and violations.
        """
        rules = db_rules if db_rules else DEFAULT_LEGAL_RULES
        
        # Build field map
        field_map = {}
        for ef in extracted_fields:
            fname = ef.get("field_name")
            fval = ef.get("field_value")
            fconf = ef.get("confidence_score", 0.0)
            field_map[fname] = {
                "value": fval,
                "confidence": fconf,
                "status": ef.get("verification_status", "AI_DETECTED")
            }

        checks = []
        violations = []
        deductions = 0.0

        for r in rules:
            if not r.get("active", True):
                continue

            rule_cat = r.get("product_category", "ALL")
            if rule_cat != "ALL" and rule_cat != category:
                continue

            req_field = r.get("required_field")
            severity = r.get("severity", "MAJOR")
            rule_code = r.get("rule_code")
            rule_name = r.get("rule_name")

            extracted = field_map.get(req_field)
            has_value = bool(extracted and extracted["value"] and extracted["value"] != "NOT_FOUND")

            if has_value:
                # Compliant check
                status = "COMPLIANT"
                conf = extracted["confidence"]
                explanation = f"Mandatory declaration '{req_field}' is clearly present: {extracted['value']}."
            else:
                # Violation check
                status = "NON_COMPLIANT"
                conf = 0.85
                explanation = f"Mandatory declaration '{req_field}' was NOT detected on the package label."

                # Penalty deductions based on legal severity
                if severity == "CRITICAL":
                    deductions += 25.0
                    corrective = "Immediately update product label to include full statutory declaration before distribution."
                elif severity == "MAJOR":
                    deductions += 15.0
                    corrective = "Provide clear and legible declaration on principal display panel."
                else:
                    deductions += 5.0
                    corrective = "Add optional / minor declaration as per updated Legal Metrology guidelines."

                violations.append({
                    "rule_code": rule_code,
                    "rule_name": rule_name,
                    "violation_type": f"MISSING_{req_field.upper().replace(' ', '_')}",
                    "description": explanation,
                    "severity": severity,
                    "evidence_text": f"Scanned label lacks mandatory '{req_field}' field.",
                    "corrective_action": corrective
                })

            checks.append({
                "rule_code": rule_code,
                "rule_name": rule_name,
                "field_name": req_field,
                "detected_value": extracted["value"] if (extracted and has_value) else "NOT_FOUND",
                "expected_condition": f"Legible {req_field} declaration as per {rule_code}",
                "status": status,
                "confidence": conf,
                "explanation": explanation
            })

        # Calculate final CivicFlow Preliminary Compliance Score
        score = max(0.0, min(100.0, 100.0 - deductions))
        
        # Risk level logic
        if score >= 90.0:
            risk_level = "LOW"
        elif score >= 75.0:
            risk_level = "MEDIUM"
        elif score >= 50.0:
            risk_level = "HIGH"
        else:
            risk_level = "CRITICAL"

        return {
            "compliance_score": round(score, 1),
            "risk_level": risk_level,
            "checks": checks,
            "violations": violations
        }

rule_engine = RuleEngine()

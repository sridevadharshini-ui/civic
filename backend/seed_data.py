import uuid
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.models import (
    User, Product, ProductImage, Inspection, ExtractedField,
    ComplianceRule, ComplianceCheck, Violation, Complaint
)
from app.core.security import get_password_hash
from app.rules.rule_engine import DEFAULT_LEGAL_RULES

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # Check if already seeded
        if db.query(User).filter(User.email == "admin@civicflow.gov.in").first():
            return

        print("Seeding CivicFlow initial demo dataset...")

        # 1. Users
        admin_user = User(
            id=str(uuid.uuid4()),
            name="Rajesh Sharma (Admin)",
            email="admin@civicflow.gov.in",
            password_hash=get_password_hash("admin123"),
            role="ADMIN",
            phone="+91 98765 43210"
        )
        inspector_user = User(
            id=str(uuid.uuid4()),
            name="Vikram Singh (Sr. Legal Inspector)",
            email="inspector@civicflow.gov.in",
            password_hash=get_password_hash("inspector123"),
            role="INSPECTOR",
            phone="+91 98111 22233"
        )
        consumer_user = User(
            id=str(uuid.uuid4()),
            name="Ananya Roy (Consumer)",
            email="consumer@civicflow.gov.in",
            password_hash=get_password_hash("consumer123"),
            role="CONSUMER",
            phone="+91 97123 45678"
        )
        db.add_all([admin_user, inspector_user, consumer_user])
        db.commit()

        # 2. Compliance Rules
        db_rules = []
        for r in DEFAULT_LEGAL_RULES:
            rule_obj = ComplianceRule(
                id=str(uuid.uuid4()),
                rule_code=r["rule_code"],
                rule_name=r["rule_name"],
                description=r["description"],
                product_category=r["product_category"],
                required_field=r["required_field"],
                validation_type=r["validation_type"],
                severity=r["severity"],
                active=r["active"]
            )
            db.add(rule_obj)
            db_rules.append(rule_obj)
        db.commit()

        rule_map = {r.rule_code: r.id for r in db_rules}

        # 3. Demo Products & 10 Realistic Inspections
        demo_products_data = [
            {
                "product_name": "Organic Whole Wheat Atta 5kg",
                "brand": "NaturaFresh",
                "category": "Food",
                "manufacturer": "NaturaFresh Foods India Pvt Ltd, Plot 42, Sector 62, Noida, UP",
                "mrp": "₹285.00",
                "net_qty": "5 kg",
                "mfg_date": "08/2026",
                "score": 100.0,
                "risk": "LOW",
                "status": "VERIFIED",
                "image": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80",
                "violations": []
            },
            {
                "product_name": "Golden Sunrise Sunflower Oil 1L",
                "brand": "Golden Sunrise",
                "category": "Food",
                "manufacturer": "Sunrise Agri Oils Pvt Ltd, Plot 105, GIDC, Surat, Gujarat",
                "mrp": "₹165.00",
                "net_qty": "1 L",
                "mfg_date": "07/2026",
                "score": 85.0,
                "risk": "MEDIUM",
                "status": "COMPLETED",
                "image": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
                "violations": [
                    {
                        "rule": "LM-PC-R6-1H",
                        "type": "MISSING_UNIT_SALE_PRICE",
                        "desc": "Unit Sale Price declaration (per litre/ml) was missing on packaging.",
                        "sev": "MINOR",
                        "action": "Include Unit Sale Price declaration (₹0.165/ml)."
                    }
                ]
            },
            {
                "product_name": "PureGlow Herbal Face Wash 150ml",
                "brand": "PureGlow Organic",
                "category": "Cosmetics",
                "manufacturer": "PureGlow Care Pvt Ltd, Industrial Area, Haridwar, UK",
                "mrp": "₹220.00",
                "net_qty": "150 ml",
                "mfg_date": "05/2026",
                "score": 60.0,
                "risk": "HIGH",
                "status": "NEEDS_REVIEW",
                "image": "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",
                "violations": [
                    {
                        "rule": "LM-PC-R6-1F",
                        "type": "MISSING_CONSUMER_CARE_DETAILS",
                        "desc": "Consumer Care contact telephone and email details not detected on retail label.",
                        "sev": "CRITICAL",
                        "action": "Print mandatory customer care phone line and email address."
                    },
                    {
                        "rule": "LM-PC-R6-1G",
                        "type": "MISSING_COUNTRY_OF_ORIGIN",
                        "desc": "Country of origin is not explicitly stated on the packaging.",
                        "sev": "MAJOR",
                        "action": "Print 'Country of Origin: India'."
                    }
                ]
            },
            {
                "product_name": "Sparkle Clean Dishwash Gel 500ml",
                "brand": "Sparkle Clean",
                "category": "Household Products",
                "manufacturer": "Sparkle Home Care Ltd, MIDC Taloja, Navi Mumbai",
                "mrp": "₹110.00",
                "net_qty": "500 ml",
                "mfg_date": "06/2026",
                "score": 40.0,
                "risk": "CRITICAL",
                "status": "NEEDS_REVIEW",
                "image": "https://images.unsplash.com/photo-1585830812416-a6c86bb14576?auto=format&fit=crop&w=600&q=80",
                "violations": [
                    {
                        "rule": "LM-PC-R6-1E",
                        "type": "MISSING_MRP",
                        "desc": "MRP declaration omitted or completely illegible on label.",
                        "sev": "CRITICAL",
                        "action": "Print MRP inclusive of all taxes clearly."
                    },
                    {
                        "rule": "LM-PC-R6-1F",
                        "type": "MISSING_CONSUMER_CARE_DETAILS",
                        "desc": "Consumer care helpline missing.",
                        "sev": "CRITICAL",
                        "action": "Include customer complaint cell details."
                    },
                    {
                        "rule": "LM-PC-R6-1D",
                        "type": "MISSING_MANUFACTURING_DATE",
                        "desc": "Month and year of packing absent.",
                        "sev": "MAJOR",
                        "action": "Add Mfg/Pkg date stamp."
                    }
                ]
            },
            {
                "product_name": "Mountain Spring Mineral Water 1L",
                "brand": "Mountain Spring",
                "category": "Beverage",
                "manufacturer": "Himalayan Waters India Ltd, Solan, HP",
                "mrp": "₹20.00",
                "net_qty": "1 L",
                "mfg_date": "08/2026",
                "score": 100.0,
                "risk": "LOW",
                "status": "VERIFIED",
                "image": "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80",
                "violations": []
            },
            {
                "product_name": "ActiveMax Energy Drink 250ml",
                "brand": "ActiveMax",
                "category": "Beverage",
                "manufacturer": "Active Beverage Corp, Bengaluru, KA",
                "mrp": "₹125.00",
                "net_qty": "250 ml",
                "mfg_date": "07/2026",
                "score": 90.0,
                "risk": "LOW",
                "status": "VERIFIED",
                "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80",
                "violations": []
            },
            {
                "product_name": "SilkSoft Luxury Bathing Bar 125g",
                "brand": "SilkSoft",
                "category": "Personal Care",
                "manufacturer": "Luxuria Personal Care Pvt Ltd, Baddi, HP",
                "mrp": "₹65.00",
                "net_qty": "125 g",
                "mfg_date": "04/2026",
                "score": 75.0,
                "risk": "MEDIUM",
                "status": "COMPLETED",
                "image": "https://images.unsplash.com/photo-1607006482170-e67c87c71d60?auto=format&fit=crop&w=600&q=80",
                "violations": [
                    {
                        "rule": "LM-PC-R6-1G",
                        "type": "MISSING_COUNTRY_OF_ORIGIN",
                        "desc": "Country of origin declaration absent on imported soap bar.",
                        "sev": "MAJOR",
                        "action": "Print Country of Origin on label."
                    }
                ]
            },
            {
                "product_name": "SmartPro Electric Kettle 1.5L",
                "brand": "SmartPro Home",
                "category": "Electrical / Consumer Goods",
                "manufacturer": "SmartPro Appliances, Electronic City, Bengaluru",
                "mrp": "₹1,499.00",
                "net_qty": "1 N",
                "mfg_date": "06/2026",
                "score": 100.0,
                "risk": "LOW",
                "status": "VERIFIED",
                "image": "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f6?auto=format&fit=crop&w=600&q=80",
                "violations": []
            },
            {
                "product_name": "CrispyBite Chocolate Cookies 200g",
                "brand": "CrispyBite",
                "category": "Food",
                "manufacturer": "Crispy Bakers Pvt Ltd, Hyderabad, Telangana",
                "mrp": "₹80.00",
                "net_qty": "200 g",
                "mfg_date": "08/2026",
                "score": 85.0,
                "risk": "MEDIUM",
                "status": "COMPLETED",
                "image": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80",
                "violations": [
                    {
                        "rule": "LM-PC-R6-1H",
                        "type": "MISSING_UNIT_SALE_PRICE",
                        "desc": "Unit sale price not stated.",
                        "sev": "MINOR",
                        "action": "Add Unit Sale Price ₹0.40/g."
                    }
                ]
            },
            {
                "product_name": "VelvetMatte Liquid Lipstick 5ml",
                "brand": "Velvet Beauty",
                "category": "Cosmetics",
                "manufacturer": "CosmoLab India, Gurgaon, HR",
                "mrp": "₹450.00",
                "net_qty": "5 ml",
                "mfg_date": "03/2026",
                "score": 60.0,
                "risk": "HIGH",
                "status": "NEEDS_REVIEW",
                "image": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80",
                "violations": [
                    {
                        "rule": "LM-PC-R6-1F",
                        "type": "MISSING_CONSUMER_CARE_DETAILS",
                        "desc": "No customer care email or helpline number provided on outer packaging.",
                        "sev": "CRITICAL",
                        "action": "Update outer retail carton with consumer care details."
                    }
                ]
            }
        ]

        for p_data in demo_products_data:
            p = Product(
                id=str(uuid.uuid4()),
                product_name=p_data["product_name"],
                brand=p_data["brand"],
                category=p_data["category"],
                manufacturer=p_data["manufacturer"],
                country_of_origin="India"
            )
            db.add(p)
            db.commit()

            p_img = ProductImage(
                id=str(uuid.uuid4()),
                product_id=p.id,
                image_url=p_data["image"],
                image_type="FRONT",
                image_quality_score=0.90
            )
            db.add(p_img)
            db.commit()

            insp = Inspection(
                id=str(uuid.uuid4()),
                inspector_id=inspector_user.id,
                product_id=p.id,
                inspection_status=p_data["status"],
                compliance_score=p_data["score"],
                risk_level=p_data["risk"],
                latitude=28.6139,
                longitude=77.2090,
                location_name="Connaught Place, New Delhi",
                inspector_notes=f"Inspection performed for {p_data['product_name']} under Legal Metrology Rule 6."
            )
            db.add(insp)
            db.commit()

            # Extracted fields
            field_items = [
                ("Product Name", p_data["product_name"], 0.95),
                ("Brand", p_data["brand"], 0.94),
                ("MRP", p_data["mrp"], 0.92),
                ("Net Quantity", p_data["net_qty"], 0.91),
                ("Manufacturing Date", p_data["mfg_date"], 0.89),
                ("Manufacturer Details", p_data["manufacturer"], 0.88),
                ("Country of Origin", "India", 0.95),
                ("Consumer Care Details", "1800-11-2233 | care@brand.com", 0.90)
            ]
            for fname, fval, fconf in field_items:
                ef = ExtractedField(
                    id=str(uuid.uuid4()),
                    inspection_id=insp.id,
                    field_name=fname,
                    field_value=fval,
                    confidence_score=fconf,
                    source_image=p_data["image"],
                    bounding_box={"x": 50, "y": 100, "width": 200, "height": 40},
                    verification_status="AI_DETECTED"
                )
                db.add(ef)

            # Violations
            for v_info in p_data["violations"]:
                v_obj = Violation(
                    id=str(uuid.uuid4()),
                    inspection_id=insp.id,
                    rule_id=rule_map.get(v_info["rule"]),
                    violation_type=v_info["type"],
                    description=v_info["desc"],
                    severity=v_info["sev"],
                    evidence_image=p_data["image"],
                    evidence_text=f"Extracted field violation for rule {v_info['rule']}",
                    corrective_action=v_info["action"]
                )
                db.add(v_obj)

        db.commit()

        # 4. Complaints Seed
        complaint1 = Complaint(
            id=str(uuid.uuid4()),
            consumer_id=consumer_user.id,
            product_name="PureGlow Herbal Face Wash",
            brand_name="PureGlow Organic",
            complaint_type="MISSING_DECLARATION",
            description="Customer care email and phone number are completely missing from the bottle.",
            location="Vasant Kunj, New Delhi",
            status="UNDER_REVIEW"
        )
        complaint2 = Complaint(
            id=str(uuid.uuid4()),
            consumer_id=consumer_user.id,
            product_name="Local Retailer Packaged Sugar 1kg",
            brand_name="SuperMart Choice",
            complaint_type="OVERCHARGING_MRP",
            description="Store charged ₹60 against MRP declaration of ₹48 stamped on the packet.",
            location="Karol Bagh, New Delhi",
            status="SUBMITTED"
        )
        db.add_all([complaint1, complaint2])
        db.commit()

        print("CivicFlow database successfully seeded with realistic Legal Metrology inspection data.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

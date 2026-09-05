import re
from typing import Dict, Any, List

class AIExtractor:
    def __init__(self):
        # Product Category Classification rules based on keywords
        self.category_keywords = {
            "Food": ["flour", "atta", "rice", "biscuit", "snack", "oil", "ghee", "spice", "dal", "paneer", "noodle", "cereal", "oats", "chocolate", "sugar", "salt"],
            "Beverage": ["juice", "soda", "drink", "water", "tea", "coffee", "milk", "syrup", "beverage", "energy drink", "cola"],
            "Cosmetics": ["shampoo", "cream", "lotion", "lipstick", "serum", "face wash", "makeup", "perfume", "sunscreen", "moisturizer"],
            "Personal Care": ["soap", "toothpaste", "toothbrush", "deodorant", "sanitizer", "hair oil", "body wash", "razor", "tissue"],
            "Household Products": ["detergent", "cleaner", "dishwash", "disinfectant", "insecticide", "battery", "bulb", "air freshener"],
            "Electrical / Consumer Goods": ["kettle", "iron", "trimmer", "charger", "cable", "lamp", "plug", "adaptor", "fan", "heater"],
            "Textiles": ["shirt", "towel", "bedsheet", "cotton", "garment", "fabric", "socks", "apparel"],
            "Stationery": ["pen", "notebook", "paper", "marker", "pencil", "stapler", "folder", "binder"]
        }

    def detect_category(self, text: str, hint_name: str = "") -> str:
        combined = (text + " " + hint_name).lower()
        for cat, keywords in self.category_keywords.items():
            for kw in keywords:
                if re.search(r'\b' + re.escape(kw) + r'\b', combined):
                    return cat
        return "Food"  # Default sensible legal category fallback

    def extract_structured_fields(self, ocr_text: str, category_hint: str = "") -> List[Dict[str, Any]]:
        """
        Parses raw text and extracts standardized declarations with bounding boxes, confidence, and status.
        """
        fields = []
        text_lines = [line.strip() for line in ocr_text.split('\n') if line.strip()]

        def add_field(name: str, val: str | None, conf: float, bbox: dict | None = None):
            status = "AI_DETECTED" if val and val != "NOT_FOUND" else "NOT_FOUND"
            fields.append({
                "field_name": name,
                "field_value": val if val else "NOT_FOUND",
                "confidence_score": conf if val else 0.0,
                "source_image": "FRONT_LABEL",
                "bounding_box": bbox or {"x": 10, "y": 20, "width": 80, "height": 30},
                "verification_status": status
            })

        # 1. MRP Extraction (Matches MRP, M.R.P., Max Retail Price, Rs, ₹)
        mrp_match = re.search(r'(?:MRP|M\.R\.P\.|Maximum\s+Retail\s+Price|Price|Rs\.?|₹)\s*[:=]?\s*([₹Rs\.\s]*\d+(?:\.\d{1,2})?)', ocr_text, re.IGNORECASE)
        if mrp_match:
            raw_val = mrp_match.group(1).strip()
            # Clean currency symbols
            clean_mrp = re.sub(r'[^0-9\.]', '', raw_val)
            if clean_mrp:
                add_field("MRP", f"₹{clean_mrp}", 0.94, {"x": 45, "y": 120, "width": 140, "height": 35})
            else:
                add_field("MRP", None, 0.0)
        else:
            add_field("MRP", None, 0.0)

        # 2. Net Quantity Extraction (Net Qty, Net Wt, Net Weight, Volume)
        net_qty_match = re.search(r'(?:Net\s*(?:Qty|Quantity|Wt|Weight|Vol|Volume)?)\s*[:=]?\s*(\d+(?:\.\d+)?\s*(?:g|kg|ml|L|ltr|litres|gm|grams|kgm|pcs|N)\b)', ocr_text, re.IGNORECASE)
        if net_qty_match:
            add_field("Net Quantity", net_qty_match.group(1).strip(), 0.92, {"x": 45, "y": 160, "width": 130, "height": 30})
        else:
            add_field("Net Quantity", None, 0.0)

        # 3. Unit Sale Price
        usp_match = re.search(r'(?:Unit\s*Sale\s*Price|USP)\s*[:=]?\s*([₹Rs\.\s]*\d+(?:\.\d+)?\s*(?:per|\/)\s*(?:g|kg|ml|L|piece|unit|N))', ocr_text, re.IGNORECASE)
        if usp_match:
            add_field("Unit Sale Price", usp_match.group(1).strip(), 0.88, {"x": 45, "y": 195, "width": 150, "height": 30})
        else:
            add_field("Unit Sale Price", None, 0.0)

        # 4. Manufacturing / Packing Date
        mfg_match = re.search(r'(?:Mfg|Mfg\.\s*Date|Manufactured|Pkg|Packed)\s*[:=]?\s*([A-Za-z0-9\/\-\.]+)', ocr_text, re.IGNORECASE)
        if mfg_match and len(mfg_match.group(1)) > 2:
            add_field("Manufacturing Date", mfg_match.group(1).strip(), 0.91, {"x": 200, "y": 120, "width": 120, "height": 30})
        else:
            add_field("Manufacturing Date", None, 0.0)

        # 5. Expiry Date / Best Before
        exp_match = re.search(r'(?:Exp|Expiry|Best\s*Before|Use\s*By)\s*[:=]?\s*([^\n,]+)', ocr_text, re.IGNORECASE)
        if exp_match:
            add_field("Best Before / Expiry", exp_match.group(1).strip(), 0.89, {"x": 200, "y": 160, "width": 160, "height": 30})
        else:
            add_field("Best Before / Expiry", None, 0.0)

        # 6. Manufacturer Name & Address
        mfr_match = re.search(r'(?:Mfd\s*By|Manufactured\s*By|Mfr)\s*[:=]?\s*([^\n,]+(?:,[^\n,]+){0,2})', ocr_text, re.IGNORECASE)
        if mfr_match:
            add_field("Manufacturer Details", mfr_match.group(1).strip(), 0.87, {"x": 45, "y": 240, "width": 300, "height": 45})
        else:
            add_field("Manufacturer Details", None, 0.0)

        # 7. Packer / Importer Details
        packer_match = re.search(r'(?:Packed\s*By|Packer|Imported\s*By|Importer)\s*[:=]?\s*([^\n,]+(?:,[^\n,]+){0,2})', ocr_text, re.IGNORECASE)
        if packer_match:
            add_field("Packer / Importer Details", packer_match.group(1).strip(), 0.85, {"x": 45, "y": 290, "width": 300, "height": 45})
        else:
            add_field("Packer / Importer Details", None, 0.0)

        # 8. Country of Origin
        country_match = re.search(r'(?:Country\s*of\s*Origin|Made\s*in|Product\s*of)\s*[:=]?\s*([A-Za-z\s]+)', ocr_text, re.IGNORECASE)
        if country_match:
            add_field("Country of Origin", country_match.group(1).strip(), 0.95, {"x": 45, "y": 340, "width": 160, "height": 30})
        else:
            add_field("Country of Origin", None, 0.0)

        # 9. Generic / Common Name
        generic_match = re.search(r'(?:Generic\s*Name|Common\s*Name|Product\s*Name)\s*[:=]?\s*([^\n,]+)', ocr_text, re.IGNORECASE)
        if generic_match:
            add_field("Generic / Common Name", generic_match.group(1).strip(), 0.90, {"x": 45, "y": 80, "width": 220, "height": 35})
        else:
            add_field("Generic / Common Name", None, 0.0)

        # 10. Consumer Care Phone & Email
        phone_match = re.search(r'(?:Phone|Tel|Contact|Helpline|Customer\s*Care)\s*[:=]?\s*([\+\d\-\s]{8,15})', ocr_text, re.IGNORECASE)
        email_match = re.search(r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', ocr_text)

        care_details = []
        if phone_match:
            care_details.append(f"Phone: {phone_match.group(1).strip()}")
        if email_match:
            care_details.append(f"Email: {email_match.group(1).strip()}")

        if care_details:
            add_field("Consumer Care Details", " | ".join(care_details), 0.93, {"x": 45, "y": 380, "width": 320, "height": 40})
        else:
            add_field("Consumer Care Details", None, 0.0)

        # 11. Barcode
        barcode_match = re.search(r'(?:Barcode|EAN|UPC)\s*[:=]?\s*(\d{8,14})', ocr_text, re.IGNORECASE)
        if barcode_match:
            add_field("Barcode", barcode_match.group(1).strip(), 0.96, {"x": 250, "y": 340, "width": 120, "height": 30})
        else:
            add_field("Barcode", None, 0.0)

        return fields

ai_extractor = AIExtractor()

import sys
import os
import pytest
from fastapi.testclient import TestClient

# Ensure backend root is in import path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_auth_flow():
    # Registration
    reg_payload = {
        "name": "Test Inspector",
        "email": "test_inspector@civicflow.gov.in",
        "password": "securepassword123",
        "role": "INSPECTOR",
        "phone": "+91 99999 88888"
    }
    res_reg = client.post("/api/auth/register", json=reg_payload)
    if res_reg.status_code == 400:  # Already registered
        pass
    else:
        assert res_reg.status_code == 200
        assert "access_token" in res_reg.json()

    # Login
    login_payload = {
        "email": "test_inspector@civicflow.gov.in",
        "password": "securepassword123"
    }
    res_login = client.post("/api/auth/login", json=login_payload)
    assert res_login.status_code == 200
    token = res_login.json()["access_token"]
    assert token is not None

    # Get Me
    headers = {"Authorization": f"Bearer {token}"}
    res_me = client.get("/api/auth/me", headers=headers)
    assert res_me.status_code == 200
    assert res_me.json()["email"] == "test_inspector@civicflow.gov.in"

def test_product_crud():
    prod_payload = {
        "product_name": "Test Packaged Atta 5kg",
        "brand": "TestBrand",
        "category": "Food",
        "manufacturer": "Test Manufacturer Pvt Ltd",
        "packer": "Test Packer",
        "country_of_origin": "India",
        "net_quantity": "5 kg",
        "mrp": "₹250.00"
    }
    create_res = client.post("/api/products", json=prod_payload)
    assert create_res.status_code == 200
    prod_id = create_res.json()["id"]

    # Get Product
    get_res = client.get(f"/api/products/{prod_id}")
    assert get_res.status_code == 200
    assert get_res.json()["product_name"] == "Test Packaged Atta 5kg"

    # Update Product
    update_res = client.put(f"/api/products/{prod_id}", json={"brand": "UpdatedTestBrand"})
    assert update_res.status_code == 200
    assert update_res.json()["brand"] == "UpdatedTestBrand"

    # List Products
    list_res = client.get("/api/products")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

def test_inspection_full_flow():
    # 1. Create Inspection
    insp_payload = {
        "product_name": "Organic Honey 500g",
        "category": "Food",
        "brand": "NatureBest",
        "location_name": "New Delhi Central",
        "inspector_notes": "Automated workflow test inspection."
    }
    res_insp = client.post("/api/inspections", json=insp_payload)
    assert res_insp.status_code == 200
    insp_data = res_insp.json()
    insp_id = insp_data["id"]

    # 2. Image Upload
    res_img = client.post(f"/api/inspections/{insp_id}/images", params={"image_type": "FRONT"})
    assert res_img.status_code == 200
    assert "image" in res_img.json()

    # 3. OCR Endpoint
    res_ocr = client.post(f"/api/ocr/{insp_id}")
    assert res_ocr.status_code == 200
    assert "raw_ocr_text" in res_ocr.json()

    # 4. Structured Extraction
    res_ext = client.post(f"/api/extraction/{insp_id}")
    assert res_ext.status_code == 200
    assert "declarations" in res_ext.json()

    # 5. Compliance Engine
    res_comp = client.post(f"/api/compliance/{insp_id}")
    assert res_comp.status_code == 200
    assert "compliance_score" in res_comp.json()
    assert "risk_level" in res_comp.json()

    # 6. PDF Report Generation
    res_pdf = client.get(f"/api/reports/{insp_id}/pdf")
    assert res_pdf.status_code == 200
    assert res_pdf.headers["content-type"] == "application/pdf"
    assert len(res_pdf.content) > 100

def test_analytics_endpoints():
    res_dash = client.get("/api/analytics/dashboard")
    assert res_dash.status_code == 200

    res_overview = client.get("/api/analytics/overview")
    assert res_overview.status_code == 200
    assert "total_inspections" in res_overview.json()

    res_viols = client.get("/api/analytics/violations")
    assert res_viols.status_code == 200

    res_trends = client.get("/api/analytics/trends")
    assert res_trends.status_code == 200

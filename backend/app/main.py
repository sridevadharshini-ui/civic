from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.api import auth, products, scan, inspections, ocr, extraction, compliance, reports, complaints, analytics, rules, users
try:
    from seed_data import seed_database
except ImportError:
    from app.seed_data import seed_database

# Initialize DB tables
Base.metadata.create_all(bind=engine)

# Automatically seed realistic demo data on startup if database is fresh
try:
    seed_database()
except Exception as e:
    print(f"Database seeding note: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Based Packaged Commodity Compliance & Inspection Support Platform for Legal Metrology",
    version="1.0.0",
    openapi_url="/api/openapi.json"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(products.router, prefix=settings.API_V1_STR)
app.include_router(scan.router, prefix=settings.API_V1_STR)
app.include_router(inspections.router, prefix=settings.API_V1_STR)
app.include_router(ocr.router, prefix=settings.API_V1_STR)
app.include_router(extraction.router, prefix=settings.API_V1_STR)
app.include_router(compliance.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(complaints.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(rules.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "project": "CIVICFLOW",
        "hackathon": settings.HACKATHON_NAME,
        "status": "active",
        "legal_notice": "CivicFlow is an AI-powered inspection support tool. Final legal determination belongs to statutory legal metrology authorities.",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "system": "CIVICFLOW"}

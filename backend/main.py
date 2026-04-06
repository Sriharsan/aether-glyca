"""
AETHER-Glyca Backend — FastAPI Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api.routes import auth, patients, glucose, diet, agents, clinician, food

# Create all DB tables on startup (SQLite works zero-config)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AETHER-Glyca API",
    description="Autonomous Population Health & Metabolic Orchestration for Diabetes",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,      prefix="/api/auth",      tags=["auth"])
app.include_router(patients.router,  prefix="/api/patients",  tags=["patients"])
app.include_router(glucose.router,   prefix="/api/glucose",   tags=["glucose"])
app.include_router(diet.router,      prefix="/api/diet",      tags=["diet"])
app.include_router(agents.router,    prefix="/api/agents",    tags=["agents"])
app.include_router(clinician.router, prefix="/api/clinician", tags=["clinician"])
app.include_router(food.router,      prefix="/api/food",      tags=["food"])

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "AETHER-Glyca API", "version": "1.0.0"}

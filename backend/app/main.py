"""
AETHER-Glyca Backend
FastAPI application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from app.api.routes import patients, clinician, agents, auth
from app.models.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize DB and seed data on startup."""
    init_db()
    yield


app = FastAPI(
    title="AETHER-Glyca API",
    description="Autonomous Population Health & Metabolic Orchestration Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:5174").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router,      prefix="/api/auth",      tags=["auth"])
app.include_router(patients.router,  prefix="/api/patients",  tags=["patients"])
app.include_router(clinician.router, prefix="/api/clinician", tags=["clinician"])
app.include_router(agents.router,    prefix="/api/agents",    tags=["agents"])


@app.get("/")
async def root():
    return {
        "name": "AETHER-Glyca",
        "version": "1.0.0",
        "status": "operational",
        "team": "AI Architect",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}

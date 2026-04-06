"""Database setup — SQLite dev, PostgreSQL prod."""
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, JSON, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./aether.db")

# SQLite connection fix
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer)
    gender = Column(String)
    diabetes_type = Column(String, default="Type 2")
    hba1c = Column(Float)
    risk_level = Column(String, default="moderate")  # low / moderate / high / critical
    tir_percentage = Column(Float, default=60.0)
    region = Column(String, default="Tamil Nadu")
    created_at = Column(DateTime, default=datetime.utcnow)
    glucose_readings = relationship("GlucoseReading", back_populates="patient")
    meals = relationship("MealLog", back_populates="patient")


class GlucoseReading(Base):
    __tablename__ = "glucose_readings"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    value = Column(Float, nullable=False)          # mg/dL
    timestamp = Column(DateTime, default=datetime.utcnow)
    source = Column(String, default="CGM")
    patient = relationship("Patient", back_populates="glucose_readings")


class MealLog(Base):
    __tablename__ = "meal_logs"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    food_name = Column(String)
    portion_grams = Column(Float)
    gi_score = Column(Float)
    predicted_spike = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)
    patient = relationship("Patient", back_populates="meals")


class ClinicalAlert(Base):
    __tablename__ = "clinical_alerts"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    alert_type = Column(String)   # hypoglycemia / hyperglycemia / trend
    severity = Column(String)     # low / medium / high / critical
    message = Column(String)
    icd10_code = Column(String)
    resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class AgentLog(Base):
    __tablename__ = "agent_logs"
    id = Column(Integer, primary_key=True, index=True)
    agent_name = Column(String)
    action = Column(String)
    patient_id = Column(Integer, nullable=True)
    reasoning = Column(String)
    result = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
    _seed_demo_data()


def _seed_demo_data():
    """Seed realistic Tamil Nadu patient data for demo (optional — skipped if seed module absent)."""
    try:
        from app.data.seed import seed_patients
    except ModuleNotFoundError:
        return  # seed already applied via scripts/seed_data.py
    db = SessionLocal()
    try:
        if db.query(Patient).count() == 0:
            seed_patients(db)
    finally:
        db.close()

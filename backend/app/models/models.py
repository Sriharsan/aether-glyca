from sqlalchemy import Column, String, Float, DateTime, Integer, ForeignKey, Boolean, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base

def gen_id():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=gen_id)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(String, default="patient")  # patient | clinician | admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    patient = relationship("Patient", back_populates="user", uselist=False)

class Patient(Base):
    __tablename__ = "patients"
    id = Column(String, primary_key=True, default=gen_id)
    user_id = Column(String, ForeignKey("users.id"))
    age = Column(Integer)
    gender = Column(String)
    diabetes_type = Column(String)  # type1 | type2 | prediabetes
    diagnosis_year = Column(Integer)
    region = Column(String, default="Tamil Nadu")
    hba1c = Column(Float)
    target_tir = Column(Float, default=70.0)
    risk_score = Column(Float, default=0.0)
    risk_level = Column(String, default="low")  # low | medium | high | critical
    metabolic_twin_trained = Column(Boolean, default=False)
    user = relationship("User", back_populates="patient")
    glucose_readings = relationship("GlucoseReading", back_populates="patient")
    diet_logs = relationship("DietLog", back_populates="patient")

class GlucoseReading(Base):
    __tablename__ = "glucose_readings"
    id = Column(String, primary_key=True, default=gen_id)
    patient_id = Column(String, ForeignKey("patients.id"))
    value = Column(Float, nullable=False)  # mg/dL
    timestamp = Column(DateTime, default=datetime.utcnow)
    context = Column(String)  # fasting | post_meal | bedtime | random
    source = Column(String, default="manual")  # cgm | manual | fhir
    patient = relationship("Patient", back_populates="glucose_readings")

class DietLog(Base):
    __tablename__ = "diet_logs"
    id = Column(String, primary_key=True, default=gen_id)
    patient_id = Column(String, ForeignKey("patients.id"))
    food_name = Column(String, nullable=False)
    portion_grams = Column(Float)
    glycemic_index = Column(Float)
    estimated_glucose_impact = Column(Float)
    meal_type = Column(String)  # breakfast | lunch | dinner | snack
    logged_at = Column(DateTime, default=datetime.utcnow)
    patient = relationship("Patient", back_populates="diet_logs")

class ClinicalSummary(Base):
    __tablename__ = "clinical_summaries"
    id = Column(String, primary_key=True, default=gen_id)
    patient_id = Column(String, ForeignKey("patients.id"))
    icd10_codes = Column(JSON)
    summary_text = Column(Text)
    recommendations = Column(JSON)
    generated_at = Column(DateTime, default=datetime.utcnow)
    reviewed_by = Column(String)

class AgentLog(Base):
    __tablename__ = "agent_logs"
    id = Column(String, primary_key=True, default=gen_id)
    agent_name = Column(String)
    action = Column(String)
    patient_id = Column(String, nullable=True)
    result = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

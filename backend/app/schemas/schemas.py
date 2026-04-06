from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# ── Auth ──────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "patient"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
    full_name: str

# ── Patient ───────────────────────────────────────────────────────────
class PatientCreate(BaseModel):
    age: int
    gender: str
    diabetes_type: str
    diagnosis_year: int
    region: str = "Tamil Nadu"
    hba1c: Optional[float] = None

class PatientOut(BaseModel):
    id: str
    age: int
    gender: str
    diabetes_type: str
    hba1c: Optional[float]
    risk_score: float
    risk_level: str
    metabolic_twin_trained: bool
    class Config:
        from_attributes = True

# ── Glucose ───────────────────────────────────────────────────────────
class GlucoseIn(BaseModel):
    value: float
    context: str = "random"
    source: str = "manual"
    timestamp: Optional[datetime] = None

class GlucoseOut(BaseModel):
    id: str
    value: float
    timestamp: datetime
    context: str
    source: str
    class Config:
        from_attributes = True

# ── Diet ──────────────────────────────────────────────────────────────
class DietLogIn(BaseModel):
    food_name: str
    portion_grams: float
    meal_type: str

class DietLogOut(BaseModel):
    id: str
    food_name: str
    portion_grams: float
    glycemic_index: Optional[float]
    estimated_glucose_impact: Optional[float]
    meal_type: str
    logged_at: datetime
    class Config:
        from_attributes = True

# ── Clinical Summary ──────────────────────────────────────────────────
class SummaryOut(BaseModel):
    id: str
    icd10_codes: List[str]
    summary_text: str
    recommendations: List[str]
    generated_at: datetime
    class Config:
        from_attributes = True

# ── Agent ─────────────────────────────────────────────────────────────
class AgentRunRequest(BaseModel):
    patient_id: Optional[str] = None
    task: str = "triage"

class AgentRunResponse(BaseModel):
    agent: str
    result: str
    timestamp: datetime

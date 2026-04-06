from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Patient, User, GlucoseReading
from app.schemas.schemas import PatientCreate, PatientOut

router = APIRouter()

@router.post("/", response_model=PatientOut)
def create_patient(user_id: str, payload: PatientCreate, db: Session = Depends(get_db)):
    patient = Patient(user_id=user_id, **payload.model_dump())
    db.add(patient); db.commit(); db.refresh(patient)
    return patient

@router.get("/{patient_id}", response_model=PatientOut)
def get_patient(patient_id: str, db: Session = Depends(get_db)):
    p = db.query(Patient).filter(Patient.id == patient_id).first()
    if not p: raise HTTPException(404, "Patient not found")
    return p

@router.get("/", response_model=List[PatientOut])
def list_patients(db: Session = Depends(get_db)):
    return db.query(Patient).all()

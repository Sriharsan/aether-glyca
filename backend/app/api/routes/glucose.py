from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.models.models import GlucoseReading, Patient
from app.schemas.schemas import GlucoseIn, GlucoseOut
from app.services.metabolic_twin import calculate_risk_score

router = APIRouter()

@router.post("/{patient_id}", response_model=GlucoseOut)
def add_reading(patient_id: str, payload: GlucoseIn, db: Session = Depends(get_db)):
    reading = GlucoseReading(
        patient_id=patient_id,
        value=payload.value,
        context=payload.context,
        source=payload.source,
        timestamp=payload.timestamp or datetime.utcnow(),
    )
    db.add(reading); db.commit(); db.refresh(reading)

    # Update patient risk score
    all_readings = db.query(GlucoseReading).filter(GlucoseReading.patient_id == patient_id).all()
    values = [r.value for r in all_readings]
    risk = calculate_risk_score(values)
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if patient:
        patient.risk_score = risk["risk_score"]
        patient.risk_level = risk["risk_level"]
        db.commit()

    return reading

@router.get("/{patient_id}", response_model=List[GlucoseOut])
def get_readings(patient_id: str, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(GlucoseReading)\
             .filter(GlucoseReading.patient_id == patient_id)\
             .order_by(GlucoseReading.timestamp.desc())\
             .limit(limit).all()

@router.get("/{patient_id}/stats")
def get_stats(patient_id: str, db: Session = Depends(get_db)):
    readings = db.query(GlucoseReading).filter(GlucoseReading.patient_id == patient_id).all()
    values = [r.value for r in readings]
    return calculate_risk_score(values)

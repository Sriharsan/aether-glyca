from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Patient, GlucoseReading

router = APIRouter()

@router.get("/population-overview")
def population_overview(db: Session = Depends(get_db)):
    patients = db.query(Patient).all()
    total = len(patients)
    risk_dist = {"low": 0, "medium": 0, "high": 0, "critical": 0}
    for p in patients:
        level = p.risk_level or "low"
        if level in risk_dist:
            risk_dist[level] += 1

    critical = db.query(Patient).filter(Patient.risk_level == "critical").all()
    critical_data = [{"id": p.id, "age": p.age, "risk_score": p.risk_score,
                      "diabetes_type": p.diabetes_type} for p in critical]

    return {
        "total_patients": total,
        "risk_distribution": risk_dist,
        "critical_patients": critical_data,
        "avg_risk_score": sum(p.risk_score for p in patients) / total if total else 0,
    }

@router.get("/patient/{patient_id}/timeline")
def patient_timeline(patient_id: str, db: Session = Depends(get_db)):
    readings = db.query(GlucoseReading)\
                 .filter(GlucoseReading.patient_id == patient_id)\
                 .order_by(GlucoseReading.timestamp.asc()).all()
    return [{"t": r.timestamp.isoformat(), "v": r.value, "ctx": r.context} for r in readings]

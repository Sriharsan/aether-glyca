from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.models.models import Patient, GlucoseReading, DietLog, AgentLog
from app.agents.clinical_agent import run_triage_agent, generate_clinical_summary, run_diet_advisor_agent
from app.schemas.schemas import AgentRunRequest

router = APIRouter()

@router.post("/triage")
def run_triage(db: Session = Depends(get_db)):
    """Run population-level triage agent across all patients."""
    patients = db.query(Patient).all()
    patients_data = []
    for p in patients:
        readings = db.query(GlucoseReading).filter(GlucoseReading.patient_id == p.id)\
                     .order_by(GlucoseReading.timestamp.desc()).limit(30).all()
        patients_data.append({
            "patient_id": p.id,
            "age": p.age,
            "diabetes_type": p.diabetes_type,
            "risk_score": p.risk_score,
            "risk_level": p.risk_level,
            "recent_glucose": [r.value for r in readings],
        })

    result = run_triage_agent(patients_data)

    log = AgentLog(agent_name="triage_agent", action="population_triage",
                   result=str(result), timestamp=datetime.utcnow())
    db.add(log); db.commit()
    return result

@router.post("/summary/{patient_id}")
def patient_summary(patient_id: str, db: Session = Depends(get_db)):
    """Generate ICD-10 clinical summary for a patient."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    readings = db.query(GlucoseReading).filter(GlucoseReading.patient_id == patient_id)\
                 .order_by(GlucoseReading.timestamp.desc()).limit(60).all()
    diets = db.query(DietLog).filter(DietLog.patient_id == patient_id)\
               .order_by(DietLog.logged_at.desc()).limit(20).all()

    patient_dict = {"age": patient.age, "diabetes_type": patient.diabetes_type,
                    "risk_level": patient.risk_level, "hba1c": patient.hba1c} if patient else {}
    glucose_list = [r.value for r in readings]
    diet_list = [{"food": d.food_name, "gi": d.glycemic_index} for d in diets]

    return generate_clinical_summary(patient_dict, glucose_list, diet_list)

@router.post("/diet-advice/{patient_id}")
def diet_advice(patient_id: str, question: str, db: Session = Depends(get_db)):
    """Ask the diet advisor agent a question."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    readings = db.query(GlucoseReading).filter(GlucoseReading.patient_id == patient_id)\
                 .order_by(GlucoseReading.timestamp.desc()).limit(10).all()
    patient_dict = {"age": patient.age if patient else 45,
                    "diabetes_type": patient.diabetes_type if patient else "type2",
                    "risk_level": patient.risk_level if patient else "medium"}
    return run_diet_advisor_agent(patient_dict, question, [r.value for r in readings])

@router.get("/logs")
def get_agent_logs(limit: int = 50, db: Session = Depends(get_db)):
    return db.query(AgentLog).order_by(AgentLog.timestamp.desc()).limit(limit).all()

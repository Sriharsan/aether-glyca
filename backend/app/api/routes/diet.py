from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import DietLog
from app.schemas.schemas import DietLogIn, DietLogOut
from app.services.diet_service import calculate_glucose_impact, TAMIL_FOOD_DB

router = APIRouter()

@router.post("/{patient_id}", response_model=DietLogOut)
def log_food(patient_id: str, payload: DietLogIn, db: Session = Depends(get_db)):
    impact = calculate_glucose_impact(payload.food_name, payload.portion_grams)
    log = DietLog(
        patient_id=patient_id,
        food_name=payload.food_name,
        portion_grams=payload.portion_grams,
        glycemic_index=impact.get("gi"),
        estimated_glucose_impact=impact.get("estimated_rise_mgdl"),
        meal_type=payload.meal_type,
    )
    db.add(log); db.commit(); db.refresh(log)
    return log

@router.get("/{patient_id}", response_model=List[DietLogOut])
def get_logs(patient_id: str, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(DietLog)\
             .filter(DietLog.patient_id == patient_id)\
             .order_by(DietLog.logged_at.desc())\
             .limit(limit).all()

@router.get("/foods/search")
def search_foods(q: str = ""):
    """Search the Tamil Nadu food database."""
    q = q.lower()
    results = [
        {"name": name, **info}
        for name, info in TAMIL_FOOD_DB.items()
        if q in name
    ]
    return results[:20]

@router.get("/foods/all")
def all_foods():
    return [{"name": k, **v} for k, v in TAMIL_FOOD_DB.items()]

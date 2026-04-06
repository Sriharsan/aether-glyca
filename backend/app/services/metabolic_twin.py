"""
Metabolic Digital Twin — personalized XGBoost model per patient.
Learns individual glycemic response from historical glucose + diet data.
"""
import numpy as np
from typing import List, Dict, Optional
from datetime import datetime

# In production: models stored in DB/S3 per patient_id
# For demo: in-memory dict
_patient_models: Dict[str, dict] = {}

def _feature_vector(gi: float, gl: float, hour: int,
                    prev_glucose: float, age: int) -> List[float]:
    """5-feature input for the metabolic twin."""
    return [gi, gl, hour, prev_glucose, age]

def train_metabolic_twin(patient_id: str, readings: List[dict], age: int) -> dict:
    """
    Train a lightweight XGBoost regressor on patient's own data.
    readings: list of {gi, gl, hour, prev_glucose, actual_rise}
    """
    if len(readings) < 10:
        return {"trained": False, "reason": "Need at least 10 readings for training"}

    try:
        from xgboost import XGBRegressor
        X = [[r["gi"], r["gl"], r["hour"], r["prev_glucose"], age] for r in readings]
        y = [r["actual_rise"] for r in readings]

        model = XGBRegressor(n_estimators=100, max_depth=4, learning_rate=0.1)
        model.fit(np.array(X), np.array(y))

        _patient_models[patient_id] = {
            "model": model,
            "trained_at": datetime.utcnow().isoformat(),
            "samples": len(readings),
        }
        return {"trained": True, "samples": len(readings)}
    except Exception as e:
        return {"trained": False, "reason": str(e)}

def predict_glucose_rise(patient_id: str, gi: float, gl: float,
                          hour: int, prev_glucose: float, age: int) -> dict:
    """
    Predict post-prandial glucose rise for THIS patient.
    Falls back to population model if twin not trained.
    """
    if patient_id in _patient_models:
        model = _patient_models[patient_id]["model"]
        X = np.array([[gi, gl, hour, prev_glucose, age]])
        rise = float(model.predict(X)[0])
        return {"rise_mgdl": round(rise, 1), "source": "metabolic_twin", "confidence": "high"}

    # Population-level fallback (empirical formula)
    rise = gl * 2.5 * (1 + (prev_glucose - 100) * 0.003)
    return {"rise_mgdl": round(rise, 1), "source": "population_model", "confidence": "medium"}

def calculate_risk_score(readings: List[float], target_low=70, target_high=180) -> dict:
    """
    Compute Time-in-Range (TIR) and risk score from glucose array.
    Returns risk_score 0-100 and risk_level.
    """
    if not readings:
        return {"tir": 0, "risk_score": 50, "risk_level": "unknown"}

    arr = np.array(readings)
    tir = float(np.mean((arr >= target_low) & (arr <= target_high)) * 100)
    hypo = float(np.mean(arr < target_low) * 100)
    hyper = float(np.mean(arr > target_high) * 100)
    cv = float(np.std(arr) / np.mean(arr) * 100) if np.mean(arr) > 0 else 0

    # Risk formula: higher hypo/hyper and CV = higher risk
    risk_score = min(100, (hypo * 2.5) + (hyper * 1.5) + (cv * 0.5))

    if risk_score >= 75:   risk_level = "critical"
    elif risk_score >= 50: risk_level = "high"
    elif risk_score >= 25: risk_level = "medium"
    else:                  risk_level = "low"

    return {
        "tir": round(tir, 1),
        "hypo_pct": round(hypo, 1),
        "hyper_pct": round(hyper, 1),
        "cv_pct": round(cv, 1),
        "risk_score": round(risk_score, 1),
        "risk_level": risk_level,
    }

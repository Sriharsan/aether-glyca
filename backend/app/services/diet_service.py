"""
Hyper-Local Glycemic Intelligence — Tamil Nadu Dietary Database
Core innovation: regional food GI mapping for South Indian diet patterns
"""
from typing import Optional

# Glycemic Index database — South Indian foods
# GI: low <55 | medium 56-69 | high >=70
# GL = GI * carbs(g) / 100
TAMIL_FOOD_DB = {
    # Breakfast staples
    "idly":            {"gi": 80, "carbs_per_100g": 22, "protein": 3.4, "category": "breakfast"},
    "dosa":            {"gi": 77, "carbs_per_100g": 33, "protein": 3.8, "category": "breakfast"},
    "rava upma":       {"gi": 66, "carbs_per_100g": 23, "protein": 3.5, "category": "breakfast"},
    "pongal":          {"gi": 58, "carbs_per_100g": 25, "protein": 4.2, "category": "breakfast"},
    "poha":            {"gi": 76, "carbs_per_100g": 76, "protein": 2.0, "category": "breakfast"},
    "adai":            {"gi": 52, "carbs_per_100g": 18, "protein": 7.2, "category": "breakfast"},
    "pesarattu":       {"gi": 44, "carbs_per_100g": 16, "protein": 8.8, "category": "breakfast"},
    # Rice varieties
    "ponni rice":      {"gi": 72, "carbs_per_100g": 78, "protein": 2.7, "category": "staple"},
    "basmati rice":    {"gi": 56, "carbs_per_100g": 78, "protein": 3.5, "category": "staple"},
    "brown rice":      {"gi": 50, "carbs_per_100g": 73, "protein": 2.6, "category": "staple"},
    "seeraga samba":   {"gi": 60, "carbs_per_100g": 76, "protein": 3.0, "category": "staple"},
    "mappillai samba": {"gi": 55, "carbs_per_100g": 72, "protein": 3.4, "category": "staple"},
    # Curries & sides
    "sambar":          {"gi": 35, "carbs_per_100g": 8,  "protein": 3.5, "category": "side"},
    "rasam":           {"gi": 20, "carbs_per_100g": 4,  "protein": 1.2, "category": "side"},
    "kootu":           {"gi": 38, "carbs_per_100g": 10, "protein": 4.0, "category": "side"},
    "avial":           {"gi": 40, "carbs_per_100g": 12, "protein": 2.5, "category": "side"},
    "dal":             {"gi": 32, "carbs_per_100g": 20, "protein": 9.0, "category": "side"},
    # Snacks
    "murukku":         {"gi": 75, "carbs_per_100g": 62, "protein": 5.5, "category": "snack"},
    "seedai":          {"gi": 68, "carbs_per_100g": 58, "protein": 4.8, "category": "snack"},
    "sundal":          {"gi": 28, "carbs_per_100g": 22, "protein": 9.0, "category": "snack"},
    "banana":          {"gi": 51, "carbs_per_100g": 23, "protein": 1.1, "category": "fruit"},
    "mango":           {"gi": 60, "carbs_per_100g": 17, "protein": 0.8, "category": "fruit"},
    # Beverages
    "filter coffee":   {"gi": 5,  "carbs_per_100g": 3,  "protein": 0.3, "category": "beverage"},
    "sugarcane juice": {"gi": 43, "carbs_per_100g": 27, "protein": 0.1, "category": "beverage"},
    "tender coconut":  {"gi": 54, "carbs_per_100g": 10, "protein": 0.7, "category": "beverage"},
}

def get_food_info(food_name: str) -> Optional[dict]:
    """Fuzzy lookup — handles partial matches."""
    key = food_name.lower().strip()
    if key in TAMIL_FOOD_DB:
        return TAMIL_FOOD_DB[key]
    # Partial match
    for db_key, val in TAMIL_FOOD_DB.items():
        if key in db_key or db_key in key:
            return val
    return None

def calculate_glucose_impact(food_name: str, portion_grams: float) -> dict:
    """
    Estimate post-prandial glucose impact.
    Returns GI, GL, estimated mg/dL rise.
    """
    info = get_food_info(food_name)
    if not info:
        # Default estimate for unknown foods
        return {"gi": 65, "glycemic_load": 15.0, "estimated_rise_mgdl": 35.0, "found": False}

    carbs_consumed = (info["carbs_per_100g"] / 100) * portion_grams
    glycemic_load  = (info["gi"] * carbs_consumed) / 100

    # Empirical conversion: GL of 10 ≈ ~25 mg/dL rise (varies by individual)
    # Metabolic twin will override this with personalized model
    estimated_rise = glycemic_load * 2.5

    return {
        "gi": info["gi"],
        "glycemic_load": round(glycemic_load, 2),
        "estimated_rise_mgdl": round(estimated_rise, 1),
        "carbs_g": round(carbs_consumed, 1),
        "protein_g": round((info["protein"] / 100) * portion_grams, 1),
        "category": info["category"],
        "found": True,
    }

def get_diet_recommendations(risk_level: str, recent_foods: list) -> list:
    """Rule-based fallback recommendations (AI agent gives richer ones)."""
    base = [
        "Prefer adai or pesarattu over plain dosa — higher protein, lower GI",
        "Choose mappillai samba or brown rice over ponni rice",
        "Add sambar or kootu to every meal — lowers overall glycemic load",
        "Eat sundal as snack — low GI, high protein, culturally familiar",
    ]
    if risk_level in ("high", "critical"):
        base.insert(0, "⚠️ Reduce portion size of rice by 30% immediately")
        base.insert(1, "⚠️ Avoid murukku and high-GI snacks until levels stabilize")
    return base

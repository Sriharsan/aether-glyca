"""
AETHER-Glyca — Backend Tests
Run: pytest tests/ -v
"""
import pytest

def test_diet_service_gi_lookup():
    from app.services.diet_service import calculate_glucose_impact
    result = calculate_glucose_impact("idly", 200)
    assert result["gi"] == 80
    assert result["glycemic_load"] > 0
    assert result["found"] is True

def test_diet_service_unknown_food():
    from app.services.diet_service import calculate_glucose_impact
    result = calculate_glucose_impact("pizza", 150)
    assert result["found"] is False
    assert result["gi"] == 65  # Default fallback

def test_metabolic_twin_risk_score():
    from app.services.metabolic_twin import calculate_risk_score
    # Perfect control
    perfect = [120.0] * 100
    r = calculate_risk_score(perfect)
    assert r["tir"] == 100.0
    assert r["risk_level"] == "low"

    # Critical patient
    bad = [280.0] * 100
    r2 = calculate_risk_score(bad)
    assert r2["risk_level"] in ("high", "critical")

def test_tamil_food_database_coverage():
    from app.services.diet_service import TAMIL_FOOD_DB
    essential_foods = ["idly", "dosa", "ponni rice", "sambar", "rasam"]
    for food in essential_foods:
        assert food in TAMIL_FOOD_DB, f"{food} missing from database"

def test_diet_recommendations():
    from app.services.diet_service import get_diet_recommendations
    recs = get_diet_recommendations("critical", [])
    assert len(recs) > 0
    assert any("⚠️" in r for r in recs)

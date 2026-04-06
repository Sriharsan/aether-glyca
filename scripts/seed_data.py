"""
Seed script — populates DB with realistic Tamil Nadu patient data for demo.
Run: python scripts/seed_data.py
"""
import sys, os, random
from datetime import datetime, timedelta, timezone
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.core.database import SessionLocal, engine
from app.core.security import hash_password
from app.models.models import Base, User, Patient, GlucoseReading, DietLog

Base.metadata.create_all(bind=engine)

TAMIL_NAMES = [
    ("Murugan Selvam", "patient"),("Kavitha Rajan", "patient"),("Senthil Kumar", "patient"),
    ("Lakshmi Devi", "patient"),("Arjun Natarajan", "patient"),("Priya Subramaniam", "patient"),
    ("Rajesh Pandian", "patient"),("Meena Krishnan", "patient"),("Karthik Balaji", "patient"),
    ("Sundari Mani", "patient"),("Dr. Anand Venkat", "clinician"),
]

FOODS = ["idly","dosa","ponni rice","sambar","rasam","pongal","adai","kootu","banana","murukku"]
MEALS = ["breakfast","lunch","dinner","snack"]
CONTEXTS = ["fasting","post_meal","bedtime","random"]

def random_glucose(risk_level):
    if risk_level == "low":    return random.gauss(130, 20)
    if risk_level == "medium": return random.gauss(165, 35)
    if risk_level == "high":   return random.gauss(200, 45)
    return random.gauss(240, 55)  # critical

def seed():
    db = SessionLocal()
    print("Seeding AETHER-Glyca demo data...")

    for name, role in TAMIL_NAMES:
        email = name.lower().replace(" ",".")+"@demo.com"
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            continue
        user = User(email=email, hashed_password=hash_password("demo1234"),
                    full_name=name, role=role)
        db.add(user); db.flush()

        if role == "patient":
            risk = random.choice(["low","low","medium","medium","high","critical"])
            patient = Patient(
                user_id=user.id,
                age=random.randint(35, 72),
                gender=random.choice(["M","F"]),
                diabetes_type=random.choice(["type2","type2","type2","type1","prediabetes"]),
                diagnosis_year=random.randint(2010, 2023),
                region="Tamil Nadu",
                hba1c=round(random.uniform(6.5, 11.5), 1),
                risk_score={"low":15,"medium":38,"high":62,"critical":85}[risk],
                risk_level=risk,
            )
            db.add(patient); db.flush()

            # 60 days of glucose readings (3/day)
            for day in range(60):
                for _ in range(3):
                    ts = datetime.now(timezone.utc) - timedelta(days=day, hours=random.randint(0,23))
                    val = max(45, min(400, random_glucose(risk) + random.gauss(0, 10)))
                    reading = GlucoseReading(
                        patient_id=patient.id, value=round(val, 1),
                        context=random.choice(CONTEXTS), source="cgm", timestamp=ts,
                    )
                    db.add(reading)

            # 30 days of diet logs
            for day in range(30):
                for _ in range(random.randint(2, 4)):
                    ts = datetime.now(timezone.utc) - timedelta(days=day, hours=random.randint(0,20))
                    food = random.choice(FOODS)
                    diet = DietLog(
                        patient_id=patient.id, food_name=food,
                        portion_grams=random.choice([100,150,200,250]),
                        glycemic_index=random.randint(30, 80),
                        estimated_glucose_impact=round(random.uniform(10, 60), 1),
                        meal_type=random.choice(MEALS), logged_at=ts,
                    )
                    db.add(diet)

    # Demo accounts with fixed emails
    for email, role, name in [
        ("patient@demo.com","patient","Demo Patient"),
        ("doctor@demo.com","clinician","Dr. Demo Clinician"),
        ("admin@demo.com","admin","Admin User"),
    ]:
        if not db.query(User).filter(User.email == email).first():
            user = User(email=email, hashed_password=hash_password("demo1234"),
                        full_name=name, role=role)
            db.add(user); db.flush()
            if role == "patient":
                p = Patient(user_id=user.id, age=52, gender="M", diabetes_type="type2",
                            diagnosis_year=2018, region="Tamil Nadu", hba1c=8.2,
                            risk_score=42.0, risk_level="medium")
                db.add(p)

    db.commit()
    db.close()
    print("Seed complete!")

if __name__ == "__main__":
    seed()

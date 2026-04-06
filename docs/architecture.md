# AETHER-Glyca — System Architecture

## Overview

```
┌─────────────────────────────────────────────────────────┐
│                    AETHER-Glyca Platform                │
├──────────────────┬──────────────────┬───────────────────┤
│  Patient Panel   │ Clinician Panel  │   Agent Monitor   │
│  (React + TS)    │  (React + TS)    │   (React + TS)    │
└────────┬─────────┴────────┬─────────┴────────┬──────────┘
         │                  │                  │
         └──────────────────┼──────────────────┘
                            │ REST API (HTTPS)
                    ┌───────┴────────┐
                    │  FastAPI       │
                    │  Gateway       │
                    │  + JWT Auth    │
                    └───────┬────────┘
           ┌────────────────┼────────────────┐
           │                │                │
    ┌──────┴──────┐  ┌──────┴──────┐  ┌─────┴──────────┐
    │ AI Agent    │  │ ML Engine   │  │  Data Layer    │
    │ Layer       │  │ (XGBoost)   │  │  PostgreSQL    │
    │ (Claude     │  │ Metabolic   │  │  + Redis       │
    │  claude-sonnet-4-20250514)   │  │  Twin           │  │  + FHIR R4     │
    └─────────────┘  └─────────────┘  └────────────────┘
```

## Data Flow

1. **CGM/Manual Input** → Patient logs glucose or wearable pushes via FHIR R4
2. **Ingestion** → FastAPI validates, stores in PostgreSQL, triggers risk recalculation
3. **Metabolic Twin** → XGBoost model (per-patient) predicts glucose response to upcoming meal
4. **Triage Agent** → Claude-powered agent scans population, surfaces critical 1%
5. **Clinical Summary** → ICD-10 compliant notes auto-generated per patient
6. **Dashboard** → Real-time TIR, risk scores, recommendations delivered to UI

## Security

- All API endpoints protected by JWT (HS256, 60-min expiry)
- Passwords hashed with bcrypt (cost factor 12)
- AES-256 encryption at rest (PostgreSQL + Redis)
- HTTPS enforced in production
- No PII in logs

## Scalability

- Stateless FastAPI workers — horizontal scale behind load balancer
- Redis caches glucose stats (5-min TTL) to avoid recomputation
- Metabolic Twin models stored per patient_id in object storage
- Agent runs are async — triage for 10,000 patients in <30 seconds

## FHIR R4 Integration

Supports ingestion from CGM devices via:
- `Observation` resource (glucose readings)
- `Patient` resource (demographics)
- `MedicationRequest` (current medications)

Endpoint: `POST /api/fhir/ingest` accepts FHIR Bundle JSON

"""
ai.py  —  /api/ai/*  router
~~~~~~~~~~~~~~~~~~~~~~~~~~~
POST /api/ai/explain   — generate a plain-English narrative for any anomaly or
                          forecast flag payload.
POST /api/ai/chat      — fleet manager natural-language Q&A grounded in live data.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Any

from app.database import get_db
from app.services import ai_service, anomaly_service, forecast_service, alert_service, equipment_service

router = APIRouter(prefix="/api/ai", tags=["ai"])


# ---------------------------------------------------------------------------
# Schema
# ---------------------------------------------------------------------------

class ExplainRequest(BaseModel):
    payload: dict[str, Any]


class ExplainResponse(BaseModel):
    narrative: str


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    answer: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/explain", response_model=ExplainResponse)
def explain_flag(body: ExplainRequest):
    """Generate a plain-English narrative for an anomaly or forecast flag.

    The caller passes whatever JSON dict represents the flag (anomaly object,
    forecast entry, alert, etc.) and receives a 2-3 sentence advisory.
    """
    narrative = ai_service.generate_anomaly_narrative(body.payload)
    return ExplainResponse(narrative=narrative)


@router.post("/chat", response_model=ChatResponse)
def fleet_chat(body: ChatRequest, db: Session = Depends(get_db)):
    """Answer a fleet manager's natural-language question.

    Aggregates live fleet data (equipment, anomalies, forecasts, alerts) into
    a structured context and passes it alongside the question to Gemini.
    """
    # Build fleet context — all small enough to fit in a single Gemini call
    try:
        equipment = equipment_service.get_all_equipment(db)
        anomalies = anomaly_service.detect_anomalies(db)
        forecast = forecast_service.get_demand_forecast(db)
        alerts = alert_service.get_overdue_alerts(db)
    except Exception:
        equipment, anomalies, forecast, alerts = [], [], [], []

    def _serialise(obj):
        """Convert SQLAlchemy row or dict to plain dict."""
        if isinstance(obj, dict):
            return obj
        return {c.name: getattr(obj, c.name) for c in obj.__table__.columns}

    fleet_context: dict[str, Any] = {
        "equipment": [_serialise(e) for e in equipment],
        "anomalies": anomalies,
        "demand_forecast": forecast,
        "overdue_alerts": alerts,
    }

    answer = ai_service.generate_chat_response(body.message, fleet_context)
    return ChatResponse(answer=answer)

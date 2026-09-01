"""
lifecycle.py  —  /api/equipment/{id}/lifecycle  router
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
GET /api/equipment/{id}/lifecycle
  Returns the full lifecycle summary: timeline of rental events,
  refurbishment score + band, and per-rental ROI grades.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.services import lifecycle_service

router = APIRouter(prefix="/api/equipment", tags=["lifecycle"])


@router.get("/{equipment_id}/lifecycle")
def get_equipment_lifecycle(equipment_id: str, db: Session = Depends(get_db)):
    """Return the full asset lifecycle summary for a single piece of equipment.

    Response includes:
    - cumulative engine hours
    - refurbishment score (0-100) with band and recommendation
    - per-rental timeline entries with ROI grades
    - current active anomalies
    """
    try:
        return lifecycle_service.get_lifecycle(equipment_id, db)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Lifecycle computation failed: {exc}") from exc

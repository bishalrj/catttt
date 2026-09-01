from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.anomaly import AnomalyResponse
from app.services import anomaly_service

router = APIRouter(prefix="/api/anomalies", tags=["anomalies"])

@router.get("", response_model=List[AnomalyResponse])
def get_anomalies(db: Session = Depends(get_db)):
    return anomaly_service.detect_anomalies(db)

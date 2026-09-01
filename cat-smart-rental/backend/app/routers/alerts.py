from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.alert import OverdueAlertResponse
from app.services import alert_service

router = APIRouter(prefix="/api/alerts", tags=["alerts"])

@router.get("/overdue", response_model=List[OverdueAlertResponse])
def get_overdue_alerts(db: Session = Depends(get_db)):
    return alert_service.get_overdue_alerts(db)

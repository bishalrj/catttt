from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.usage_log import UsageLogResponse, UsageLogSummaryResponse, SiteUsageSummaryResponse
from app.services import usage_log_service

router = APIRouter(prefix="/api/usage-logs", tags=["usage-logs"])

# Registered before the /{equipment_id}* routes so "by-site" isn't swallowed as an equipment_id.
@router.get("/by-site/summary", response_model=List[SiteUsageSummaryResponse])
def get_site_usage_summary(db: Session = Depends(get_db)):
    return usage_log_service.get_site_usage_summary(db)

@router.get("/{equipment_id}/summary", response_model=UsageLogSummaryResponse)
def get_usage_summary(equipment_id: str, db: Session = Depends(get_db)):
    return usage_log_service.get_usage_summary(equipment_id, db)

@router.get("/{equipment_id}", response_model=List[UsageLogResponse])
def get_usage_logs(equipment_id: str, db: Session = Depends(get_db)):
    return usage_log_service.get_usage_logs(equipment_id, db)

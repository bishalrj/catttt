from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.forecast import DemandForecastEntry
from app.services import forecast_service

router = APIRouter(prefix="/api/forecast", tags=["forecast"])

@router.get("/demand", response_model=List[DemandForecastEntry])
def get_demand_forecast(db: Session = Depends(get_db)):
    return forecast_service.get_demand_forecast(db)

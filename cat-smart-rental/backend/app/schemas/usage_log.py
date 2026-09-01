from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class UsageLogResponse(BaseModel):
    id: int
    equipment_id: str
    site_id: Optional[str] = None
    log_date: datetime
    engine_hours: float
    idle_hours: float
    fuel_used_liters: float
    operating_hours: float
    downtime_hours: float

    model_config = ConfigDict(from_attributes=True)

class UsageLogSummaryResponse(BaseModel):
    equipment_id: str
    log_count: int
    total_engine_hours: float
    total_idle_hours: float
    total_fuel_liters: float
    total_operating_hours: float
    total_downtime_hours: float
    avg_daily_idle_hours: float

class SiteUsageSummaryResponse(BaseModel):
    site_id: str
    equipment_count: int
    total_engine_hours: float
    total_fuel_liters: float
    total_operating_hours: float
    total_downtime_hours: float

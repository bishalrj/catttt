from typing import Optional
from pydantic import BaseModel

class DemandForecastEntry(BaseModel):
    site_id: str
    equipment_type: str
    avg_daily_engine_hours: float
    trend: str
    fleet_available_of_type: int
    log_count: int
    recommended_action: Optional[str] = None

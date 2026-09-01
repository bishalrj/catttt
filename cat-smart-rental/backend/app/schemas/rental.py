from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class CheckoutRequest(BaseModel):
    equipment_id: str
    operator_id: str
    site_id: str
    engine_hours_start: float = Field(ge=0.0)
    rental_duration_days: int = Field(default=14, ge=1)

class CheckinRequest(BaseModel):
    equipment_id: str
    engine_hours_end: float = Field(ge=0.0)
    idle_hours: float = Field(ge=0.0)
    notes: Optional[str] = None

class RentalHistoryResponse(BaseModel):
    id: int
    equipment_id: str
    operator_id: str
    site_id: str
    checkout_time: datetime
    checkin_time: Optional[datetime] = None
    expected_return_time: Optional[datetime] = None
    engine_hours_start: float
    engine_hours_end: Optional[float] = None
    idle_hours: Optional[float] = None
    notes: Optional[str] = None
    created_at: datetime
    
    rental_duration_days: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)

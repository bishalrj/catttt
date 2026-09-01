from enum import Enum
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class EquipmentStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    ACTIVE = "ACTIVE"
    OVERDUE = "OVERDUE"
    MAINTENANCE = "MAINTENANCE"

class EquipmentBase(BaseModel):
    equipment_type: str
    site_id: Optional[str] = None
    checkout_date: Optional[datetime] = None
    checkin_date: Optional[datetime] = None
    engine_hours_per_day: float = 0.0
    idle_hours_per_day: float = 0.0
    operating_days: int = 0
    last_operator_id: Optional[str] = None
    status: EquipmentStatus
    expected_return_date: Optional[datetime] = None

class EquipmentResponse(EquipmentBase):
    equipment_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class DashboardSummaryResponse(BaseModel):
    total_equipment: int
    active_equipment: int
    available_equipment: int
    overdue_equipment: int
    average_utilization: float

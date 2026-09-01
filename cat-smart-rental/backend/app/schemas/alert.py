from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class OverdueAlertResponse(BaseModel):
    equipment_id: str
    equipment_type: str
    site_id: Optional[str] = None
    last_operator_id: Optional[str] = None
    status: str
    expected_return_date: Optional[datetime] = None
    alert_type: str
    days_overdue: Optional[float] = None
    days_until_due: Optional[float] = None

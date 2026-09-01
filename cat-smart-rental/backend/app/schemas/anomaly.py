from typing import Optional
from pydantic import BaseModel

class AnomalyResponse(BaseModel):
    equipment_id: str
    equipment_type: str
    site_id: Optional[str] = None
    anomaly_type: str
    severity: str
    detail: str

from sqlalchemy import Column, String, Float, Integer, DateTime
from app.database import Base

class UsageLog(Base):
    __tablename__ = "usage_logs"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    equipment_id = Column(String, nullable=False, index=True)
    site_id = Column(String, nullable=True)
    log_date = Column(DateTime, nullable=False)
    engine_hours = Column(Float, default=0.0)
    idle_hours = Column(Float, default=0.0)
    fuel_used_liters = Column(Float, default=0.0)
    operating_hours = Column(Float, default=0.0)
    downtime_hours = Column(Float, default=0.0)

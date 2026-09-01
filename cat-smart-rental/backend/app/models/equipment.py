from sqlalchemy import Column, String, Float, Integer, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Equipment(Base):
    __tablename__ = "equipment"

    equipment_id = Column(String, primary_key=True, index=True)
    equipment_type = Column(String, nullable=False)
    site_id = Column(String, nullable=True)
    checkout_date = Column(DateTime, nullable=True)
    checkin_date = Column(DateTime, nullable=True)
    engine_hours_per_day = Column(Float, default=0.0)
    idle_hours_per_day = Column(Float, default=0.0)
    operating_days = Column(Integer, default=0)
    last_operator_id = Column(String, nullable=True)
    status = Column(String, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

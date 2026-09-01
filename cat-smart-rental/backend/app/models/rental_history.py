from sqlalchemy import Column, String, Float, Integer, DateTime
from sqlalchemy.sql import func
from app.database import Base

class RentalHistory(Base):
    __tablename__ = "rental_history"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    equipment_id = Column(String, nullable=False, index=True)
    operator_id = Column(String, nullable=False)
    site_id = Column(String, nullable=False)
    checkout_time = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    checkin_time = Column(DateTime(timezone=True), nullable=True)
    expected_return_time = Column(DateTime(timezone=True), nullable=True)
    engine_hours_start = Column(Float, nullable=False)
    engine_hours_end = Column(Float, nullable=True)
    idle_hours = Column(Float, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

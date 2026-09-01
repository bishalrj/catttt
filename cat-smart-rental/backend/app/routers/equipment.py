from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.equipment import EquipmentResponse
from app.services import equipment_service

router = APIRouter(prefix="/api/equipment", tags=["equipment"])

@router.get("", response_model=List[EquipmentResponse])
def get_equipment(db: Session = Depends(get_db)):
    return equipment_service.get_all_equipment(db)

@router.get("/{equipment_id}", response_model=EquipmentResponse)
def get_equipment_by_id(equipment_id: str, db: Session = Depends(get_db)):
    equipment = equipment_service.get_equipment_by_id(equipment_id, db)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return equipment

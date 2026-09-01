from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.rental import CheckoutRequest, CheckinRequest, RentalHistoryResponse
from app.schemas.equipment import EquipmentResponse
from app.services import rental_service

router = APIRouter(prefix="/api/rentals", tags=["rentals"])

@router.post("/checkout", response_model=EquipmentResponse)
def checkout(request: CheckoutRequest, db: Session = Depends(get_db)):
    return rental_service.checkout_equipment(request, db)

@router.post("/checkin", response_model=RentalHistoryResponse)
def checkin(request: CheckinRequest, db: Session = Depends(get_db)):
    return rental_service.checkin_equipment(request, db)

@router.get("", response_model=List[RentalHistoryResponse])
def get_all_rentals(db: Session = Depends(get_db)):
    return rental_service.get_rentals(db)

@router.get("/{equipment_id}", response_model=List[RentalHistoryResponse])
def get_equipment_rentals(equipment_id: str, db: Session = Depends(get_db)):
    return rental_service.get_equipment_rentals(equipment_id, db)

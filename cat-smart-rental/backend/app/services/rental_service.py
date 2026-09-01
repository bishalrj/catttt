from sqlalchemy.orm import Session
from sqlalchemy import desc
from fastapi import HTTPException
from datetime import datetime, timezone
from app.models.equipment import Equipment
from app.models.rental_history import RentalHistory
from app.schemas.rental import CheckoutRequest, CheckinRequest
from app.services.mock_data import MOCK_EQUIPMENT_DATA, MOCK_RENTAL_DATA

def calculate_duration(start: datetime, end: datetime) -> float:
    diff = end - start
    return round(diff.total_seconds() / 86400.0, 2)

def checkout_equipment(request: CheckoutRequest, db: Session = None):
    if db is None:
        # Fallback Mock logic
        eq = next((e for e in MOCK_EQUIPMENT_DATA if e["equipment_id"] == request.equipment_id), None)
        if not eq:
            raise HTTPException(status_code=404, detail="Equipment not found")
        if eq["status"] == "ACTIVE":
            raise HTTPException(status_code=409, detail="Equipment is already active")
        
        eq["status"] = "ACTIVE"
        eq["site_id"] = request.site_id
        eq["last_operator_id"] = request.operator_id
        eq["checkout_date"] = datetime.now(timezone.utc)
        
        mock_rental = {
            "id": len(MOCK_RENTAL_DATA) + 1,
            "equipment_id": request.equipment_id,
            "operator_id": request.operator_id,
            "site_id": request.site_id,
            "checkout_time": datetime.now(timezone.utc),
            "checkin_time": None,
            "engine_hours_start": request.engine_hours_start,
            "engine_hours_end": None,
            "idle_hours": None,
            "notes": None,
            "created_at": datetime.now(timezone.utc),
        }
        MOCK_RENTAL_DATA.append(mock_rental)
        return eq

    # DB logic
    try:
        eq = db.query(Equipment).filter(Equipment.equipment_id == request.equipment_id).first()
        if not eq:
            raise HTTPException(status_code=404, detail="Equipment not found")
        
        if eq.status == "ACTIVE":
            raise HTTPException(status_code=409, detail="Equipment is already active")

        # Create rental history
        new_rental = RentalHistory(
            equipment_id=request.equipment_id,
            operator_id=request.operator_id,
            site_id=request.site_id,
            engine_hours_start=request.engine_hours_start,
            checkout_time=func.now() if hasattr(func, 'now') else datetime.now(timezone.utc)
        )
        db.add(new_rental)

        # Update equipment
        eq.status = "ACTIVE"
        eq.site_id = request.site_id
        eq.last_operator_id = request.operator_id
        eq.checkout_date = datetime.now(timezone.utc)

        db.commit()
        db.refresh(eq)
        return eq
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred during checkout")
    
from sqlalchemy.sql import func

def checkin_equipment(request: CheckinRequest, db: Session = None):
    if db is None:
        # Fallback Mock logic
        eq = next((e for e in MOCK_EQUIPMENT_DATA if e["equipment_id"] == request.equipment_id), None)
        if not eq:
            raise HTTPException(status_code=404, detail="Equipment not found")
        if eq["status"] != "ACTIVE":
            raise HTTPException(status_code=409, detail="Equipment is not currently active")
            
        active_rental = next((r for r in reversed(MOCK_RENTAL_DATA) if r["equipment_id"] == request.equipment_id and r["checkin_time"] is None), None)
        if active_rental and request.engine_hours_end < active_rental["engine_hours_start"]:
            raise HTTPException(status_code=400, detail="Final engine hours cannot be less than starting engine hours")
            
        if active_rental:
            active_rental["checkin_time"] = datetime.now(timezone.utc)
            active_rental["engine_hours_end"] = request.engine_hours_end
            active_rental["idle_hours"] = request.idle_hours
            active_rental["notes"] = request.notes
            
        eq["status"] = "AVAILABLE"
        eq["last_operator_id"] = None
        eq["site_id"] = None
        eq["checkin_date"] = datetime.now(timezone.utc)
        
        # update operating days, engine hours, idle hours (rudimentary mock)
        if active_rental:
            duration = calculate_duration(active_rental["checkout_time"], active_rental["checkin_time"])
            eq["operating_days"] = (eq.get("operating_days") or 0) + int(duration)
            
        return active_rental or {}

    # DB logic
    try:
        eq = db.query(Equipment).filter(Equipment.equipment_id == request.equipment_id).first()
        if not eq:
            raise HTTPException(status_code=404, detail="Equipment not found")
        
        if eq.status != "ACTIVE":
            raise HTTPException(status_code=409, detail="Equipment is not currently active")

        # Find active rental history
        rental = db.query(RentalHistory).filter(
            RentalHistory.equipment_id == request.equipment_id,
            RentalHistory.checkin_time == None
        ).order_by(desc(RentalHistory.checkout_time)).first()

        if not rental:
            raise HTTPException(status_code=404, detail="Active rental record not found")

        if request.engine_hours_end < rental.engine_hours_start:
            raise HTTPException(status_code=400, detail="Final engine hours cannot be less than starting engine hours")

        # Update rental
        now = datetime.now(timezone.utc)
        rental.checkin_time = now
        rental.engine_hours_end = request.engine_hours_end
        rental.idle_hours = request.idle_hours
        rental.notes = request.notes

        # Update equipment
        eq.status = "AVAILABLE"
        eq.last_operator_id = None
        eq.site_id = None
        eq.checkin_date = now

        db.commit()
        db.refresh(rental)
        return rental
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred during checkin")

def get_rentals(db: Session = None):
    if db is None:
        return process_mock_rentals(MOCK_RENTAL_DATA)
    
    rentals = db.query(RentalHistory).order_by(desc(RentalHistory.created_at)).all()
    return process_rentals(rentals)

def get_equipment_rentals(equipment_id: str, db: Session = None):
    if db is None:
        eq_rentals = [r for r in MOCK_RENTAL_DATA if r["equipment_id"] == equipment_id]
        return process_mock_rentals(eq_rentals)
        
    rentals = db.query(RentalHistory).filter(RentalHistory.equipment_id == equipment_id).order_by(desc(RentalHistory.created_at)).all()
    return process_rentals(rentals)

def process_rentals(rentals):
    result = []
    for r in rentals:
        # Calculate duration if checkin is complete
        duration = None
        if r.checkin_time and r.checkout_time:
            duration = calculate_duration(r.checkout_time, r.checkin_time)
            
        r_dict = {
            "id": r.id,
            "equipment_id": r.equipment_id,
            "operator_id": r.operator_id,
            "site_id": r.site_id,
            "checkout_time": r.checkout_time,
            "checkin_time": r.checkin_time,
            "engine_hours_start": r.engine_hours_start,
            "engine_hours_end": r.engine_hours_end,
            "idle_hours": r.idle_hours,
            "notes": r.notes,
            "created_at": r.created_at,
            "rental_duration_days": duration
        }
        result.append(r_dict)
    return result

def process_mock_rentals(rentals):
    result = []
    for r in rentals:
        duration = None
        if r["checkin_time"] and r["checkout_time"]:
            duration = calculate_duration(r["checkout_time"], r["checkin_time"])
        r_copy = r.copy()
        r_copy["rental_duration_days"] = duration
        result.append(r_copy)
    return result

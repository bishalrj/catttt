from sqlalchemy.orm import Session
from app.models.equipment import Equipment
from app.services.mock_data import MOCK_EQUIPMENT_DATA

def get_all_equipment(db: Session = None):
    if db is None:
        return MOCK_EQUIPMENT_DATA
    return db.query(Equipment).all()

def get_equipment_by_id(equipment_id: str, db: Session = None):
    if db is None:
        for eq in MOCK_EQUIPMENT_DATA:
            if eq["equipment_id"] == equipment_id:
                return eq
        return None
    
    return db.query(Equipment).filter(Equipment.equipment_id == equipment_id).first()

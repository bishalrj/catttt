from datetime import datetime
from sqlalchemy.orm import Session
from app.services.equipment_service import get_all_equipment
from app.services.alert_service import _naive
from app.schemas.equipment import DashboardSummaryResponse

def calculate_dashboard_summary(db: Session = None) -> dict:
    all_equipment = get_all_equipment(db)

    total = len(all_equipment)
    active = 0
    available = 0
    overdue = 0

    total_utilization = 0.0
    utilization_count = 0
    now = datetime.utcnow()

    for eq in all_equipment:
        # DB returns objects, Mock returns dicts
        status = eq.status if hasattr(eq, "status") else eq["status"]
        engine_hrs = eq.engine_hours_per_day if hasattr(eq, "engine_hours_per_day") else eq["engine_hours_per_day"]
        idle_hrs = eq.idle_hours_per_day if hasattr(eq, "idle_hours_per_day") else eq["idle_hours_per_day"]
        expected_return_date = eq.expected_return_date if hasattr(eq, "expected_return_date") else eq.get("expected_return_date")

        if status == "ACTIVE":
            active += 1
        elif status == "AVAILABLE":
            available += 1

        # Overdue is either the legacy static label, or an ACTIVE rental past its due date
        due = _naive(expected_return_date)
        is_overdue = status == "OVERDUE" or (status == "ACTIVE" and due is not None and due < now)
        if is_overdue:
            overdue += 1

        total_hours = engine_hrs + idle_hrs
        if total_hours > 0:
            util = engine_hrs / total_hours
            total_utilization += util
            utilization_count += 1
            
    avg_utilization = 0.0
    if utilization_count > 0:
        avg_utilization = (total_utilization / utilization_count) * 100
        
    return {
        "total_equipment": total,
        "active_equipment": active,
        "available_equipment": available,
        "overdue_equipment": overdue,
        "average_utilization": round(avg_utilization, 2)
    }

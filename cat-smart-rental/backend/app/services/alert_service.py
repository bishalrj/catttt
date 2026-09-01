from datetime import datetime
from sqlalchemy.orm import Session

from app.services import equipment_service

DUE_SOON_THRESHOLD_DAYS = 2

def _naive(dt):
    if dt is None:
        return None
    return dt.replace(tzinfo=None) if dt.tzinfo else dt

def get_overdue_alerts(db: Session = None):
    all_equipment = equipment_service.get_all_equipment(db)
    now = datetime.utcnow()
    alerts = []

    for eq in all_equipment:
        status = eq.status if hasattr(eq, "status") else eq["status"]
        expected_return_date = eq.expected_return_date if hasattr(eq, "expected_return_date") else eq.get("expected_return_date")
        equipment_id = eq.equipment_id if hasattr(eq, "equipment_id") else eq["equipment_id"]
        equipment_type = eq.equipment_type if hasattr(eq, "equipment_type") else eq["equipment_type"]
        site_id = eq.site_id if hasattr(eq, "site_id") else eq["site_id"]
        last_operator_id = eq.last_operator_id if hasattr(eq, "last_operator_id") else eq["last_operator_id"]

        alert_type = None
        days_overdue = None
        days_until_due = None

        due = _naive(expected_return_date)

        if status == "OVERDUE":
            alert_type = "OVERDUE"
        elif status == "ACTIVE" and due:
            delta_days = (due - now).total_seconds() / 86400.0
            if delta_days < 0:
                alert_type = "OVERDUE"
                days_overdue = round(-delta_days, 1)
            elif delta_days <= DUE_SOON_THRESHOLD_DAYS:
                alert_type = "DUE_SOON"
                days_until_due = round(delta_days, 1)

        if alert_type:
            alerts.append({
                "equipment_id": equipment_id,
                "equipment_type": equipment_type,
                "site_id": site_id,
                "last_operator_id": last_operator_id,
                "status": status,
                "expected_return_date": expected_return_date,
                "alert_type": alert_type,
                "days_overdue": days_overdue,
                "days_until_due": days_until_due,
            })

    alerts.sort(key=lambda a: (a["alert_type"] != "OVERDUE", -(a["days_overdue"] or 0)))
    return alerts

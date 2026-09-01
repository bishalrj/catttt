from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.models.usage_log import UsageLog
from app.services.mock_data import MOCK_USAGE_LOG_DATA

def _field(log, name):
    return log[name] if isinstance(log, dict) else getattr(log, name)

def get_all_usage_logs(db: Session = None):
    if db is None:
        return MOCK_USAGE_LOG_DATA
    return db.query(UsageLog).all()

def get_usage_logs(equipment_id: str, db: Session = None):
    if db is None:
        logs = [l for l in MOCK_USAGE_LOG_DATA if l["equipment_id"] == equipment_id]
        return sorted(logs, key=lambda l: l["log_date"], reverse=True)
    return db.query(UsageLog).filter(UsageLog.equipment_id == equipment_id).order_by(desc(UsageLog.log_date)).all()

def get_usage_summary(equipment_id: str, db: Session = None):
    logs = get_usage_logs(equipment_id, db)
    count = len(logs)

    total_engine = sum(_field(l, "engine_hours") for l in logs)
    total_idle = sum(_field(l, "idle_hours") for l in logs)
    total_fuel = sum(_field(l, "fuel_used_liters") for l in logs)
    total_operating = sum(_field(l, "operating_hours") for l in logs)
    total_downtime = sum(_field(l, "downtime_hours") for l in logs)

    return {
        "equipment_id": equipment_id,
        "log_count": count,
        "total_engine_hours": round(total_engine, 2),
        "total_idle_hours": round(total_idle, 2),
        "total_fuel_liters": round(total_fuel, 2),
        "total_operating_hours": round(total_operating, 2),
        "total_downtime_hours": round(total_downtime, 2),
        "avg_daily_idle_hours": round(total_idle / count, 2) if count else 0.0,
    }

def get_site_usage_summary(db: Session = None):
    source = get_all_usage_logs(db)

    sites = {}
    for log in source:
        site_id = _field(log, "site_id")
        if not site_id:
            continue
        entry = sites.setdefault(site_id, {
            "equipment_ids": set(),
            "engine_hours": 0.0,
            "fuel_used_liters": 0.0,
            "operating_hours": 0.0,
            "downtime_hours": 0.0,
        })
        entry["equipment_ids"].add(_field(log, "equipment_id"))
        entry["engine_hours"] += _field(log, "engine_hours")
        entry["fuel_used_liters"] += _field(log, "fuel_used_liters")
        entry["operating_hours"] += _field(log, "operating_hours")
        entry["downtime_hours"] += _field(log, "downtime_hours")

    result = []
    for site_id in sorted(sites.keys()):
        agg = sites[site_id]
        result.append({
            "site_id": site_id,
            "equipment_count": len(agg["equipment_ids"]),
            "total_engine_hours": round(agg["engine_hours"], 2),
            "total_fuel_liters": round(agg["fuel_used_liters"], 2),
            "total_operating_hours": round(agg["operating_hours"], 2),
            "total_downtime_hours": round(agg["downtime_hours"], 2),
        })
    return result

import statistics
from collections import defaultdict
from sqlalchemy.orm import Session

from app.services import equipment_service, usage_log_service

TREND_UP_RATIO = 1.15
TREND_DOWN_RATIO = 0.85
MIN_LOGS_FOR_TREND = 4

def _field(obj, name):
    return obj[name] if isinstance(obj, dict) else getattr(obj, name)

def _compute_trend(engine_hours):
    if len(engine_hours) < MIN_LOGS_FOR_TREND:
        return "stable"

    mid = len(engine_hours) // 2
    first_half_avg = statistics.mean(engine_hours[:mid])
    second_half_avg = statistics.mean(engine_hours[mid:])

    if first_half_avg == 0:
        return "increasing" if second_half_avg > 0 else "stable"
    if second_half_avg >= first_half_avg * TREND_UP_RATIO:
        return "increasing"
    if second_half_avg <= first_half_avg * TREND_DOWN_RATIO:
        return "decreasing"
    return "stable"

def _recommendation(trend, equipment_type, site_id, fleet_available):
    if trend == "increasing" and fleet_available == 0:
        return (f"Demand for {equipment_type} at {site_id} is rising with no spare units in the fleet "
                f"- consider acquiring or reallocating from a lower-demand site.")
    if trend == "increasing":
        return f"Demand for {equipment_type} at {site_id} is rising - pre-position one of the {fleet_available} available unit(s)."
    if trend == "decreasing":
        return f"Demand for {equipment_type} at {site_id} is declining - consider reallocating idle units to a higher-demand site."
    return None

def get_demand_forecast(db: Session = None):
    equipment = equipment_service.get_all_equipment(db)
    logs = usage_log_service.get_all_usage_logs(db)

    type_by_equipment = {}
    available_count_by_type = defaultdict(int)
    for eq in equipment:
        eq_id = _field(eq, "equipment_id")
        eq_type = _field(eq, "equipment_type")
        type_by_equipment[eq_id] = eq_type
        if _field(eq, "status") == "AVAILABLE":
            available_count_by_type[eq_type] += 1

    groups = defaultdict(list)
    for log in logs:
        eq_type = type_by_equipment.get(_field(log, "equipment_id"))
        site_id = _field(log, "site_id")
        if not eq_type or not site_id:
            continue
        groups[(site_id, eq_type)].append(log)

    forecast = []
    for (site_id, eq_type), group_logs in groups.items():
        group_logs.sort(key=lambda l: _field(l, "log_date"))
        engine_hours = [_field(l, "engine_hours") for l in group_logs]
        avg_daily_engine_hours = round(statistics.mean(engine_hours), 2)
        trend = _compute_trend(engine_hours)
        fleet_available = available_count_by_type.get(eq_type, 0)

        forecast.append({
            "site_id": site_id,
            "equipment_type": eq_type,
            "avg_daily_engine_hours": avg_daily_engine_hours,
            "trend": trend,
            "fleet_available_of_type": fleet_available,
            "log_count": len(group_logs),
            "recommended_action": _recommendation(trend, eq_type, site_id, fleet_available),
        })

    trend_priority = {"increasing": 0, "decreasing": 1, "stable": 2}
    forecast.sort(key=lambda f: (trend_priority[f["trend"]], -f["avg_daily_engine_hours"]))
    return forecast

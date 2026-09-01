import statistics
from collections import defaultdict
from sqlalchemy.orm import Session

from app.services import equipment_service, usage_log_service

HIGH_IDLE_HOURS = 9.0
HIGH_IDLE_RATIO = 3.0
HIGH_ENGINE_HOURS = 10.5
LOW_UTIL_MIN_DAYS = 45
LOW_UTIL_MAX_RATIO = 0.25
HIGH_DOWNTIME_AVG_HOURS = 1.5
FUEL_MIN_ENGINE_HOURS = 0.1
# Ratio-to-median rather than a z-score: with only a handful of equipment per fleet,
# a single outlier drags the mean/stdev enough that a z-score threshold under-fires.
FUEL_OUTLIER_RATIO = 1.75

SEVERITY_PRIORITY = {"high": 0, "medium": 1, "low": 2}

def _field(obj, name):
    return obj[name] if isinstance(obj, dict) else getattr(obj, name)

def _anomaly(equipment_id, equipment_type, site_id, anomaly_type, severity, detail):
    return {
        "equipment_id": equipment_id,
        "equipment_type": equipment_type,
        "site_id": site_id,
        "anomaly_type": anomaly_type,
        "severity": severity,
        "detail": detail,
    }

def _fuel_per_engine_hour_by_equipment(logs_by_equipment):
    fuel_per_hour = {}
    for eq_id, eq_logs in logs_by_equipment.items():
        total_engine = sum(_field(l, "engine_hours") for l in eq_logs)
        total_fuel = sum(_field(l, "fuel_used_liters") for l in eq_logs)
        if total_engine >= FUEL_MIN_ENGINE_HOURS:
            fuel_per_hour[eq_id] = total_fuel / total_engine
    return fuel_per_hour

def detect_anomalies(db: Session = None):
    equipment = equipment_service.get_all_equipment(db)
    logs = usage_log_service.get_all_usage_logs(db)

    logs_by_equipment = defaultdict(list)
    for log in logs:
        logs_by_equipment[_field(log, "equipment_id")].append(log)

    fuel_per_hour = _fuel_per_engine_hour_by_equipment(logs_by_equipment)
    fuel_values = list(fuel_per_hour.values())
    fuel_median = statistics.median(fuel_values) if fuel_values else 0.0

    anomalies = []
    for eq in equipment:
        eq_id = _field(eq, "equipment_id")
        eq_type = _field(eq, "equipment_type")
        site_id = _field(eq, "site_id")
        operator_id = _field(eq, "last_operator_id")
        engine_hrs = _field(eq, "engine_hours_per_day")
        idle_hrs = _field(eq, "idle_hours_per_day")
        op_days = _field(eq, "operating_days")

        if idle_hrs >= HIGH_IDLE_HOURS and idle_hrs > engine_hrs * HIGH_IDLE_RATIO:
            anomalies.append(_anomaly(eq_id, eq_type, site_id, "HIGH_IDLE", "high",
                f"Idle hours ({idle_hrs:.1f}h/day) far exceed engine hours ({engine_hrs:.1f}h/day)."))

        if engine_hrs >= HIGH_ENGINE_HOURS:
            anomalies.append(_anomaly(eq_id, eq_type, site_id, "HIGH_ENGINE", "medium",
                f"Engine hours ({engine_hrs:.1f}h/day) exceed realistic daily operating limits."))

        total_hours = engine_hrs + idle_hrs
        utilization = engine_hrs / total_hours if total_hours > 0 else 0.0
        if op_days >= LOW_UTIL_MIN_DAYS and utilization < LOW_UTIL_MAX_RATIO:
            anomalies.append(_anomaly(eq_id, eq_type, site_id, "LOW_UTIL_LONG_RENTAL", "medium",
                f"Rented for {op_days} days with only {utilization * 100:.0f}% utilization."))

        eq_logs = logs_by_equipment.get(eq_id, [])
        if eq_logs:
            avg_downtime = sum(_field(l, "downtime_hours") for l in eq_logs) / len(eq_logs)
            if avg_downtime > HIGH_DOWNTIME_AVG_HOURS:
                anomalies.append(_anomaly(eq_id, eq_type, site_id, "HIGH_DOWNTIME", "high",
                    f"Averaging {avg_downtime:.1f}h downtime per log across {len(eq_logs)} logs."))

        if eq_id in fuel_per_hour and fuel_median > 0 and fuel_per_hour[eq_id] > fuel_median * FUEL_OUTLIER_RATIO:
            anomalies.append(_anomaly(eq_id, eq_type, site_id, "UNUSUAL_FUEL", "medium",
                f"Fuel use ({fuel_per_hour[eq_id]:.1f} L/engine-hour) is far above the fleet median ({fuel_median:.1f})."))

        if site_id is None and operator_id is None:
            anomalies.append(_anomaly(eq_id, eq_type, site_id, "UNASSIGNED_EQUIPMENT", "low",
                "Equipment has no assigned site or operator."))

    anomalies.sort(key=lambda a: SEVERITY_PRIORITY[a["severity"]])
    return anomalies

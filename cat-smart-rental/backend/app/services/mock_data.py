from datetime import datetime, timedelta

# EQX1001 | Excavator | S001 | 2025-04-01 | 2025-04-16 | 1.5 | 10 | 15 | OP101
# EQX1002 | Crane | NULL | 2025-03-10 | 2025-03-30 | 0 | 11 | 20 | NULL
# EQX1003 | Bulldozer | S002 | 2025-02-15 | 2025-03-11 | 7.5 | 0.5 | 25 | OP203
# EQX1004 | Excavator | S004 | 2025-05-05 | 2025-05-15 | 2 | 9 | 10 | OP106
# EQX1005 | Bulldozer | S006 | 2025-01-01 | 2025-01-31 | 8 | 0 | 30 | OP301
# EQX1006 | Grader | S001 | 2025-04-05 | 2025-04-23 | 3 | 6 | 18 | OP114
# EQX1007 | Excavator | NULL | 2025-03-20 | 2025-04-01 | 0 | 12 | 12 | NULL

MOCK_EQUIPMENT_DATA = [
    {
        "equipment_id": "EQX1001",
        "equipment_type": "Excavator",
        "site_id": "S001",
        "checkout_date": datetime(2025, 4, 1),
        "checkin_date": datetime(2025, 4, 16),
        "engine_hours_per_day": 1.5,
        "idle_hours_per_day": 10.0,
        "operating_days": 15,
        "last_operator_id": "OP101",
        "status": "ACTIVE",
        "expected_return_date": datetime(2025, 4, 1) + timedelta(days=14)
    },
    {
        "equipment_id": "EQX1002",
        "equipment_type": "Crane",
        "site_id": None,
        "checkout_date": datetime(2025, 3, 10),
        "checkin_date": datetime(2025, 3, 30),
        "engine_hours_per_day": 0.0,
        "idle_hours_per_day": 11.0,
        "operating_days": 20,
        "last_operator_id": None,
        "status": "AVAILABLE",
        "expected_return_date": None
    },
    {
        "equipment_id": "EQX1003",
        "equipment_type": "Bulldozer",
        "site_id": "S002",
        "checkout_date": datetime(2025, 2, 15),
        "checkin_date": datetime(2025, 3, 11),
        "engine_hours_per_day": 7.5,
        "idle_hours_per_day": 0.5,
        "operating_days": 25,
        "last_operator_id": "OP203",
        "status": "OVERDUE",
        "expected_return_date": datetime(2025, 2, 15) + timedelta(days=14)
    },
    {
        "equipment_id": "EQX1004",
        "equipment_type": "Excavator",
        "site_id": "S004",
        "checkout_date": datetime(2025, 5, 5),
        "checkin_date": datetime(2025, 5, 15),
        "engine_hours_per_day": 2.0,
        "idle_hours_per_day": 9.0,
        "operating_days": 10,
        "last_operator_id": "OP106",
        "status": "ACTIVE",
        "expected_return_date": datetime(2025, 5, 5) + timedelta(days=14)
    },
    {
        "equipment_id": "EQX1005",
        "equipment_type": "Bulldozer",
        "site_id": "S006",
        "checkout_date": datetime(2025, 1, 1),
        "checkin_date": datetime(2025, 1, 31),
        "engine_hours_per_day": 8.0,
        "idle_hours_per_day": 0.0,
        "operating_days": 30,
        "last_operator_id": "OP301",
        "status": "MAINTENANCE",
        "expected_return_date": None
    },
    {
        "equipment_id": "EQX1006",
        "equipment_type": "Grader",
        "site_id": "S001",
        "checkout_date": datetime(2025, 4, 5),
        "checkin_date": datetime(2025, 4, 23),
        "engine_hours_per_day": 3.0,
        "idle_hours_per_day": 6.0,
        "operating_days": 18,
        "last_operator_id": "OP114",
        "status": "ACTIVE",
        "expected_return_date": datetime(2025, 4, 5) + timedelta(days=14)
    },
    {
        "equipment_id": "EQX1007",
        "equipment_type": "Excavator",
        "site_id": None,
        "checkout_date": datetime(2025, 3, 20),
        "checkin_date": datetime(2025, 4, 1),
        "engine_hours_per_day": 0.0,
        "idle_hours_per_day": 12.0,
        "operating_days": 12,
        "last_operator_id": None,
        "status": "AVAILABLE",
        "expected_return_date": None
    }
]

MOCK_RENTAL_DATA = []

def _logs_for(start_id, equipment_id, site_id, checkout_date, engine_hours, idle_hours,
               downtime_pattern=(0.0, 0.0, 0.0), fuel_factor=20.0):
    logs = []
    for day in range(3):
        eh = round(engine_hours * (0.9 + 0.1 * day), 2)
        ih = round(idle_hours * (0.9 + 0.1 * day), 2)
        logs.append({
            "id": start_id + day,
            "equipment_id": equipment_id,
            "site_id": site_id,
            "log_date": checkout_date + timedelta(days=day),
            "engine_hours": eh,
            "idle_hours": ih,
            "fuel_used_liters": round(eh * fuel_factor, 2),
            "operating_hours": round(eh * 1.1 + ih * 0.1, 2),
            "downtime_hours": downtime_pattern[day],
        })
    return logs

# Usage logs never carry a NULL site_id (matching generate_mock_data.py's convention) -
# equipment with no current site_id falls back to a nearby site for historical logging purposes.
# fuel_factor (L per engine-hour) varies like generate_mock_data.py's 15-30 normal range,
# with EQX1006 deliberately elevated (45-60 range) to exercise the UNUSUAL_FUEL anomaly.
MOCK_USAGE_LOG_DATA = (
    _logs_for(1, "EQX1001", "S001", datetime(2025, 4, 1), 1.5, 10.0, fuel_factor=18.0)
    + _logs_for(4, "EQX1002", "S003", datetime(2025, 3, 10), 0.0, 11.0, fuel_factor=22.0)
    + _logs_for(7, "EQX1003", "S002", datetime(2025, 2, 15), 7.5, 0.5, downtime_pattern=(0.0, 2.5, 0.0), fuel_factor=16.0)
    + _logs_for(10, "EQX1004", "S004", datetime(2025, 5, 5), 2.0, 9.0, fuel_factor=25.0)
    + _logs_for(13, "EQX1005", "S006", datetime(2025, 1, 1), 8.0, 0.0, downtime_pattern=(4.0, 3.5, 0.0), fuel_factor=19.0)
    + _logs_for(16, "EQX1006", "S001", datetime(2025, 4, 5), 3.0, 6.0, fuel_factor=52.0)
    + _logs_for(19, "EQX1007", "S001", datetime(2025, 3, 20), 0.0, 12.0, fuel_factor=22.0)
)

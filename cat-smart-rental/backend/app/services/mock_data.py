from datetime import datetime

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
        "status": "ACTIVE"
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
        "status": "AVAILABLE"
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
        "status": "OVERDUE"
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
        "status": "ACTIVE"
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
        "status": "MAINTENANCE"
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
        "status": "ACTIVE"
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
        "status": "AVAILABLE"
    }
]

MOCK_RENTAL_DATA = []

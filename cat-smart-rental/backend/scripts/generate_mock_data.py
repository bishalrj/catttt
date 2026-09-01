import random
import datetime
import math
import os

SEED = 42
random.seed(SEED)

OUTPUT_FILE = "seed_mock_data.sql"

# Configuration
EQUIPMENT_START = 1008
EQUIPMENT_END = 1100
EQUIPMENT_TYPES = ["Excavator", "Bulldozer", "Crane", "Grader", "Wheel Loader", "Skid Steer", "Compactor", "Dump Truck"]
EQUIPMENT_WEIGHTS = [25, 20, 10, 10, 15, 5, 5, 10]

SITES = [
    ("S001", "North Mining Site", {"Excavator": 3, "Bulldozer": 2}),
    ("S002", "East Construction Site", {"Bulldozer": 3, "Grader": 2}),
    ("S003", "Highway Expansion", {"Crane": 3}),
    ("S004", "Dam Construction", {"Excavator": 3}),
    ("S005", "Quarry Site", {"Dump Truck": 3}),
    ("S006", "Industrial Development", {"Bulldozer": 3}),
    ("S007", "Metro Construction", {"Crane": 3}),
    ("S008", "Port Expansion", {"Wheel Loader": 3}),
    ("S009", "Road Development", {"Grader": 3}),
    ("S010", "Mining Extension", {})
]

OPERATORS = [f"OP{i}" for i in range(101, 200)]

STATUSES = ["ACTIVE", "AVAILABLE", "OVERDUE", "MAINTENANCE"]
STATUS_WEIGHTS = [60, 25, 8, 7]

START_DATE = datetime.datetime(2025, 1, 1)
END_DATE = datetime.datetime(2025, 12, 31)

ANOMALIES = {
    "EQX1025": "HIGH_IDLE",
    "EQX1041": "HIGH_ENGINE",
    "EQX1068": "LOW_UTIL_LONG_RENTAL",
    "EQX1082": "HIGH_DOWNTIME",
    "EQX1095": "UNUSUAL_FUEL"
}

def random_date(start, end):
    return start + datetime.timedelta(
        seconds=random.randint(0, int((end - start).total_seconds())),
    )

def escape_sql(value):
    if value is None:
        return "NULL"
    elif isinstance(value, str):
        return f"'{value.replace('\'', '\'\'')}'"
    elif isinstance(value, datetime.datetime):
        return f"'{value.strftime('%Y-%m-%d %H:%M:%S')}'"
    else:
        return str(value)

def generate_equipment():
    equipment_records = []
    
    for i in range(EQUIPMENT_START, EQUIPMENT_END + 1):
        eq_id = f"EQX{i}"
        eq_type = random.choices(EQUIPMENT_TYPES, weights=EQUIPMENT_WEIGHTS, k=1)[0]
        
        status = random.choices(STATUSES, weights=STATUS_WEIGHTS, k=1)[0]
        
        anomaly = ANOMALIES.get(eq_id)
        
        # Site assignment
        site_id = None
        if status in ["ACTIVE", "OVERDUE"] or random.random() > 0.15:
            # Prefer site based on demand pattern
            suitable_sites = []
            for s in SITES:
                demand = s[2].get(eq_type, 1)
                suitable_sites.extend([s[0]] * demand)
            site_id = random.choice(suitable_sites)
            
        if status == "AVAILABLE" and random.random() < 0.5:
            site_id = None

        # Operator assignment
        operator_id = None
        if status in ["ACTIVE", "OVERDUE"]:
            operator_id = random.choice(OPERATORS)
        elif status == "MAINTENANCE":
            operator_id = random.choice(OPERATORS) if random.random() > 0.5 else None
            
        # Values
        engine_hours = random.uniform(4.0, 10.0)
        idle_hours = max(0.0, 12.0 - engine_hours + random.uniform(-2.0, 2.0))
        
        if anomaly == "HIGH_IDLE":
            idle_hours = random.uniform(10.0, 14.0)
            engine_hours = random.uniform(1.0, 3.0)
        elif anomaly == "HIGH_ENGINE":
            engine_hours = random.uniform(11.0, 14.0)
            idle_hours = random.uniform(0.0, 1.0)
            
        op_days = random.randint(1, 30)
        
        if anomaly == "LOW_UTIL_LONG_RENTAL":
            op_days = random.randint(60, 90)
            engine_hours = random.uniform(0.5, 2.0)
            idle_hours = random.uniform(8.0, 12.0)
            
        # Dates
        checkout_date = None
        checkin_date = None
        
        if status in ["ACTIVE", "OVERDUE"]:
            checkout_date = random_date(datetime.datetime(2025, 11, 1), datetime.datetime(2025, 12, 15))
            if status == "ACTIVE":
                checkin_date = checkout_date + datetime.timedelta(days=random.randint(5, 30))
            else: # OVERDUE
                checkin_date = checkout_date + datetime.timedelta(days=random.randint(1, 10))
                # make it overdue (in the past relative to a late-2025 'current' date)
        elif status == "AVAILABLE":
            if random.random() > 0.2:
                checkin_date = random_date(datetime.datetime(2025, 1, 1), datetime.datetime(2025, 12, 1))
                checkout_date = checkin_date - datetime.timedelta(days=random.randint(5, 30))
                
        equipment_records.append({
            "equipment_id": eq_id,
            "equipment_type": eq_type,
            "site_id": site_id,
            "checkout_date": checkout_date,
            "checkin_date": checkin_date,
            "engine_hours_per_day": round(engine_hours, 2),
            "idle_hours_per_day": round(idle_hours, 2),
            "operating_days": op_days,
            "last_operator_id": operator_id,
            "status": status
        })
        
    return equipment_records

def generate_rental_history(equipment_records):
    history = []
    
    for eq in equipment_records:
        num_rentals = random.randint(2, 6)
        
        current_date = START_DATE
        cum_engine_hours = random.uniform(100, 2000)
        
        for _ in range(num_rentals):
            # Gap between rentals
            current_date += datetime.timedelta(days=random.randint(2, 15))
            
            checkout = current_date
            duration = random.randint(5, 45)
            checkin = checkout + datetime.timedelta(days=duration)
            
            # site & operator
            suitable_sites = []
            for s in SITES:
                demand = s[2].get(eq["equipment_type"], 1)
                suitable_sites.extend([s[0]] * demand)
            site_id = random.choice(suitable_sites)
            op = random.choice(OPERATORS)
            
            engine_hours_added = duration * eq["engine_hours_per_day"] * random.uniform(0.8, 1.2)
            engine_start = cum_engine_hours
            engine_end = engine_start + engine_hours_added
            cum_engine_hours = engine_end
            
            idle_total = duration * eq["idle_hours_per_day"] * random.uniform(0.8, 1.2)
            
            history.append({
                "equipment_id": eq["equipment_id"],
                "operator_id": op,
                "site_id": site_id,
                "checkout_time": checkout,
                "checkin_time": checkin,
                "engine_hours_start": round(engine_start, 2),
                "engine_hours_end": round(engine_end, 2),
                "idle_hours": round(idle_total, 2),
                "notes": "Regular rental" if random.random() > 0.1 else "Maintenance required after return"
            })
            
            current_date = checkin
            
    # For ACTIVE/OVERDUE items, ensure there is an open rental matching their current status
    for eq in equipment_records:
        if eq["status"] in ["ACTIVE", "OVERDUE"]:
            history.append({
                "equipment_id": eq["equipment_id"],
                "operator_id": eq["last_operator_id"] or random.choice(OPERATORS),
                "site_id": eq["site_id"] or random.choice([s[0] for s in SITES]),
                "checkout_time": eq["checkout_date"] or datetime.datetime(2025, 12, 1),
                "checkin_time": None,
                "engine_hours_start": round(cum_engine_hours + 10, 2),
                "engine_hours_end": None,
                "idle_hours": None,
                "notes": "Current active rental"
            })
            
    return history

def generate_usage_logs(equipment_records):
    logs = []
    
    for eq in equipment_records:
        anomaly = ANOMALIES.get(eq["equipment_id"])
        
        # Generate 15-25 logs per equipment
        num_logs = random.randint(15, 25)
        
        for _ in range(num_logs):
            log_date = random_date(START_DATE, END_DATE)
            
            eh = max(0, eq["engine_hours_per_day"] * random.uniform(0.7, 1.3))
            ih = max(0, eq["idle_hours_per_day"] * random.uniform(0.7, 1.3))
            
            # Normal relationships
            # Operating hours typically slightly more than engine hours
            op_h = eh * random.uniform(1.0, 1.2) + ih * 0.1
            
            # Fuel used: roughly 15-30 liters per engine hour depending on type
            fuel_factor = random.uniform(15, 30)
            if anomaly == "UNUSUAL_FUEL":
                fuel_factor = random.uniform(45, 60) # Anomalous fuel usage
                
            fuel = eh * fuel_factor
            
            downtime = 0
            if random.random() < 0.05:
                downtime = random.uniform(1, 8)
                
            if anomaly == "HIGH_DOWNTIME":
                if random.random() < 0.4:
                    downtime = random.uniform(4, 12)
                    
            logs.append({
                "equipment_id": eq["equipment_id"],
                "site_id": eq["site_id"] or random.choice([s[0] for s in SITES]),
                "log_date": log_date,
                "engine_hours": round(eh, 2),
                "idle_hours": round(ih, 2),
                "fuel_used_liters": round(fuel, 2),
                "operating_hours": round(op_h, 2),
                "downtime_hours": round(downtime, 2)
            })
            
    return logs


def main():
    print("Generating equipment...")
    equipment = generate_equipment()
    print("Generating rental history...")
    history = generate_rental_history(equipment)
    print("Generating usage logs...")
    logs = generate_usage_logs(equipment)
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("-- MOCK DATA SEED SCRIPT for CAT Smart Rental Tracking System\n")
        f.write("-- Generated by generate_mock_data.py\n\n")
        
        f.write("CREATE TABLE IF NOT EXISTS usage_logs (\n")
        f.write("  id SERIAL PRIMARY KEY,\n")
        f.write("  equipment_id VARCHAR(50) NOT NULL,\n")
        f.write("  site_id VARCHAR(50),\n")
        f.write("  log_date TIMESTAMP NOT NULL,\n")
        f.write("  engine_hours FLOAT DEFAULT 0,\n")
        f.write("  idle_hours FLOAT DEFAULT 0,\n")
        f.write("  fuel_used_liters FLOAT DEFAULT 0,\n")
        f.write("  operating_hours FLOAT DEFAULT 0,\n")
        f.write("  downtime_hours FLOAT DEFAULT 0\n")
        f.write(");\n\n")
        
        f.write("-- EQUIPMENT\n")
        for eq in equipment:
            cols = ", ".join(eq.keys())
            vals = ", ".join(escape_sql(v) for v in eq.values())
            f.write(f"INSERT INTO equipment ({cols}) VALUES ({vals}) ON CONFLICT (equipment_id) DO NOTHING;\n")
            
        f.write("\n-- RENTAL HISTORY\n")
        for h in history:
            cols = ", ".join(h.keys())
            vals = ", ".join(escape_sql(v) for v in h.values())
            f.write(f"INSERT INTO rental_history ({cols}) VALUES ({vals});\n")
            
        f.write("\n-- USAGE LOGS\n")
        for l in logs:
            cols = ", ".join(l.keys())
            vals = ", ".join(escape_sql(v) for v in l.values())
            f.write(f"INSERT INTO usage_logs ({cols}) VALUES ({vals});\n")
            
    print(f"Generated {len(equipment)} equipment, {len(history)} rental histories, {len(logs)} usage logs.")
    print(f"SQL written to {OUTPUT_FILE}")
    
if __name__ == "__main__":
    main()

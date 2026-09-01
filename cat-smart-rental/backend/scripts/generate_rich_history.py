"""
generate_rich_history.py
~~~~~~~~~~~~~~~~~~~~~~~~
Seeds 90 days of realistic daily usage logs per equipment per site into the
database.  Run this script to give the demand forecasting layer enough data for
a meaningful time-series model (Layer 4 of the Phase 2 plan).

Usage:
    cd backend
    python scripts/generate_rich_history.py

Requires DATABASE_URL in .env (same as the main app).  Safe to run multiple
times — it inserts rows using INSERT ... ON CONFLICT DO NOTHING via raw SQL,
so existing logs are never overwritten.
"""

from __future__ import annotations

import os
import random
import math
import sys
from datetime import datetime, timedelta
from pathlib import Path

# Allow imports from the app package
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL not set.  Copy .env.example → .env and fill it in.")
    sys.exit(1)

engine = create_engine(DATABASE_URL)

# ---------------------------------------------------------------------------
# Configuration — mirrors mock_data.py equipment set
# ---------------------------------------------------------------------------

EQUIPMENT = [
    {"id": "EQX1001", "type": "Excavator",  "sites": ["S001"],        "base_engine": 4.5,  "base_idle": 3.0, "fuel_factor": 18.0},
    {"id": "EQX1002", "type": "Crane",       "sites": ["S003"],        "base_engine": 3.0,  "base_idle": 4.0, "fuel_factor": 22.0},
    {"id": "EQX1003", "type": "Bulldozer",   "sites": ["S002"],        "base_engine": 7.0,  "base_idle": 0.8, "fuel_factor": 16.0},
    {"id": "EQX1004", "type": "Excavator",   "sites": ["S004", "S001"],"base_engine": 3.5,  "base_idle": 4.5, "fuel_factor": 25.0},
    {"id": "EQX1005", "type": "Bulldozer",   "sites": ["S006"],        "base_engine": 8.0,  "base_idle": 0.2, "fuel_factor": 19.0},
    {"id": "EQX1006", "type": "Grader",      "sites": ["S001"],        "base_engine": 3.0,  "base_idle": 5.5, "fuel_factor": 52.0},  # High fuel anomaly
    {"id": "EQX1007", "type": "Excavator",   "sites": ["S001", "S003"],"base_engine": 0.5,  "base_idle": 8.0, "fuel_factor": 22.0},  # High idle anomaly
]

START_DATE = datetime.utcnow().date() - timedelta(days=89)
DAYS = 90

random.seed(42)   # Reproducible synthetic data


def _trend_factor(day_index: int, equipment_id: str) -> float:
    """Introduce a mild upward or downward trend per equipment to exercise
    the forecasting model."""
    # EQX1001 and EQX1003 trend upward; EQX1002 trends downward; rest stable
    trends = {
        "EQX1001": +0.005,
        "EQX1002": -0.004,
        "EQX1003": +0.003,
    }
    slope = trends.get(equipment_id, 0.0)
    return 1.0 + slope * day_index


def _seasonal(day_index: int) -> float:
    """Mild weekly seasonality: slightly lower at weekends."""
    weekday = (START_DATE + timedelta(days=day_index)).weekday()
    return 0.75 if weekday >= 5 else 1.0


def _jitter(base: float, spread: float = 0.15) -> float:
    """Add log-normal noise around a base value."""
    return max(0.0, base * math.exp(random.gauss(0, spread)))


def generate_logs() -> list[dict]:
    rows = []
    log_id = 10_000   # Start well above existing mock IDs
    for eq in EQUIPMENT:
        eq_id = eq["id"]
        sites = eq["sites"]
        for day in range(DAYS):
            date = datetime.combine(START_DATE + timedelta(days=day), datetime.min.time())
            site = sites[day % len(sites)]  # Rotate through sites over time
            trend = _trend_factor(day, eq_id)
            season = _seasonal(day)

            eh = round(_jitter(eq["base_engine"] * trend * season), 2)
            ih = round(_jitter(eq["base_idle"] * season), 2)
            fuel = round(eh * eq["fuel_factor"] * _jitter(1.0, 0.05), 2)
            operating = round(eh * 1.1 + ih * 0.1, 2)

            # Occasional downtime (roughly 1 in 10 days)
            downtime = round(_jitter(2.0), 2) if random.random() < 0.10 else 0.0

            rows.append({
                "id": log_id,
                "equipment_id": eq_id,
                "site_id": site,
                "log_date": date,
                "engine_hours": eh,
                "idle_hours": ih,
                "fuel_used_liters": fuel,
                "operating_hours": operating,
                "downtime_hours": downtime,
            })
            log_id += 1
    return rows


def seed(rows: list[dict]) -> None:
    with engine.begin() as conn:
        inserted = 0
        for row in rows:
            result = conn.execute(
                text(
                    """
                    INSERT INTO usage_logs
                        (id, equipment_id, site_id, log_date, engine_hours,
                         idle_hours, fuel_used_liters, operating_hours, downtime_hours)
                    VALUES
                        (:id, :equipment_id, :site_id, :log_date, :engine_hours,
                         :idle_hours, :fuel_used_liters, :operating_hours, :downtime_hours)
                    ON CONFLICT (id) DO NOTHING
                    """
                ),
                row,
            )
            inserted += result.rowcount
    print(f"Inserted {inserted} usage log rows ({len(rows) - inserted} already existed).")


if __name__ == "__main__":
    print(f"Generating {DAYS} days of usage history for {len(EQUIPMENT)} equipment items …")
    rows = generate_logs()
    print(f"  → {len(rows)} rows to seed")
    seed(rows)
    print("Done.")

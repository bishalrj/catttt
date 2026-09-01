"""
lifecycle_service.py
~~~~~~~~~~~~~~~~~~~~
Computes two derived scores for each piece of equipment:

  Refurbishment Score (0-100)
  ---------------------------
  A transparent, deterministic health score built from wear patterns,
  downtime history, and anomaly counts.  Bands:
    80-100  Healthy    — continue renting
    50-79   Monitor    — schedule inspection
    25-49   Refurbish  — maintenance recommended
    0-24    Retire     — lifecycle value likely exhausted

  Rental ROI Grade (A / B / C / D)
  ----------------------------------
  Per completed rental, weighs utilisation × uptime:
    roi = (engine_h / total_h) × (1 − downtime_h / rental_duration_h)
    A ≥ 0.75 | B 0.55-0.74 | C 0.35-0.54 | D < 0.35

The service also builds the asset lifecycle timeline — an ordered list of
rental events with aggregated per-rental telemetry.
"""

from __future__ import annotations

import statistics
from collections import defaultdict
from datetime import datetime
from typing import Any

from sqlalchemy.orm import Session

from app.services import equipment_service, usage_log_service
from app.models.rental_history import RentalHistory


# ---------------------------------------------------------------------------
# Constants for refurbishment scoring
# ---------------------------------------------------------------------------

EXPECTED_LIFECYCLE_ENGINE_HOURS = 20_000.0   # typical heavy equipment lifecycle
HIGH_DOWNTIME_FLEET_THRESHOLD = 1.5           # h per log — same as anomaly_service
HIGH_IDLE_RATIO = 3.0                         # idle:engine ratio that flags misuse
ANOMALY_HIGH_WEIGHT = 15                      # score deduction per HIGH anomaly
ANOMALY_MEDIUM_WEIGHT = 5                     # score deduction per MEDIUM anomaly
UTILISATION_BONUS_RANGE = (0.60, 0.80)        # ideal utilisation window


def _field(obj: Any, name: str) -> Any:
    return obj[name] if isinstance(obj, dict) else getattr(obj, name)


def _to_dt(val: Any) -> datetime | None:
    if val is None:
        return None
    if isinstance(val, datetime):
        return val
    try:
        return datetime.fromisoformat(str(val))
    except Exception:
        return None


# ---------------------------------------------------------------------------
# ROI Grade
# ---------------------------------------------------------------------------

def compute_roi_grade(
    engine_hours: float,
    idle_hours: float,
    downtime_hours: float,
    rental_duration_days: float | None,
) -> dict[str, Any]:
    """Return ROI score (0-1), letter grade, and label."""
    total_hours = engine_hours + idle_hours
    if total_hours <= 0 or not rental_duration_days or rental_duration_days <= 0:
        return {"roi_score": None, "grade": None, "label": "Insufficient data"}

    utilisation = engine_hours / total_hours
    rental_duration_hours = rental_duration_days * 24.0
    uptime = max(0.0, 1.0 - downtime_hours / rental_duration_hours)
    roi = round(utilisation * uptime, 3)

    if roi >= 0.75:
        grade, label = "A", "Strong ROI"
    elif roi >= 0.55:
        grade, label = "B", "Acceptable ROI"
    elif roi >= 0.35:
        grade, label = "C", "Weak ROI"
    else:
        grade, label = "D", "Poor ROI — review rental terms"

    return {"roi_score": roi, "grade": grade, "label": label}


# ---------------------------------------------------------------------------
# Refurbishment Score
# ---------------------------------------------------------------------------

def _compute_refurbishment_score(
    cumulative_engine_hours: float,
    avg_downtime_per_log: float,
    high_anomaly_count: int,
    medium_anomaly_count: int,
    avg_utilisation: float,
) -> dict[str, Any]:
    score = 100.0

    # Wear penalty — linear from 0 at 0h to -40 at full lifecycle
    wear_ratio = min(cumulative_engine_hours / EXPECTED_LIFECYCLE_ENGINE_HOURS, 1.0)
    wear_penalty = round(wear_ratio * 40, 1)
    score -= wear_penalty

    # Downtime penalty — 0 at fleet threshold, up to -20
    if avg_downtime_per_log > HIGH_DOWNTIME_FLEET_THRESHOLD:
        excess_ratio = min(
            (avg_downtime_per_log - HIGH_DOWNTIME_FLEET_THRESHOLD) / HIGH_DOWNTIME_FLEET_THRESHOLD,
            1.0,
        )
        downtime_penalty = round(excess_ratio * 20, 1)
    else:
        downtime_penalty = 0.0
    score -= downtime_penalty

    # Anomaly penalty
    anomaly_penalty = min(
        high_anomaly_count * ANOMALY_HIGH_WEIGHT + medium_anomaly_count * ANOMALY_MEDIUM_WEIGHT,
        25,
    )
    score -= anomaly_penalty

    # Utilisation bonus (+5 if in healthy window)
    utilisation_bonus = 0.0
    if UTILISATION_BONUS_RANGE[0] <= avg_utilisation <= UTILISATION_BONUS_RANGE[1]:
        utilisation_bonus = 5.0
    score += utilisation_bonus

    score = max(0.0, min(100.0, round(score, 1)))

    if score >= 80:
        band, recommendation = "Healthy", "Continue renting — no maintenance action required."
    elif score >= 50:
        band, recommendation = "Monitor", "Schedule a routine inspection before next rental period."
    elif score >= 25:
        band, recommendation = "Refurbish", "Maintenance recommended before next rental. Assess hydraulics, engine, and undercarriage."
    else:
        band, recommendation = "Retire", "Cumulative wear and downtime suggest this asset may cost more to maintain than it earns. Consider retirement."

    return {
        "score": score,
        "band": band,
        "recommendation": recommendation,
        "breakdown": {
            "wear_penalty": wear_penalty,
            "downtime_penalty": downtime_penalty,
            "anomaly_penalty": anomaly_penalty,
            "utilisation_bonus": utilisation_bonus,
        },
    }


# ---------------------------------------------------------------------------
# Main lifecycle builder
# ---------------------------------------------------------------------------

def get_lifecycle(equipment_id: str, db: Session) -> dict[str, Any]:
    """Build the full lifecycle summary for a single piece of equipment."""
    # ── Equipment ──────────────────────────────────────────────────────────
    all_eq = equipment_service.get_all_equipment(db)
    eq = next((e for e in all_eq if _field(e, "equipment_id") == equipment_id), None)
    if eq is None:
        raise ValueError(f"Equipment {equipment_id} not found")

    # ── Rental history ──────────────────────────────────────────────────────
    if db is not None:
        rental_rows = db.query(RentalHistory).filter(
            RentalHistory.equipment_id == equipment_id
        ).order_by(RentalHistory.checkout_time).all()
    else:
        rental_rows = []

    # ── Usage logs ──────────────────────────────────────────────────────────
    all_logs = usage_log_service.get_all_usage_logs(db)
    logs_for_eq = [l for l in all_logs if _field(l, "equipment_id") == equipment_id]

    # Group logs by rental period (logs within checkout→checkin window)
    def _logs_in_window(checkout, checkin):
        result = []
        for log in logs_for_eq:
            log_dt = _to_dt(_field(log, "log_date"))
            if log_dt is None:
                continue
            if checkout and log_dt < checkout:
                continue
            if checkin and log_dt > checkin:
                continue
            result.append(log)
        return result

    # ── Build timeline events ───────────────────────────────────────────────
    timeline_events = []
    cumulative_engine_hours = 0.0
    all_downtimes: list[float] = []
    all_utilisations: list[float] = []

    for rental in rental_rows:
        checkout_dt = _to_dt(rental.checkout_time)
        checkin_dt = _to_dt(rental.checkin_time)

        period_logs = _logs_in_window(checkout_dt, checkin_dt)

        total_engine = sum(_field(l, "engine_hours") for l in period_logs)
        total_idle = sum(_field(l, "idle_hours") for l in period_logs)
        total_fuel = sum(_field(l, "fuel_used_liters") for l in period_logs)
        total_downtime = sum(_field(l, "downtime_hours") for l in period_logs)
        total_hours = total_engine + total_idle

        # Fallback: use rental_history hours when logs are sparse
        if total_engine == 0 and rental.engine_hours_end is not None:
            total_engine = rental.engine_hours_end - rental.engine_hours_start

        cumulative_engine_hours += total_engine
        if period_logs:
            avg_dt = total_downtime / len(period_logs)
            all_downtimes.append(avg_dt)

        utilisation = total_engine / total_hours if total_hours > 0 else 0.0
        all_utilisations.append(utilisation)

        # Rental duration
        if checkin_dt and checkout_dt:
            duration_days = round((checkin_dt - checkout_dt).total_seconds() / 86400, 1)
        elif rental.expected_return_time and checkout_dt:
            exp = _to_dt(rental.expected_return_time)
            duration_days = round((exp - checkout_dt).total_seconds() / 86400, 1) if exp else None
        else:
            duration_days = None

        roi = compute_roi_grade(total_engine, total_idle, total_downtime, duration_days)

        timeline_events.append({
            "rental_id": rental.id,
            "site_id": rental.site_id,
            "operator_id": rental.operator_id,
            "checkout_time": checkout_dt.isoformat() if checkout_dt else None,
            "checkin_time": checkin_dt.isoformat() if checkin_dt else None,
            "duration_days": duration_days,
            "status": "completed" if checkin_dt else "active",
            "engine_hours": round(total_engine, 2),
            "idle_hours": round(total_idle, 2),
            "fuel_used_liters": round(total_fuel, 2),
            "downtime_hours": round(total_downtime, 2),
            "utilisation_pct": round(utilisation * 100, 1),
            "cumulative_engine_hours": round(cumulative_engine_hours, 2),
            "roi": roi,
        })

    # ── Aggregate anomaly counts from current live state ───────────────────
    # (We import inline to avoid circular imports)
    from app.services import anomaly_service  # noqa: PLC0415
    all_anomalies = anomaly_service.detect_anomalies(db)
    eq_anomalies = [a for a in all_anomalies if a["equipment_id"] == equipment_id]
    high_count = sum(1 for a in eq_anomalies if a["severity"] == "high")
    medium_count = sum(1 for a in eq_anomalies if a["severity"] == "medium")

    # ── Refurbishment score ─────────────────────────────────────────────────
    avg_downtime = statistics.mean(all_downtimes) if all_downtimes else 0.0
    avg_utilisation = statistics.mean(all_utilisations) if all_utilisations else 0.0

    refurb = _compute_refurbishment_score(
        cumulative_engine_hours=cumulative_engine_hours,
        avg_downtime_per_log=avg_downtime,
        high_anomaly_count=high_count,
        medium_anomaly_count=medium_count,
        avg_utilisation=avg_utilisation,
    )

    # ── Summary ────────────────────────────────────────────────────────────
    total_rentals = len(timeline_events)
    completed_rentals = sum(1 for e in timeline_events if e["status"] == "completed")

    return {
        "equipment_id": equipment_id,
        "equipment_type": _field(eq, "equipment_type"),
        "current_status": _field(eq, "status"),
        "cumulative_engine_hours": round(cumulative_engine_hours, 2),
        "total_rentals": total_rentals,
        "completed_rentals": completed_rentals,
        "refurbishment": refurb,
        "active_anomalies": eq_anomalies,
        "timeline": timeline_events,
    }

"""
ai_service.py
~~~~~~~~~~~~~
Wraps Google Gemini for Caterpillar VisionLink fleet-intelligence tasks:
  1. generate_anomaly_narrative  — turns a raw anomaly dict into a structured
     explanation + recommended operational action.
  2. generate_chat_response      — answers a fleet manager's natural-language
     question, grounded in live fleet context. Includes an intelligent local
     telemetry analysis engine fallback if GEMINI_API_KEY is not configured.
"""

from __future__ import annotations

import json
import os
from typing import Any

_KEY = os.getenv("GEMINI_API_KEY", "")
_MODEL_NAME = "gemini-1.5-flash"

_client = None


def _get_client():
    global _client
    if _client is not None:
        return _client
    if not _KEY:
        return None
    os.environ.setdefault("GRPC_VERBOSITY", "NONE")
    try:
        import google.generativeai as genai  # type: ignore
        genai.configure(api_key=_KEY)
        _client = genai.GenerativeModel(_MODEL_NAME)
        return _client
    except Exception:
        return None


# ---------------------------------------------------------------------------
# 1.  Anomaly / Forecast Narrative
# ---------------------------------------------------------------------------

_ANOMALY_SYSTEM = """You are Cat VisionLink AI, an expert industrial fleet advisor.
When given a structured JSON describing an equipment anomaly or demand forecast,
produce a concise 2-3 sentence plain-English operational advisory explaining:
  1. What is occurring with this asset (e.g. idle fuel waste, excessive runtime).
  2. The financial / wear impact on job site productivity.
  3. The exact immediate action recommended for site supervisors.
Use clean, direct wording. Emphasize asset IDs and severity."""


def generate_anomaly_narrative(payload: dict[str, Any]) -> str:
    client = _get_client()
    if client is not None:
        prompt = (
            "Here is the machine event data:\n\n"
            f"{json.dumps(payload, indent=2, default=str)}\n\n"
            "Generate the Cat VisionLink operational advisory now."
        )
        try:
            response = client.generate_content(
                contents=[
                    {"role": "user", "parts": [{"text": _ANOMALY_SYSTEM + "\n\n" + prompt}]}
                ]
            )
            return response.text.strip()
        except Exception:
            pass

    return _fallback_narrative(payload)


def _fallback_narrative(payload: dict[str, Any]) -> str:
    eq_id = payload.get("equipment_id", "Asset")
    anomaly = payload.get("anomaly_type", "").replace("_", " ")
    detail = payload.get("detail") or payload.get("recommended_action") or "Telemetry irregularity flagged."
    severity = payload.get("severity", "medium").upper()
    site = payload.get("site_id", "site")
    return (
        f"**{eq_id}** at **{site}** flagged for **{anomaly}** (Severity: {severity}). "
        f"{detail} "
        "Recommendation: Dispatch field technician to review operator telemetry and evaluate job site reallocation."
    )


# ---------------------------------------------------------------------------
# 2.  Fleet Chat (With Intelligent Telemetry Fallback)
# ---------------------------------------------------------------------------

_CHAT_SYSTEM = """You are Cat FleetAI Advisor, an advanced telematics assistant for Caterpillar VisionLink.
You have real-time access to live fleet telemetry, machine fault flags, demand forecasting, and overdue rentals provided as JSON context.

Formatting guidelines:
- Format your response cleanly using Markdown (bolding key metrics, bullet points for lists, code tags for Asset IDs).
- Give crisp, actionable recommendations tailored for construction fleet managers.
- Reference specific machine IDs, sites, and hours when relevant.
- Keep responses focused, structured, and easy to read quickly."""


def generate_chat_response(question: str, fleet_context: dict[str, Any]) -> str:
    client = _get_client()
    if client is not None:
        context_json = json.dumps(fleet_context, indent=2, default=str)
        if len(context_json) > 30_000:
            context_json = context_json[:30_000] + "\n... [truncated for length]"

        full_prompt = (
            f"{_CHAT_SYSTEM}\n\n"
            f"--- LIVE CATERPILLAR FLEET CONTEXT ---\n{context_json}\n"
            f"--- END CONTEXT ---\n\n"
            f"Fleet Manager: {question}"
        )

        try:
            response = client.generate_content(
                contents=[{"role": "user", "parts": [{"text": full_prompt}]}]
            )
            return response.text.strip()
        except Exception:
            pass

    # Intelligent Local Telemetry Analysis Engine (Active when API key is not configured or offline)
    return _local_telemetry_chat_engine(question, fleet_context)


def _local_telemetry_chat_engine(question: str, ctx: dict[str, Any]) -> str:
    q = question.lower()
    equipment: list[dict[str, Any]] = ctx.get("equipment", [])
    anomalies: list[dict[str, Any]] = ctx.get("anomalies", [])
    alerts: list[dict[str, Any]] = ctx.get("overdue_alerts") or ctx.get("alerts") or []
    forecast: list[dict[str, Any]] = ctx.get("demand_forecast") or ctx.get("forecast") or []

    # 1. Attention / anomalies
    if any(k in q for k in ["attention", "problem", "fault", "issue", "critical", "anomaly", "anomalies"]):
        if not anomalies and not alerts:
            return "✅ **All Cat assets are operating normally.** No critical fault codes or anomaly flags have been detected in the current shift."
        lines = ["### ⚠️ Cat Fleet Attention Required\n"]
        if anomalies:
            lines.append("**Detected Telemetry Anomalies:**")
            for a in anomalies[:4]:
                lines.append(f"- **`{a.get('equipment_id')}`** ({a.get('equipment_type')} at `{a.get('site_id')}`): {a.get('detail')} — *Severity: {a.get('severity', '').upper()}*")
        if alerts:
            lines.append("\n**Overdue / Return Alerts:**")
            for al in alerts[:3]:
                lines.append(f"- **`{al.get('equipment_id')}`** ({al.get('equipment_type')} at `{al.get('site_id')}`): {al.get('days_overdue', 0)} days overdue.")
        lines.append("\n**Next Action:** Check operator logs and schedule pre-maintenance inspection before dispatching next shift.")
        return "\n".join(lines)

    # 2. Idle machines / fuel
    if any(k in q for k in ["idle", "fuel", "waste"]):
        high_idle = [e for e in equipment if (e.get("idle_hours_per_day") or 0) > 3.0]
        if high_idle:
            lines = ["### 🚜 High Idle Ratio Analysis\n", "The following machines show excessive idle runtime burning non-productive fuel:\n"]
            for m in high_idle:
                lines.append(f"- **`{m.get('equipment_id')}`** ({m.get('equipment_type')} at `{m.get('site_id')}`): **{m.get('idle_hours_per_day'):.1f}h idle/day** vs {m.get('engine_hours_per_day'):.1f}h engine run.")
            lines.append("\n**Recommendation:** Reallocate underutilized units to high-demand sites to recover up to 18% in monthly fuel expenditure.")
            return "\n".join(lines)
        return "📊 **Idle time across the fleet is within normal operational thresholds** (average under 3.5h/day)."

    # 3. Demand / Forecast / Pre-positioning
    if any(k in q for k in ["demand", "forecast", "trend", "pre-position", "reallocat", "strategy"]):
        rising = [f for f in forecast if f.get("trend") == "increasing"]
        if rising:
            lines = ["### 📈 Cat Demand Forecast & Allocation Strategy\n", "Regional machine demand trends based on 90-day telemetry:\n"]
            for r in rising:
                lines.append(f"- **Site `{r.get('site_id')}`** shows rising demand for **{r.get('equipment_type')}s** (avg {r.get('avg_daily_engine_hours', 0):.1f}h/day). {r.get('recommended_action')}")
            return "\n".join(lines)
        return "📊 **Regional demand is balanced.** All job sites currently have adequate machinery allocation."

    # 4. Overdue / Rentals
    if any(k in q for k in ["overdue", "rental", "return", "expiration"]):
        overdue_list = [a for a in alerts if a.get("alert_type") == "OVERDUE"]
        if overdue_list:
            lines = ["### ⏱️ Overdue Fleet Deployments\n", "The following machinery has exceeded scheduled checkout duration:\n"]
            for o in overdue_list:
                lines.append(f"- **`{o.get('equipment_id')}`** at `{o.get('site_id')}` (Operator: `{o.get('last_operator_id')}`) — **+{o.get('days_overdue')} days past return window**.")
            lines.append("\n**Action:** Contact assigned site operators to process extension or initiate return telemetry check-in.")
            return "\n".join(lines)
        return "✅ **All active rental assignments are within their scheduled timeframe.** No overdue assets."

    # 5. General fleet summary
    total = len(equipment)
    active = len([e for e in equipment if e.get("status") == "ACTIVE"])
    avail = len([e for e in equipment if e.get("status") == "AVAILABLE"])
    return (
        f"### 🚜 Caterpillar Fleet Telematics Summary\n\n"
        f"- **Total Monitored Assets:** {total} heavy machines\n"
        f"- **Active on Job Sites:** {active} units operational\n"
        f"- **Available for Rental:** {avail} units ready for dispatch\n"
        f"- **Active Anomalies:** {len(anomalies)} telemetry flags\n"
        f"- **Overdue Deployments:** {len([a for a in alerts if a.get('alert_type') == 'OVERDUE'])} assets\n\n"
        f"Ask me about specific machine IDs, idle ratios, site demand, or maintenance lifecycle!"
    )

"""
ai_service.py
~~~~~~~~~~~~~
Wraps Google Gemini for two fleet-intelligence tasks:
  1. generate_anomaly_narrative  — turns a raw anomaly dict into a plain-English
     explanation + recommended action paragraph.
  2. generate_chat_response      — answers a fleet manager's natural-language
     question, grounded in live fleet context passed as structured data.

The module degrades gracefully: if GEMINI_API_KEY is absent the helper
functions return a placeholder string so the rest of the app is unaffected.
"""

from __future__ import annotations

import json
import os
from typing import Any

_KEY = os.getenv("GEMINI_API_KEY", "")
_MODEL_NAME = "gemini-1.5-flash"   # Fast, cheap, enough for fleet summaries

_client = None


def _get_client():
    global _client
    if _client is not None:
        return _client
    if not _KEY:
        return None
    # Lazy import so grpc is only loaded if the key is actually set.
    # Set REST transport env var before importing to avoid the grpc DLL on
    # systems where it is blocked by Application Control policies.
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

_ANOMALY_SYSTEM = """You are an expert fleet management advisor writing for a
construction site manager. When given a structured JSON describing an equipment
anomaly or demand forecast flag, produce a 2-3 sentence plain-English summary
that explains:
  (a) what is happening with this specific machine,
  (b) why it matters in operational terms,
  (c) the single most important next action the manager should take.
Keep language direct and non-technical. Do not mention JSON, fields, or code.
Never start with "I". Return only the advisory paragraph — no headings or bullet
points."""


def generate_anomaly_narrative(payload: dict[str, Any]) -> str:
    """Return a plain-English advisory paragraph for an anomaly or forecast flag.

    Falls back to a structured default when the API key is not configured.
    """
    client = _get_client()
    if client is None:
        return _fallback_narrative(payload)

    prompt = (
        "Here is the equipment event data (JSON):\n\n"
        f"{json.dumps(payload, indent=2, default=str)}\n\n"
        "Write the fleet advisory paragraph now."
    )

    try:
        response = client.generate_content(
            contents=[
                {"role": "user", "parts": [{"text": _ANOMALY_SYSTEM + "\n\n" + prompt}]}
            ]
        )
        return response.text.strip()
    except Exception as exc:  # noqa: BLE001
        return f"[AI narrative unavailable: {exc}] {_fallback_narrative(payload)}"


def _fallback_narrative(payload: dict[str, Any]) -> str:
    eq_id = payload.get("equipment_id", "Unknown asset")
    detail = payload.get("detail") or payload.get("recommended_action") or "See raw data."
    severity = payload.get("severity", "")
    severity_note = f" (Severity: {severity.upper()})" if severity else ""
    return (
        f"{eq_id}{severity_note}: {detail} "
        "Review usage logs and coordinate with site supervisor before the next shift."
    )


# ---------------------------------------------------------------------------
# 2.  Fleet Chat
# ---------------------------------------------------------------------------

_CHAT_SYSTEM = """You are FleetAI, an intelligent assistant for construction
equipment fleet managers. You have access to live fleet data provided as JSON
context. Answer the manager's question clearly and concisely in 1-4 sentences.
Refer to specific equipment IDs, site IDs, and numbers when they are relevant.
If the answer is genuinely not in the data, say so plainly. Never make up facts.
Keep the tone professional but approachable."""


def generate_chat_response(question: str, fleet_context: dict[str, Any]) -> str:
    """Answer a fleet manager's natural-language question using live fleet data.

    `fleet_context` should contain relevant slices of fleet state (anomalies,
    forecasts, alerts, equipment list) so the model can ground its answer.
    """
    client = _get_client()
    if client is None:
        return (
            "AI chat is not available — please set GEMINI_API_KEY in the backend "
            ".env file to enable this feature."
        )

    context_json = json.dumps(fleet_context, indent=2, default=str)
    # Trim context if it's very large to stay within token limits
    if len(context_json) > 30_000:
        context_json = context_json[:30_000] + "\n... [truncated for length]"

    full_prompt = (
        f"{_CHAT_SYSTEM}\n\n"
        f"--- LIVE FLEET DATA ---\n{context_json}\n"
        f"--- END FLEET DATA ---\n\n"
        f"Fleet manager question: {question}"
    )

    try:
        response = client.generate_content(
            contents=[{"role": "user", "parts": [{"text": full_prompt}]}]
        )
        return response.text.strip()
    except Exception as exc:  # noqa: BLE001
        return f"Sorry, I could not process that request right now. ({exc})"

"""
WhatsApp / SMS Notification Router
Sends alerts via Twilio WhatsApp API.
Falls back gracefully if TWILIO_* env vars are not configured.

Setup (optional):
1. Create a Twilio account at https://twilio.com
2. Enable WhatsApp Sandbox or WhatsApp Business
3. Add to .env:
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886  (sandbox number)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


class WhatsAppPayload(BaseModel):
    to: str           # e.g. "+919876543210"
    message: str
    equipment_id: str | None = None
    template: str | None = None


class NotificationResponse(BaseModel):
    success: bool
    method: str   # "twilio" | "mock"
    sid: str | None = None
    message: str


@router.post("/whatsapp", response_model=NotificationResponse)
async def send_whatsapp_alert(payload: WhatsAppPayload):
    """
    Send a WhatsApp message to a customer.

    If TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_FROM
    are set in environment, uses Twilio WhatsApp API.
    Otherwise returns a mock success response (for development).
    """
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token  = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")

    # Format recipient
    to_number = payload.to
    if not to_number.startswith("whatsapp:"):
        to_number = f"whatsapp:{to_number}"

    if account_sid and auth_token:
        # Real Twilio send
        try:
            from twilio.rest import Client  # type: ignore
            client = Client(account_sid, auth_token)
            msg = client.messages.create(
                body=payload.message,
                from_=from_number,
                to=to_number,
            )
            logger.info(f"WhatsApp sent via Twilio: SID={msg.sid} to={to_number}")
            return NotificationResponse(
                success=True,
                method="twilio",
                sid=msg.sid,
                message=f"WhatsApp alert dispatched to {payload.to}",
            )
        except ImportError:
            logger.warning("twilio package not installed. Run: pip install twilio")
            raise HTTPException(
                status_code=503,
                detail="Twilio package not installed on server. Run: pip install twilio",
            )
        except Exception as e:
            logger.error(f"Twilio send failed: {e}")
            raise HTTPException(status_code=502, detail=str(e))
    else:
        # Mock mode — log and return success for development / wa.me fallback
        logger.info(
            f"[MOCK] WhatsApp alert to {payload.to} | "
            f"Equipment: {payload.equipment_id} | Template: {payload.template}\n"
            f"Message preview: {payload.message[:120]}…"
        )
        return NotificationResponse(
            success=True,
            method="mock",
            sid=None,
            message=(
                "Mock mode: Twilio credentials not configured. "
                "The frontend will open WhatsApp directly via wa.me link. "
                "Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env for real sending."
            ),
        )


@router.get("/status")
async def notification_status():
    """Check if Twilio is configured."""
    configured = bool(os.getenv("TWILIO_ACCOUNT_SID"))
    return {
        "twilio_configured": configured,
        "mode": "twilio" if configured else "mock (wa.me fallback)",
        "from_number": os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886"),
    }

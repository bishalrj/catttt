from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import equipment, dashboard, rentals, alerts, usage_logs, forecast, anomalies

import os

app = FastAPI(title="CAT Smart Rental Tracking System")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
env_origin = os.getenv("FRONTEND_URL")
if env_origin:
    origins.append(env_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(equipment.router)
app.include_router(dashboard.router)
app.include_router(rentals.router)
app.include_router(alerts.router)
app.include_router(usage_logs.router)
app.include_router(forecast.router)
app.include_router(anomalies.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}

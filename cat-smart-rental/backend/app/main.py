from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from app.routers import equipment, dashboard, rentals, alerts, usage_logs, forecast, anomalies, ai, lifecycle

import os

app = FastAPI(title="CAT Smart Rental Tracking System", version="3.0")

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
app.include_router(ai.router)
app.include_router(lifecycle.router)

@app.get("/", response_class=HTMLResponse)
def root_welcome():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Cat® VisionLink® API Gateway</title>
        <style>
            body {
                background: #0f1216;
                color: #f3f4f6;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
            }
            .card {
                background: #151a21;
                border: 1px solid #262d38;
                border-top: 4px solid #ffcd11;
                border-radius: 8px;
                padding: 2.5rem;
                max-width: 550px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                text-align: center;
            }
            h1 { font-size: 1.5rem; margin-bottom: 0.5rem; color: #fff; text-transform: uppercase; letter-spacing: 0.05em; }
            h1 span { color: #ffcd11; }
            p { color: #94a3b8; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem; }
            .badge { background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 4px 12px; border-radius: 4px; font-weight: bold; font-size: 0.75rem; border: 1px solid rgba(16, 185, 129, 0.3); font-family: monospace; display: inline-block; margin-bottom: 1rem; }
            .btn {
                display: inline-block;
                background: #ffcd11;
                color: #0b0d10;
                font-weight: 800;
                text-decoration: none;
                padding: 0.75rem 1.5rem;
                border-radius: 4px;
                font-size: 0.85rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin: 0.4rem;
                transition: all 0.2s;
            }
            .btn:hover { background: #e5b700; transform: translateY(-1px); }
            .btn-secondary {
                background: #181d24;
                color: #ffcd11;
                border: 1px solid rgba(255, 205, 17, 0.4);
            }
            .btn-secondary:hover { background: rgba(255, 205, 17, 0.1); }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="badge">● FASTAPI BACKEND ONLINE (PORT 8000)</div>
            <h1>Cat® <span>VisionLink®</span> Telematics API</h1>
            <p>You have reached the Python FastAPI backend engine. To interact with the full web dashboard and UI, open the frontend app below:</p>
            <div style="margin-top: 1rem;">
                <a href="http://localhost:3000" class="btn">Open Web App (localhost:3000) &rarr;</a>
                <a href="/docs" class="btn btn-secondary">Interactive Swagger Docs (/docs)</a>
            </div>
        </div>
    </body>
    </html>
    """

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Cat VisionLink Telematics Engine"}

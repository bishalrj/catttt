# CAT Smart Rental Tracking System - Stage 1

## Overview
This is a full-stack hackathon project for construction/mining equipment rental tracking.

### Tech Stack
- Frontend: Next.js 15+ (App Router), TypeScript, Tailwind CSS, shadcn/ui, Recharts
- Backend: Python FastAPI, SQLAlchemy, Pydantic
- Database: Supabase PostgreSQL (SQLAlchemy ORM)

## Setup Instructions

### Backend Setup
1. Navigate to the `backend/` directory.
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Copy `.env.example` to `.env` and fill in the database URL. If left empty, the backend uses isolated mock data.
6. Run the server: `uvicorn app.main:app --reload`
   - API will be available at `http://localhost:8000`
   - Swagger docs at `http://localhost:8000/docs`

### Frontend Setup
1. Navigate to the `frontend/` directory.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and ensure `NEXT_PUBLIC_API_URL=http://localhost:8000`
4. Run the development server: `npm run dev`
   - The app will be available at `http://localhost:3000`

## Architecture Notes
- Modular monolith, easy to run locally.
- Backend gracefully handles empty database configurations by falling back to mock sample data for isolated UI rendering.

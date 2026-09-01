import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("No DATABASE_URL found")
    sys.exit(1)

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        print("Connected to Supabase")
        tables = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")).fetchall()
        print("Tables:")
        for t in tables:
            table_name = t[0]
            count = conn.execute(text(f'SELECT count(*) FROM "{table_name}"')).scalar()
            print(f"- {table_name}: {count} rows")
except Exception as e:
    print(f"Error: {e}")

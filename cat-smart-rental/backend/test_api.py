import requests
import json
import sys

BASE_URL = "http://localhost:8000/api"

def print_result(step, response, verify=None):
    print(f"--- {step} ---")
    print(f"Status: {response.status_code}")
    if response.status_code >= 400:
        print(f"Error: {response.text}")
        sys.exit(1)
        
    data = response.json()
    print(json.dumps(data, indent=2))
    if verify:
        if not verify(data):
            print("FAILED Verification failed!")
            sys.exit(1)
        print("OK Verification passed!\n")
    return data

# 1. GET equipment
eq_list = print_result("GET equipment", requests.get(f"{BASE_URL}/equipment"))

# 2. Check out EQX1007
checkout_payload = {
    "equipment_id": "EQX1007",
    "operator_id": "OP-999",
    "site_id": "SITE-X",
    "engine_hours_start": 105.5
}
eq = print_result(
    "Check out EQX1007", 
    requests.post(f"{BASE_URL}/rentals/checkout", json=checkout_payload),
    verify=lambda d: d["status"] == "ACTIVE" and d["site_id"] == "SITE-X" and d["last_operator_id"] == "OP-999"
)

# 5. Verify rental_history contains a new record
rentals = print_result(
    "Verify rental_history (GET /rentals/EQX1007)", 
    requests.get(f"{BASE_URL}/rentals/EQX1007"),
    verify=lambda d: len(d) > 0 and d[0]["equipment_id"] == "EQX1007" and d[0]["checkin_time"] is None
)

# Dashboard KPI check (Active should increase, Available should decrease)
dashboard = print_result("Dashboard KPIs after checkout", requests.get(f"{BASE_URL}/dashboard/summary"))

# 6. Check in EQX1007
checkin_payload = {
    "equipment_id": "EQX1007",
    "engine_hours_end": 120.5,
    "idle_hours": 2.5,
    "notes": "Test checkin completed"
}
rental = print_result(
    "Check in EQX1007", 
    requests.post(f"{BASE_URL}/rentals/checkin", json=checkin_payload),
    verify=lambda d: d["checkin_time"] is not None and d["engine_hours_end"] == 120.5
)

# 7. Verify EQX1007 becomes AVAILABLE
eq_after = print_result(
    "Verify EQX1007 becomes AVAILABLE", 
    requests.get(f"{BASE_URL}/equipment/EQX1007"),
    verify=lambda d: d["status"] == "AVAILABLE"
)

# Dashboard KPI check
dashboard_after = print_result("Dashboard KPIs after checkin", requests.get(f"{BASE_URL}/dashboard/summary"))

print("All backend API tests passed successfully!")

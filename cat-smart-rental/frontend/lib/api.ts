import { Equipment, DashboardSummary, CheckoutRequest, CheckinRequest, RentalHistory, OverdueAlert, UsageLog, UsageLogSummary, SiteUsageSummary, DemandForecastEntry, Anomaly } from "./types";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const API_URL = rawApiUrl.replace(/\/$/, "");

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const res = await fetch(`${API_URL}/dashboard/summary`, {
    next: { revalidate: 60 } // optional cache rules
  });
  if (!res.ok) {
    throw new Error("Failed to fetch dashboard summary");
  }
  return res.json();
}

export async function getEquipmentList(): Promise<Equipment[]> {
  const res = await fetch(`${API_URL}/equipment`, {
    cache: "no-store"
  });
  if (!res.ok) {
    throw new Error("Failed to fetch equipment list");
  }
  return res.json();
}

export async function getEquipmentById(id: string): Promise<Equipment> {
  const res = await fetch(`${API_URL}/equipment/${id}`, {
    cache: "no-store"
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch equipment ${id}`);
  }
  return res.json();
}

export async function checkoutRental(data: CheckoutRequest): Promise<Equipment> {
  const res = await fetch(`${API_URL}/rentals/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Checkout failed");
  }
  return res.json();
}

export async function checkinRental(data: CheckinRequest): Promise<RentalHistory> {
  const res = await fetch(`${API_URL}/rentals/checkin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Checkin failed");
  }
  return res.json();
}

export async function getRentals(): Promise<RentalHistory[]> {
  const res = await fetch(`${API_URL}/rentals`, {
    cache: "no-store"
  });
  if (!res.ok) {
    throw new Error("Failed to fetch rentals");
  }
  return res.json();
}

export async function getEquipmentRentals(id: string): Promise<RentalHistory[]> {
  const res = await fetch(`${API_URL}/rentals/${id}`, {
    cache: "no-store"
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch rentals for ${id}`);
  }
  return res.json();
}

export async function getOverdueAlerts(): Promise<OverdueAlert[]> {
  const res = await fetch(`${API_URL}/alerts/overdue`, {
    cache: "no-store"
  });
  if (!res.ok) {
    throw new Error("Failed to fetch overdue alerts");
  }
  return res.json();
}

export async function getUsageLogs(equipmentId: string): Promise<UsageLog[]> {
  const res = await fetch(`${API_URL}/usage-logs/${equipmentId}`, {
    cache: "no-store"
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch usage logs for ${equipmentId}`);
  }
  return res.json();
}

export async function getUsageSummary(equipmentId: string): Promise<UsageLogSummary> {
  const res = await fetch(`${API_URL}/usage-logs/${equipmentId}/summary`, {
    cache: "no-store"
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch usage summary for ${equipmentId}`);
  }
  return res.json();
}

export async function getSiteUsageSummary(): Promise<SiteUsageSummary[]> {
  const res = await fetch(`${API_URL}/usage-logs/by-site/summary`, {
    cache: "no-store"
  });
  if (!res.ok) {
    throw new Error("Failed to fetch site usage summary");
  }
  return res.json();
}

export async function getDemandForecast(): Promise<DemandForecastEntry[]> {
  const res = await fetch(`${API_URL}/forecast/demand`, {
    cache: "no-store"
  });
  if (!res.ok) {
    throw new Error("Failed to fetch demand forecast");
  }
  return res.json();
}

export async function getAnomalies(): Promise<Anomaly[]> {
  const res = await fetch(`${API_URL}/anomalies`, {
    cache: "no-store"
  });
  if (!res.ok) {
    throw new Error("Failed to fetch anomalies");
  }
  return res.json();
}

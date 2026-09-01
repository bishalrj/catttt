export type EquipmentStatus = "AVAILABLE" | "ACTIVE" | "OVERDUE" | "MAINTENANCE";

export interface Equipment {
  equipment_id: string;
  equipment_type: string;
  site_id: string | null;
  checkout_date: string | null;
  checkin_date: string | null;
  engine_hours_per_day: number;
  idle_hours_per_day: number;
  operating_days: number;
  last_operator_id: string | null;
  status: EquipmentStatus;
  expected_return_date: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardSummary {
  total_equipment: number;
  active_equipment: number;
  available_equipment: number;
  overdue_equipment: number;
  average_utilization: number;
}

export interface RentalHistory {
  id: number;
  equipment_id: string;
  operator_id: string;
  site_id: string;
  checkout_time: string;
  checkin_time: string | null;
  expected_return_time: string | null;
  engine_hours_start: number;
  engine_hours_end: number | null;
  idle_hours: number | null;
  notes: string | null;
  created_at: string;
  rental_duration_days: number | null;
}

export interface CheckoutRequest {
  equipment_id: string;
  operator_id: string;
  site_id: string;
  engine_hours_start: number;
  rental_duration_days?: number;
}

export interface CheckinRequest {
  equipment_id: string;
  engine_hours_end: number;
  idle_hours: number;
  notes?: string;
}

export interface UsageLog {
  id: number;
  equipment_id: string;
  site_id: string | null;
  log_date: string;
  engine_hours: number;
  idle_hours: number;
  fuel_used_liters: number;
  operating_hours: number;
  downtime_hours: number;
}

export interface UsageLogSummary {
  equipment_id: string;
  log_count: number;
  total_engine_hours: number;
  total_idle_hours: number;
  total_fuel_liters: number;
  total_operating_hours: number;
  total_downtime_hours: number;
  avg_daily_idle_hours: number;
}

export interface SiteUsageSummary {
  site_id: string;
  equipment_count: number;
  total_engine_hours: number;
  total_fuel_liters: number;
  total_operating_hours: number;
  total_downtime_hours: number;
}

export type DemandTrend = "increasing" | "decreasing" | "stable";

export interface DemandForecastEntry {
  site_id: string;
  equipment_type: string;
  avg_daily_engine_hours: number;
  trend: DemandTrend;
  fleet_available_of_type: number;
  log_count: number;
  recommended_action: string | null;
}

export type AnomalySeverity = "high" | "medium" | "low";

export interface Anomaly {
  equipment_id: string;
  equipment_type: string;
  site_id: string | null;
  anomaly_type: string;
  severity: AnomalySeverity;
  detail: string;
}

export type AlertType = "OVERDUE" | "DUE_SOON";

export interface OverdueAlert {
  equipment_id: string;
  equipment_type: string;
  site_id: string | null;
  last_operator_id: string | null;
  status: EquipmentStatus;
  expected_return_date: string | null;
  alert_type: AlertType;
  days_overdue: number | null;
  days_until_due: number | null;
}

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
}

export interface CheckinRequest {
  equipment_id: string;
  engine_hours_end: number;
  idle_hours: number;
  notes?: string;
}

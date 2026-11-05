// Hand-written mirrors of backend/models/core.py — keep in sync.

export type Role = "owner" | "tenant";
export type RoomStatus = "Vacant" | "Occupied";

export interface UserPublic {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  role: Role;
  tenant_id: string | null;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface Property {
  id: string;
  owner_id: string;
  name: string;
  address: string;
  city: string;
  created_at: string;
}

export interface RoomInput {
  number: string;
  price: number;
  due_day: number;
  amenities: string[];
  description: string;
  size: string;
  floor: string;
}

export interface Room extends RoomInput {
  id: string;
  property_id: string;
  photos: string[];
  status: RoomStatus;
  tenant_id: string | null;
  tenant_name: string | null;
  created_at: string;
}

export interface TenantCreate {
  name: string;
  phone: string;
  email: string | null;
  password: string;
  room_id: string | null;
  move_in_date: string | null;
  emergency_contact: string;
}

export interface TenantUpdate extends Omit<TenantCreate, "password"> {
  password: string | null;
}

export interface Tenant {
  id: string;
  property_id: string;
  user_id: string;
  name: string;
  phone: string;
  email: string | null;
  room_id: string | null;
  room_number: string | null;
  move_in_date: string | null;
  emergency_contact: string;
  created_at: string;
}

export interface TenantHome {
  tenant: Tenant;
  room: Room | null;
  property: Property;
}

export interface RoomStatusRow {
  id: string;
  number: string;
  price: number;
  status: RoomStatus;
  tenant_name: string | null;
}

export interface DashboardSummary {
  property_name: string;
  month_label: string;
  today: string;
  total_rooms: number;
  occupied_rooms: number;
  vacant_rooms: number;
  occupancy_rate: number;
  expected_income: number;
  total_tenants: number;
  rooms: RoomStatusRow[];
}
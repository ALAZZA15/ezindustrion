"""Stage 1 models: users/auth, property, room, tenant, dashboard. Mirrored in frontend/src/lib/types.ts."""

import uuid
from datetime import datetime, timezone
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field


def _id() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


Role = Literal["owner", "tenant"]
RoomStatus = Literal["Vacant", "Occupied"]


# ---- auth ----
class LoginRequest(BaseModel):
    identifier: str = Field(min_length=3)
    password: str = Field(min_length=1)


class UserPublic(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    phone: str
    role: Role
    tenant_id: Optional[str] = None


# ---- property ----
class Property(BaseModel):
    id: str = Field(default_factory=_id)
    owner_id: str
    name: str
    address: str = ""
    city: str = ""
    created_at: datetime = Field(default_factory=_now)


# ---- room ----
class RoomInput(BaseModel):
    number: str = Field(min_length=1, max_length=20)
    price: int = Field(gt=0)
    due_day: int = Field(default=1, ge=1, le=28)
    amenities: list[str] = Field(default_factory=list)
    description: str = ""
    size: str = ""
    floor: str = ""


class Room(RoomInput):
    id: str
    property_id: str
    photos: list[str] = Field(default_factory=list)
    status: RoomStatus = "Vacant"
    tenant_id: Optional[str] = None
    tenant_name: Optional[str] = None
    created_at: datetime


class PhotoDelete(BaseModel):
    url: str


# ---- tenant ----
class TenantCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    phone: str = Field(min_length=8, max_length=20)
    email: Optional[EmailStr] = None
    password: str = Field(min_length=6)
    room_id: Optional[str] = None
    move_in_date: Optional[str] = None
    emergency_contact: str = ""


class TenantUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    phone: str = Field(min_length=8, max_length=20)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(default=None, min_length=6)
    room_id: Optional[str] = None
    move_in_date: Optional[str] = None
    emergency_contact: str = ""


class Tenant(BaseModel):
    id: str
    property_id: str
    user_id: str
    name: str
    phone: str
    email: Optional[str] = None
    room_id: Optional[str] = None
    room_number: Optional[str] = None
    move_in_date: Optional[str] = None
    emergency_contact: str = ""
    created_at: datetime


class TenantHome(BaseModel):
    tenant: Tenant
    room: Optional[Room] = None
    property: Property


# ---- dashboard ----
class RoomStatusRow(BaseModel):
    id: str
    number: str
    price: int
    status: RoomStatus
    tenant_name: Optional[str] = None


class DashboardSummary(BaseModel):
    property_name: str
    month_label: str
    today: str
    total_rooms: int
    occupied_rooms: int
    vacant_rooms: int
    occupancy_rate: int
    expected_income: int
    total_tenants: int
    rooms: list[RoomStatusRow]
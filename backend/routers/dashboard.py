import os
from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException

from lib.auth import require_owner, require_tenant
from lib.dates import today_iso
from lib.db import db
from lib.scope import owner_property_ids
from models.core import DashboardSummary, Property, RoomStatusRow, Tenant, TenantHome
from routers.rooms import attach_occupancy, sort_key
from routers.tenants import with_room_numbers

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard/summary", response_model=DashboardSummary)
async def summary(owner: dict = Depends(require_owner)):
    ids = await owner_property_ids(owner)
    prop = await db.properties.find_one({"id": {"$in": ids}}, {"_id": 0}, sort=[("created_at", 1)])
    rooms = await attach_occupancy(sorted(await db.rooms.find({"property_id": {"$in": ids}}, {"_id": 0}).to_list(1000), key=sort_key))
    occupied = [r for r in rooms if r.status == "Occupied"]
    total_tenants = await db.tenants.count_documents({"property_id": {"$in": ids}})
    now = datetime.now(ZoneInfo(os.environ.get("APP_TZ", "Asia/Jakarta")))
    return DashboardSummary(
        property_name=prop["name"] if prop else "",
        month_label=now.strftime("%B %Y"),
        today=today_iso(),
        total_rooms=len(rooms),
        occupied_rooms=len(occupied),
        vacant_rooms=len(rooms) - len(occupied),
        occupancy_rate=round(len(occupied) * 100 / len(rooms)) if rooms else 0,
        expected_income=sum(r.price for r in occupied),
        total_tenants=total_tenants,
        rooms=[RoomStatusRow(id=r.id, number=r.number, price=r.price, status=r.status, tenant_name=r.tenant_name) for r in rooms],
    )


@router.get("/me/tenant", response_model=TenantHome)
async def tenant_home(user: dict = Depends(require_tenant)):
    tenant = await db.tenants.find_one({"id": user.get("tenant_id")}, {"_id": 0})
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant profile not found")
    prop = await db.properties.find_one({"id": tenant["property_id"]}, {"_id": 0})
    room = None
    if tenant.get("room_id"):
        doc = await db.rooms.find_one({"id": tenant["room_id"]}, {"_id": 0})
        room = (await attach_occupancy([doc]))[0] if doc else None
    t: Tenant = (await with_room_numbers([tenant]))[0]
    return TenantHome(tenant=t, room=room, property=Property(**prop))
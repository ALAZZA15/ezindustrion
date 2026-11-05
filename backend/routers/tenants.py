import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from lib.auth import hash_password, normalize_phone, require_owner
from lib.db import db
from lib.scope import default_property_id, get_owned_room, get_owned_tenant, owner_property_ids
from models.core import Tenant, TenantCreate, TenantUpdate

router = APIRouter(prefix="/tenants", tags=["tenants"])


async def with_room_numbers(tenants: list[dict]) -> list[Tenant]:
    room_ids = [t["room_id"] for t in tenants if t.get("room_id")]
    rooms = await db.rooms.find({"id": {"$in": room_ids}}, {"_id": 0, "id": 1, "number": 1}).to_list(1000)
    numbers = {r["id"]: r["number"] for r in rooms}
    return [Tenant(**{**t, "room_number": numbers.get(t.get("room_id") or "")}) for t in tenants]


async def check_identity_free(email: str | None, phone: str, exclude_user_id: str | None = None):
    ne = {"id": {"$ne": exclude_user_id}} if exclude_user_id else {}
    if await db.users.find_one({"phone": phone, **ne}):
        raise HTTPException(status_code=409, detail="Phone number is already registered")
    if email and await db.users.find_one({"email": email, **ne}):
        raise HTTPException(status_code=409, detail="Email is already registered")


async def check_room_available(owner: dict, room_id: str | None, exclude_tenant_id: str | None = None):
    if not room_id:
        return
    await get_owned_room(owner, room_id)
    q: dict = {"room_id": room_id}
    if exclude_tenant_id:
        q["id"] = {"$ne": exclude_tenant_id}
    if await db.tenants.find_one(q):
        raise HTTPException(status_code=409, detail="Room is already occupied")


@router.get("", response_model=list[Tenant])
async def list_tenants(owner: dict = Depends(require_owner)):
    ids = await owner_property_ids(owner)
    tenants = await db.tenants.find({"property_id": {"$in": ids}}, {"_id": 0}).sort("name", 1).to_list(1000)
    return await with_room_numbers(tenants)


@router.post("", response_model=Tenant, status_code=201)
async def create_tenant(body: TenantCreate, owner: dict = Depends(require_owner)):
    phone = normalize_phone(body.phone)
    email = body.email.lower() if body.email else None
    await check_identity_free(email, phone)
    await check_room_available(owner, body.room_id)
    property_id = await default_property_id(owner)
    now = datetime.now(timezone.utc)
    tenant_id, user_id = str(uuid.uuid4()), str(uuid.uuid4())
    await db.users.insert_one({"id": user_id, "name": body.name.strip(), "email": email, "phone": phone,
                               "role": "tenant", "tenant_id": tenant_id,
                               "password_hash": hash_password(body.password), "created_at": now})
    doc = {"id": tenant_id, "property_id": property_id, "user_id": user_id, "name": body.name.strip(),
           "phone": phone, "email": email, "room_id": body.room_id, "move_in_date": body.move_in_date,
           "emergency_contact": body.emergency_contact, "created_at": now}
    await db.tenants.insert_one(dict(doc))
    return (await with_room_numbers([doc]))[0]


@router.put("/{tenant_id}", response_model=Tenant)
async def update_tenant(tenant_id: str, body: TenantUpdate, owner: dict = Depends(require_owner)):
    tenant = await get_owned_tenant(owner, tenant_id)
    phone = normalize_phone(body.phone)
    email = body.email.lower() if body.email else None
    await check_identity_free(email, phone, exclude_user_id=tenant["user_id"])
    await check_room_available(owner, body.room_id, exclude_tenant_id=tenant_id)
    update = {"name": body.name.strip(), "phone": phone, "email": email, "room_id": body.room_id,
              "move_in_date": body.move_in_date, "emergency_contact": body.emergency_contact}
    await db.tenants.update_one({"id": tenant_id}, {"$set": update})
    user_set: dict = {"name": update["name"], "phone": phone, "email": email}
    if body.password:
        user_set["password_hash"] = hash_password(body.password)
    await db.users.update_one({"id": tenant["user_id"]}, {"$set": user_set})
    return (await with_room_numbers([{**tenant, **update}]))[0]


@router.delete("/{tenant_id}")
async def delete_tenant(tenant_id: str, owner: dict = Depends(require_owner)):
    tenant = await get_owned_tenant(owner, tenant_id)
    await db.tenants.delete_one({"id": tenant_id})
    await db.users.delete_one({"id": tenant["user_id"]})
    return {"ok": True}
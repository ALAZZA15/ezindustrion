"""Owner data scoping: every owner query is limited to properties the owner owns.
Records outside scope are reported as 404 (never 403) so existence is not leaked."""

from fastapi import HTTPException

from lib.db import db


async def owner_property_ids(owner: dict) -> list[str]:
    return await db.properties.distinct("id", {"owner_id": owner["id"]})


async def get_owned_room(owner: dict, room_id: str) -> dict:
    ids = await owner_property_ids(owner)
    room = await db.rooms.find_one({"id": room_id, "property_id": {"$in": ids}}, {"_id": 0})
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room


async def get_owned_tenant(owner: dict, tenant_id: str) -> dict:
    ids = await owner_property_ids(owner)
    tenant = await db.tenants.find_one({"id": tenant_id, "property_id": {"$in": ids}}, {"_id": 0})
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


async def default_property_id(owner: dict) -> str:
    prop = await db.properties.find_one({"owner_id": owner["id"]}, {"_id": 0, "id": 1}, sort=[("created_at", 1)])
    if not prop:
        raise HTTPException(status_code=400, detail="Owner has no property")
    return prop["id"]
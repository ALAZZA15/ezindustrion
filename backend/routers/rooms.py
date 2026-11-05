import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from lib.auth import require_owner
from lib.db import db
from lib.scope import default_property_id, get_owned_room, owner_property_ids
from models.core import PhotoDelete, Room, RoomInput

router = APIRouter(tags=["rooms"])

UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".webp"}
MAX_BYTES = 5 * 1024 * 1024


async def attach_occupancy(rooms: list[dict]) -> list[Room]:
    """Room status is derived from tenant assignment: a room with a tenant is Occupied."""
    ids = [r["id"] for r in rooms]
    tenants = await db.tenants.find({"room_id": {"$in": ids}}, {"_id": 0, "id": 1, "name": 1, "room_id": 1}).to_list(1000)
    by_room = {t["room_id"]: t for t in tenants}
    out = []
    for r in rooms:
        t = by_room.get(r["id"])
        out.append(Room(**{**r, "status": "Occupied" if t else "Vacant",
                           "tenant_id": t["id"] if t else None, "tenant_name": t["name"] if t else None}))
    return out


def sort_key(room: dict):
    n = room["number"]
    return (0, int(n), n) if n.isdigit() else (1, 0, n)


@router.get("/rooms", response_model=list[Room])
async def list_rooms(owner: dict = Depends(require_owner)):
    ids = await owner_property_ids(owner)
    rooms = await db.rooms.find({"property_id": {"$in": ids}}, {"_id": 0}).to_list(1000)
    return await attach_occupancy(sorted(rooms, key=sort_key))


@router.get("/rooms/{room_id}", response_model=Room)
async def get_room(room_id: str, owner: dict = Depends(require_owner)):
    room = await get_owned_room(owner, room_id)
    return (await attach_occupancy([room]))[0]


async def ensure_unique_number(property_id: str, number: str, exclude_id: str | None = None):
    query: dict = {"property_id": property_id, "number": number}
    if exclude_id:
        query["id"] = {"$ne": exclude_id}
    if await db.rooms.find_one(query):
        raise HTTPException(status_code=409, detail=f"Room {number} already exists")


@router.post("/rooms", response_model=Room, status_code=201)
async def create_room(body: RoomInput, owner: dict = Depends(require_owner)):
    property_id = await default_property_id(owner)
    number = body.number.strip()
    await ensure_unique_number(property_id, number)
    doc = {**body.model_dump(), "number": number, "id": str(uuid.uuid4()), "property_id": property_id,
           "photos": [], "created_at": datetime.now(timezone.utc)}
    await db.rooms.insert_one(dict(doc))
    return (await attach_occupancy([doc]))[0]


@router.put("/rooms/{room_id}", response_model=Room)
async def update_room(room_id: str, body: RoomInput, owner: dict = Depends(require_owner)):
    room = await get_owned_room(owner, room_id)
    number = body.number.strip()
    await ensure_unique_number(room["property_id"], number, exclude_id=room_id)
    update = {**body.model_dump(), "number": number}
    await db.rooms.update_one({"id": room_id}, {"$set": update})
    return (await attach_occupancy([{**room, **update}]))[0]


@router.delete("/rooms/{room_id}")
async def delete_room(room_id: str, owner: dict = Depends(require_owner)):
    await get_owned_room(owner, room_id)
    if await db.tenants.find_one({"room_id": room_id}):
        raise HTTPException(status_code=409, detail="Room is occupied. Move the tenant out first.")
    await db.rooms.delete_one({"id": room_id})
    return {"ok": True}


@router.post("/rooms/{room_id}/photos", response_model=Room)
async def upload_photos(room_id: str, files: list[UploadFile] = File(...), owner: dict = Depends(require_owner)):
    room = await get_owned_room(owner, room_id)
    urls = []
    for f in files:
        ext = Path(f.filename or "").suffix.lower()
        if ext not in ALLOWED_EXT:
            raise HTTPException(status_code=400, detail="Only JPG, PNG or WEBP images are allowed")
        data = await f.read()
        if len(data) > MAX_BYTES:
            raise HTTPException(status_code=400, detail="Each photo must be 5 MB or smaller")
        name = f"{uuid.uuid4().hex}{ext}"
        (UPLOAD_DIR / name).write_bytes(data)
        urls.append(f"/api/uploads/{name}")
    photos = room.get("photos", []) + urls
    await db.rooms.update_one({"id": room_id}, {"$set": {"photos": photos}})
    return (await attach_occupancy([{**room, "photos": photos}]))[0]


@router.post("/rooms/{room_id}/photos/delete", response_model=Room)
async def delete_photo(room_id: str, body: PhotoDelete, owner: dict = Depends(require_owner)):
    room = await get_owned_room(owner, room_id)
    photos = [p for p in room.get("photos", []) if p != body.url]
    await db.rooms.update_one({"id": room_id}, {"$set": {"photos": photos}})
    if body.url.startswith("/api/uploads/"):
        (UPLOAD_DIR / Path(body.url).name).unlink(missing_ok=True)
    return (await attach_occupancy([{**room, "photos": photos}]))[0]


@router.get("/uploads/{filename}")
async def get_upload(filename: str):
    path = UPLOAD_DIR / Path(filename).name
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Not found")
    return FileResponse(path)
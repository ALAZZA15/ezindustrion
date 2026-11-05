"""Idempotent seed: one owner, Pak Sultan's Boarding House, 5 rooms (Room 4 vacant), 4 tenants.
Run: cd backend && python seed.py"""

import asyncio
import uuid
from datetime import datetime, timezone

from lib.auth import hash_password
from lib.db import db, ensure_indexes

PHOTOS = [
    "https://images.unsplash.com/photo-1757344454333-cc666252e596?crop=entropy&cs=srgb&fm=jpg&q=80&w=1200",
    "https://images.unsplash.com/photo-1737712374342-da1db894a397?crop=entropy&cs=srgb&fm=jpg&q=80&w=1200",
    "https://images.unsplash.com/photo-1788927775194-70e9b280dd79?crop=entropy&cs=srgb&fm=jpg&q=80&w=1200",
    "https://images.unsplash.com/photo-1622429420441-60dd67f737a6?crop=entropy&cs=srgb&fm=jpg&q=80&w=1200",
]
BASE_AMENITIES = ["Private bathroom", "WiFi", "Bed + wardrobe"]
EXTRA = {"1": ["Air conditioning"], "2": ["Desk & chair"], "3": ["Window view"],
         "4": ["Air conditioning", "Desk & chair", "Water heater"], "5": ["Water heater"]}
TENANTS = [("Sinta", "1", "081211110001"), ("Dimas", "2", "081211110002"),
           ("Ayu", "3", "081211110003"), ("Bima", "5", "081211110004")]


def uid() -> str:
    return str(uuid.uuid4())


async def main():
    await ensure_indexes()
    if await db.users.find_one({"email": "owner@ezindustrion.com"}):
        print("Seed data already present - skipping")
        return
    now = datetime.now(timezone.utc)

    owner_id = uid()
    await db.users.insert_one({"id": owner_id, "name": "Pak Sultan", "email": "owner@ezindustrion.com",
                               "phone": "6281200000000", "role": "owner", "tenant_id": None,
                               "password_hash": hash_password("owner123"), "created_at": now})
    prop_id = uid()
    await db.properties.insert_one({"id": prop_id, "owner_id": owner_id, "name": "Pak Sultan's Boarding House",
                                    "address": "Jl. Setiabudi No. 12", "city": "Jakarta Selatan", "created_at": now})
    room_ids = {}
    for i, n in enumerate(["1", "2", "3", "4", "5"]):
        room_ids[n] = uid()
        await db.rooms.insert_one({
            "id": room_ids[n], "property_id": prop_id, "number": n, "price": 900000, "due_day": 1,
            "amenities": BASE_AMENITIES + EXTRA[n], "size": "3 x 4 m", "floor": "1" if i < 3 else "2",
            "description": f"Comfortable furnished room {n} at Pak Sultan's Boarding House, close to Setiabudi.",
            "photos": [PHOTOS[i % 4], PHOTOS[(i + 1) % 4], PHOTOS[(i + 2) % 4]], "created_at": now,
        })
    for name, room, phone in TENANTS:
        tenant_id, user_id = uid(), uid()
        normalized = "62" + phone[1:]
        email = f"{name.lower()}@ezindustrion.com"
        await db.users.insert_one({"id": user_id, "name": name, "email": email, "phone": normalized,
                                   "role": "tenant", "tenant_id": tenant_id,
                                   "password_hash": hash_password("tenant123"), "created_at": now})
        await db.tenants.insert_one({"id": tenant_id, "property_id": prop_id, "user_id": user_id, "name": name,
                                     "phone": normalized, "email": email, "room_id": room_ids[room],
                                     "move_in_date": "2025-01-01", "emergency_contact": "", "created_at": now})
    print("Seeded: 1 owner, 1 property, 5 rooms, 4 tenants")


if __name__ == "__main__":
    asyncio.run(main())
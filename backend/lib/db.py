"""MongoDB (Motor) client + index setup. Indexes are created on startup in the background."""

import os
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, IndexModel

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = client[os.environ.get("DB_NAME", "ezindustrion")]


INDEXES = {
    "users": [
        IndexModel([("id", ASCENDING)], name="id", unique=True),
        IndexModel([("email", ASCENDING)], name="email", unique=True,
                   partialFilterExpression={"email": {"$type": "string"}}),
        IndexModel([("phone", ASCENDING)], name="phone", unique=True),
    ],
    "properties": [
        IndexModel([("id", ASCENDING)], name="id", unique=True),
        IndexModel([("owner_id", ASCENDING), ("created_at", ASCENDING)], name="owner_created"),
    ],
    "rooms": [
        IndexModel([("id", ASCENDING)], name="id", unique=True),
        IndexModel([("property_id", ASCENDING), ("number", ASCENDING)], name="property_number", unique=True),
    ],
    "tenants": [
        IndexModel([("id", ASCENDING)], name="id", unique=True),
        IndexModel([("property_id", ASCENDING), ("name", ASCENDING)], name="property_name"),
        IndexModel([("room_id", ASCENDING)], name="room_id"),
    ],
}


async def ensure_indexes() -> None:
    for collection, models in INDEXES.items():
        await db[collection].create_indexes(models)
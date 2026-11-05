import os

from fastapi import APIRouter, Depends, HTTPException, Response

from lib.auth import COOKIE_NAME, TOKEN_TTL_DAYS, create_token, current_user, normalize_phone, verify_password
from lib.db import db
from models.core import LoginRequest, UserPublic

router = APIRouter(prefix="/auth", tags=["auth"])


def to_public(user: dict) -> UserPublic:
    return UserPublic(**{k: user.get(k) for k in UserPublic.model_fields})


@router.post("/login", response_model=UserPublic)
async def login(body: LoginRequest, response: Response):
    ident = body.identifier.strip()
    query = {"email": ident.lower()} if "@" in ident else {"phone": normalize_phone(ident)}
    user = await db.users.find_one(query, {"_id": 0})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email/phone or password")
    response.set_cookie(
        COOKIE_NAME,
        create_token(user["id"]),
        httponly=True,
        secure=os.environ.get("COOKIE_SECURE", "false") == "true",
        samesite="lax",
        max_age=TOKEN_TTL_DAYS * 86400,
        path="/",
    )
    return to_public(user)


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(COOKIE_NAME, path="/")
    return {"ok": True}


@router.get("/me", response_model=UserPublic)
async def me(user: dict = Depends(current_user)):
    return to_public(user)
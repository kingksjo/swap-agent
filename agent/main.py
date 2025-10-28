"""FastAPI application entry point."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from agent.api.v1 import chat_router
from agent.core import settings


app = FastAPI(title="Miye Agent")

origins = [settings.frontend_origin]
if settings.allowed_origins:
    origins.extend(
        origin.strip() for origin in settings.allowed_origins.split(",") if origin.strip()
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api/v1")


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


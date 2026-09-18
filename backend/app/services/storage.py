"""Cloudinary upload helpers with safe validation."""

from __future__ import annotations

import logging
from typing import Any

import cloudinary
import cloudinary.uploader
from fastapi import HTTPException, UploadFile, status

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

ALLOWED_IMAGE = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_PDF = {"application/pdf"}
MAX_BYTES = 8 * 1024 * 1024


def _configure() -> bool:
    if not (
        settings.cloudinary_cloud_name
        and settings.cloudinary_api_key
        and settings.cloudinary_api_secret
    ):
        return False
    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True,
    )
    return True


async def upload_file(file: UploadFile, folder: str = "skillswap") -> dict[str, Any]:
    content_type = file.content_type or ""
    if content_type not in ALLOWED_IMAGE | ALLOWED_PDF:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only images (jpeg/png/webp/gif) or PDF uploads are allowed",
        )

    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File exceeds 8MB limit")

    if not _configure():
        # Dev fallback when Cloudinary is not configured
        return {
            "url": f"https://placehold.co/800x600/0B0B0F/4F7FFF?text={file.filename or 'upload'}",
            "public_id": None,
            "resource_type": "image" if content_type in ALLOWED_IMAGE else "raw",
            "mock": True,
        }

    resource_type = "image" if content_type in ALLOWED_IMAGE else "raw"
    try:
        result = cloudinary.uploader.upload(
            data,
            folder=folder,
            resource_type=resource_type,
            overwrite=False,
        )
        return {
            "url": result.get("secure_url"),
            "public_id": result.get("public_id"),
            "resource_type": resource_type,
            "mock": False,
        }
    except Exception as exc:  # noqa: BLE001
        logger.exception("Cloudinary upload failed")
        raise HTTPException(status_code=500, detail=f"Upload failed: {exc}") from exc

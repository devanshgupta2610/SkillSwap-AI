from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.database import get_db
from app.models.notification import Notification
from app.models.user import User
from app.schemas import NotificationOut
from app.services.ai_service import ai_service

router = APIRouter(tags=["Shared"])


class AssistantRequest(BaseModel):
    prompt: str = Field(min_length=2, max_length=4000)
    context: str | None = None


class PricingRequest(BaseModel):
    category: str
    skills: list[str] = []
    experience_years: float = 1
    delivery_days: int = 7


@router.get("/notifications", response_model=list[NotificationOut])
def list_notifications(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(Notification)
        .filter(Notification.user_id == user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )


@router.post("/notifications/{notification_id}/read", response_model=NotificationOut)
def mark_read(
    notification_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.get(Notification, notification_id)
    if not item or item.user_id != user.id:
        raise HTTPException(status_code=404, detail="Notification not found")
    item.is_read = True
    db.commit()
    db.refresh(item)
    return item


@router.post("/ai/assistant")
async def assistant(payload: AssistantRequest, _: User = Depends(get_current_user)):
    reply = await ai_service.chat_assistant(payload.prompt, payload.context)
    return {"reply": reply}


@router.post("/ai/pricing")
async def pricing(payload: PricingRequest, _: User = Depends(get_current_user)):
    return await ai_service.suggest_pricing(
        payload.category,
        payload.skills,
        payload.experience_years,
        payload.delivery_days,
    )


@router.get("/health")
def health():
    return {"status": "ok", "service": "SkillSwap AI"}

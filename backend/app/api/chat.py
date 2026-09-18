from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.auth.security import safe_decode
from app.database import SessionLocal, get_db
from app.models.message import Conversation, Message
from app.models.user import User
from app.schemas import MessageCreate, MessageOut
from app.services.notification_service import notify

router = APIRouter(tags=["Chat"])


class ConnectionManager:
    def __init__(self) -> None:
        self.active: dict[int, list[WebSocket]] = {}

    async def connect(self, user_id: int, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active.setdefault(user_id, []).append(websocket)

    def disconnect(self, user_id: int, websocket: WebSocket) -> None:
        conns = self.active.get(user_id, [])
        if websocket in conns:
            conns.remove(websocket)
        if not conns and user_id in self.active:
            del self.active[user_id]

    async def send_to_user(self, user_id: int, data: dict) -> None:
        for ws in list(self.active.get(user_id, [])):
            await ws.send_json(data)


manager = ConnectionManager()


def _get_or_create_conversation(
    db: Session, user_a: int, user_b: int, booking_id: int | None = None
) -> Conversation:
    a, b = sorted([user_a, user_b])
    convo = (
        db.query(Conversation)
        .filter(
            Conversation.participant_one_id == a,
            Conversation.participant_two_id == b,
        )
        .first()
    )
    if not convo:
        convo = Conversation(
            participant_one_id=a,
            participant_two_id=b,
            booking_id=booking_id,
        )
        db.add(convo)
        db.flush()
    return convo


@router.post("/messages", response_model=MessageOut, status_code=201)
def send_message(
    payload: MessageCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.recipient_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot message yourself")
    recipient = db.get(User, payload.recipient_id)
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")

    convo = _get_or_create_conversation(db, user.id, payload.recipient_id, payload.booking_id)
    msg = Message(conversation_id=convo.id, sender_id=user.id, content=payload.content)
    db.add(msg)
    notify(db, payload.recipient_id, "New message", payload.content[:120], "message", "/messages")
    db.commit()
    db.refresh(msg)
    return msg


@router.get("/messages/{peer_id}", response_model=list[MessageOut])
def get_thread(peer_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    a, b = sorted([user.id, peer_id])
    convo = (
        db.query(Conversation)
        .filter(Conversation.participant_one_id == a, Conversation.participant_two_id == b)
        .first()
    )
    if not convo:
        return []
    return (
        db.query(Message)
        .filter(Message.conversation_id == convo.id)
        .order_by(Message.created_at.asc())
        .all()
    )


@router.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket, token: str):
    payload = safe_decode(token)
    if not payload or payload.get("type") != "access":
        await websocket.close(code=4401)
        return

    user_id = int(payload["sub"])
    await manager.connect(user_id, websocket)
    db = SessionLocal()
    try:
        while True:
            data = await websocket.receive_json()
            recipient_id = int(data.get("recipient_id"))
            content = (data.get("content") or "").strip()
            if not content:
                continue
            convo = _get_or_create_conversation(db, user_id, recipient_id, data.get("booking_id"))
            msg = Message(conversation_id=convo.id, sender_id=user_id, content=content)
            db.add(msg)
            notify(db, recipient_id, "New message", content[:120], "message", "/messages")
            db.commit()
            db.refresh(msg)
            envelope = {
                "id": msg.id,
                "conversation_id": msg.conversation_id,
                "sender_id": msg.sender_id,
                "content": msg.content,
                "created_at": msg.created_at.isoformat(),
            }
            await manager.send_to_user(recipient_id, envelope)
            await manager.send_to_user(user_id, envelope)
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
    finally:
        db.close()

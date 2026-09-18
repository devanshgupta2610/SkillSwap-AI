from sqlalchemy.orm import Session

from app.models.notification import Notification


def notify(
    db: Session,
    user_id: int,
    title: str,
    body: str,
    ntype: str = "info",
    link: str | None = None,
) -> Notification:
    item = Notification(user_id=user_id, title=title, body=body, type=ntype, link=link)
    db.add(item)
    db.flush()
    return item

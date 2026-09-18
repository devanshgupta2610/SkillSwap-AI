from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user, require_role
from app.database import get_db
from app.models.gig import Gig, SavedGig
from app.models.user import User, UserRole
from app.schemas import GigCreate, GigOut, GigUpdate

router = APIRouter(prefix="/gigs", tags=["Gigs"])


@router.post("", response_model=GigOut, status_code=201)
def create_gig(
    payload: GigCreate,
    user: User = Depends(require_role(UserRole.CREATOR)),
    db: Session = Depends(get_db),
):
    gig = Gig(creator_id=user.id, **payload.model_dump())
    db.add(gig)
    db.commit()
    db.refresh(gig)
    return gig


@router.get("", response_model=list[GigOut])
def list_gigs(
    q: str | None = Query(None),
    category: str | None = Query(None),
    min_price: float | None = Query(None),
    max_price: float | None = Query(None),
    creator_id: int | None = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Gig).filter(Gig.is_active.is_(True))
    if q:
        like = f"%{q}%"
        query = query.filter((Gig.title.ilike(like)) | (Gig.description.ilike(like)))
    if category:
        query = query.filter(Gig.category == category)
    if min_price is not None:
        query = query.filter(Gig.price >= min_price)
    if max_price is not None:
        query = query.filter(Gig.price <= max_price)
    if creator_id is not None:
        query = query.filter(Gig.creator_id == creator_id)
    return query.order_by(Gig.created_at.desc()).all()


@router.get("/{gig_id}", response_model=GigOut)
def get_gig(gig_id: int, db: Session = Depends(get_db)):
    gig = db.get(Gig, gig_id)
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")
    gig.views += 1
    db.commit()
    db.refresh(gig)
    return gig


@router.put("/{gig_id}", response_model=GigOut)
def update_gig(
    gig_id: int,
    payload: GigUpdate,
    user: User = Depends(require_role(UserRole.CREATOR)),
    db: Session = Depends(get_db),
):
    gig = db.get(Gig, gig_id)
    if not gig or gig.creator_id != user.id:
        raise HTTPException(status_code=404, detail="Gig not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(gig, key, value)
    db.commit()
    db.refresh(gig)
    return gig


@router.delete("/{gig_id}", status_code=204)
def delete_gig(
    gig_id: int,
    user: User = Depends(require_role(UserRole.CREATOR)),
    db: Session = Depends(get_db),
):
    gig = db.get(Gig, gig_id)
    if not gig or gig.creator_id != user.id:
        raise HTTPException(status_code=404, detail="Gig not found")
    db.delete(gig)
    db.commit()
    return None


@router.post("/{gig_id}/save", status_code=201)
def save_gig(
    gig_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    gig = db.get(Gig, gig_id)
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")
    existing = (
        db.query(SavedGig)
        .filter(SavedGig.user_id == user.id, SavedGig.gig_id == gig_id)
        .first()
    )
    if existing:
        return {"saved": True}
    db.add(SavedGig(user_id=user.id, gig_id=gig_id))
    db.commit()
    return {"saved": True}


@router.delete("/{gig_id}/save", status_code=204)
def unsave_gig(
    gig_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = (
        db.query(SavedGig)
        .filter(SavedGig.user_id == user.id, SavedGig.gig_id == gig_id)
        .first()
    )
    if row:
        db.delete(row)
        db.commit()
    return None

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.database import get_db
from app.models.booking import Booking, BookingStatus
from app.models.profile import CreatorProfile
from app.models.review import Review
from app.models.user import User, UserRole
from app.schemas import ReviewCreate, ReviewOut
from app.services.notification_service import notify

router = APIRouter(prefix="/review", tags=["Reviews"])


@router.post("", response_model=ReviewOut, status_code=201)
def create_review(
    payload: ReviewCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    booking = db.get(Booking, payload.booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.status != BookingStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Only completed bookings can be reviewed")
    if user.id != booking.client_id:
        raise HTTPException(status_code=403, detail="Only the client can leave a verified review")
    if booking.review:
        raise HTTPException(status_code=400, detail="Review already exists for this booking")

    review = Review(
        booking_id=booking.id,
        reviewer_id=user.id,
        reviewee_id=booking.creator_id,
        rating=payload.rating,
        feedback=payload.feedback,
        project_verified=True,
    )
    db.add(review)

    profile = db.query(CreatorProfile).filter(CreatorProfile.user_id == booking.creator_id).first()
    if profile:
        total = profile.rating_avg * profile.rating_count + payload.rating
        profile.rating_count += 1
        profile.rating_avg = round(total / profile.rating_count, 2)
        profile.trust_score = min(100.0, profile.trust_score + (payload.rating * 0.8))

    notify(
        db,
        booking.creator_id,
        "New verified review",
        f"You received a {payload.rating}★ review",
        "review",
    )
    db.commit()
    db.refresh(review)
    return review


@router.get("/creator/{creator_id}", response_model=list[ReviewOut])
def list_creator_reviews(creator_id: int, db: Session = Depends(get_db)):
    return (
        db.query(Review)
        .filter(Review.reviewee_id == creator_id)
        .order_by(Review.created_at.desc())
        .all()
    )

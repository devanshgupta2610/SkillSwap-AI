from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.database import get_db
from app.models.booking import Booking, BookingStatus, Milestone
from app.models.gig import Gig
from app.models.profile import CreatorProfile
from app.models.user import User, UserRole
from app.schemas import BookingCreate, BookingOut, BookingUpdate
from app.services.booking_service import can_transition
from app.services.notification_service import notify

router = APIRouter(prefix="/booking", tags=["Booking"])


@router.post("", response_model=BookingOut, status_code=201)
def create_booking(
    payload: BookingCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role != UserRole.CLIENT:
        raise HTTPException(status_code=403, detail="Only clients can create bookings")

    creator = db.get(User, payload.creator_id)
    if not creator or creator.role != UserRole.CREATOR:
        raise HTTPException(status_code=404, detail="Creator not found")

    if payload.gig_id:
        gig = db.get(Gig, payload.gig_id)
        if not gig or gig.creator_id != payload.creator_id:
            raise HTTPException(status_code=400, detail="Invalid gig for creator")
        gig.orders_count += 1

    booking = Booking(
        client_id=user.id,
        creator_id=payload.creator_id,
        gig_id=payload.gig_id,
        job_id=payload.job_id,
        title=payload.title,
        description=payload.description,
        amount=payload.amount,
        status=BookingStatus.PENDING,
    )
    db.add(booking)
    db.flush()

    for m in payload.milestones:
        db.add(
            Milestone(
                booking_id=booking.id,
                title=m.title,
                description=m.description,
                amount=m.amount,
                order_index=m.order_index,
            )
        )

    notify(
        db,
        payload.creator_id,
        "New booking request",
        f"{user.full_name} requested: {payload.title}",
        "booking",
        f"/creator/bookings",
    )
    db.commit()
    db.refresh(booking)
    return booking


@router.get("", response_model=list[BookingOut])
def list_bookings(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Booking)
    if user.role == UserRole.CREATOR:
        q = q.filter(Booking.creator_id == user.id)
    else:
        q = q.filter(Booking.client_id == user.id)
    return q.order_by(Booking.created_at.desc()).all()


@router.get("/{booking_id}", response_model=BookingOut)
def get_booking(booking_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    booking = db.get(Booking, booking_id)
    if not booking or user.id not in {booking.client_id, booking.creator_id}:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


@router.put("/{booking_id}", response_model=BookingOut)
def update_booking(
    booking_id: int,
    payload: BookingUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    booking = db.get(Booking, booking_id)
    if not booking or user.id not in {booking.client_id, booking.creator_id}:
        raise HTTPException(status_code=404, detail="Booking not found")

    if payload.delivery_url is not None:
        if user.id != booking.creator_id:
            raise HTTPException(status_code=403, detail="Only creator can submit delivery")
        booking.delivery_url = payload.delivery_url

    if payload.status:
        try:
            new_status = BookingStatus(payload.status)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Invalid status") from exc

        if not can_transition(booking.status, new_status):
            raise HTTPException(
                status_code=400,
                detail=f"Cannot transition from {booking.status.value} to {new_status.value}",
            )

        # Role guards for transitions
        if new_status == BookingStatus.ACCEPTED and user.id != booking.creator_id:
            raise HTTPException(status_code=403, detail="Only creator can accept")
        if new_status == BookingStatus.COMPLETED and user.id != booking.client_id:
            raise HTTPException(status_code=403, detail="Only client can mark completed")
        if new_status == BookingStatus.SUBMITTED and user.id != booking.creator_id:
            raise HTTPException(status_code=403, detail="Only creator can submit")

        booking.status = new_status

        if new_status == BookingStatus.COMPLETED:
            profile = db.query(CreatorProfile).filter(CreatorProfile.user_id == booking.creator_id).first()
            if profile:
                profile.completed_projects += 1
                profile.trust_score = min(100.0, profile.trust_score + 2.0)
            for milestone in booking.milestones:
                milestone.is_completed = True

        other = booking.client_id if user.id == booking.creator_id else booking.creator_id
        notify(
            db,
            other,
            "Booking updated",
            f"Booking '{booking.title}' is now {booking.status.value}",
            "booking",
        )

    db.commit()
    db.refresh(booking)
    return booking

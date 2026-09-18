from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user, require_role
from app.database import get_db
from app.models.booking import Booking, BookingStatus
from app.models.gig import Gig
from app.models.portfolio import PortfolioProject
from app.models.profile import CreatorProfile
from app.models.user import User, UserRole
from app.schemas import CreatorProfileOut, CreatorProfileUpdate, DashboardStats, PortfolioCreate, PortfolioOut
from app.services.ai_service import ai_service
from app.services.storage import upload_file
from fastapi import File, Form, UploadFile

router = APIRouter(prefix="/creator", tags=["Creator"])


@router.get("/profile", response_model=CreatorProfileOut)
def get_profile(
    user: User = Depends(require_role(UserRole.CREATOR)),
    db: Session = Depends(get_db),
):
    profile = db.query(CreatorProfile).filter(CreatorProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Creator profile not found")
    return profile


@router.put("/profile", response_model=CreatorProfileOut)
def update_profile(
    payload: CreatorProfileUpdate,
    user: User = Depends(require_role(UserRole.CREATOR)),
    db: Session = Depends(get_db),
):
    profile = db.query(CreatorProfile).filter(CreatorProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Creator profile not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, key, value)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/dashboard", response_model=DashboardStats)
def dashboard(
    user: User = Depends(require_role(UserRole.CREATOR)),
    db: Session = Depends(get_db),
):
    profile = db.query(CreatorProfile).filter(CreatorProfile.user_id == user.id).first()
    earnings = (
        db.query(func.coalesce(func.sum(Booking.amount), 0.0))
        .filter(Booking.creator_id == user.id, Booking.status == BookingStatus.COMPLETED)
        .scalar()
    )
    active = (
        db.query(func.count(Booking.id))
        .filter(
            Booking.creator_id == user.id,
            Booking.status.in_(
                [BookingStatus.PENDING, BookingStatus.ACCEPTED, BookingStatus.IN_PROGRESS, BookingStatus.SUBMITTED]
            ),
        )
        .scalar()
    )
    completed = (
        db.query(func.count(Booking.id))
        .filter(Booking.creator_id == user.id, Booking.status == BookingStatus.COMPLETED)
        .scalar()
    )
    portfolio_count = db.query(func.count(PortfolioProject.id)).filter(PortfolioProject.creator_id == user.id).scalar()
    gig_count = db.query(func.count(Gig.id)).filter(Gig.creator_id == user.id).scalar()

    return DashboardStats(
        total_earnings=float(earnings or 0),
        active_bookings=int(active or 0),
        completed_bookings=int(completed or 0),
        avg_rating=float(profile.rating_avg if profile else 0),
        portfolio_count=int(portfolio_count or 0),
        gig_count=int(gig_count or 0),
    )


@router.post("/portfolio", response_model=PortfolioOut, status_code=201)
async def create_portfolio(
    payload: PortfolioCreate,
    user: User = Depends(require_role(UserRole.CREATOR)),
    db: Session = Depends(get_db),
):
    profile = db.query(CreatorProfile).filter(CreatorProfile.user_id == user.id).first()
    generated = {
        "title": payload.title,
        "description": payload.description or payload.project_details,
        "skills_used": payload.skills_used,
        "tools_used": payload.tools_used,
    }
    ai_generated = False
    if payload.use_ai:
        generated = await ai_service.generate_portfolio(
            payload.project_details,
            existing_skills=(profile.skills if profile else []) or payload.skills_used,
        )
        ai_generated = True

    project = PortfolioProject(
        creator_id=user.id,
        title=payload.title or generated["title"],
        description=payload.description or generated["description"],
        skills_used=payload.skills_used or generated["skills_used"],
        tools_used=payload.tools_used or generated["tools_used"],
        image_url=payload.image_url,
        pdf_url=payload.pdf_url,
        project_url=payload.project_url,
        ai_generated=ai_generated,
        raw_input=payload.project_details,
    )
    db.add(project)
    if profile:
        merged = list({*(profile.skills or []), *(project.skills_used or [])})
        profile.skills = merged
    db.commit()
    db.refresh(project)
    return project


@router.get("/portfolio", response_model=list[PortfolioOut])
def list_portfolio(
    user: User = Depends(require_role(UserRole.CREATOR)),
    db: Session = Depends(get_db),
):
    return (
        db.query(PortfolioProject)
        .filter(PortfolioProject.creator_id == user.id)
        .order_by(PortfolioProject.created_at.desc())
        .all()
    )


@router.post("/upload")
async def upload(
    file: UploadFile = File(...),
    kind: str = Form("image"),
    user: User = Depends(require_role(UserRole.CREATOR)),
):
    result = await upload_file(file, folder=f"skillswap/{user.id}/{kind}")
    return result


@router.get("/analytics")
def analytics(
    user: User = Depends(require_role(UserRole.CREATOR)),
    db: Session = Depends(get_db),
):
    gigs = db.query(Gig).filter(Gig.creator_id == user.id).all()
    bookings = db.query(Booking).filter(Booking.creator_id == user.id).all()
    by_status: dict[str, int] = {}
    for b in bookings:
        by_status[b.status.value] = by_status.get(b.status.value, 0) + 1
    return {
        "views": sum(g.views for g in gigs),
        "orders": sum(g.orders_count for g in gigs),
        "bookings_by_status": by_status,
        "revenue_completed": sum(b.amount for b in bookings if b.status == BookingStatus.COMPLETED),
    }

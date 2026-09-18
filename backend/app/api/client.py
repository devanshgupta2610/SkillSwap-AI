from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth.deps import require_role
from app.database import get_db
from app.models.booking import Booking, BookingStatus
from app.models.job import Job, SavedCreator, SavedJob
from app.models.portfolio import PortfolioProject
from app.models.profile import ClientProfile, CreatorProfile
from app.models.user import User, UserRole
from app.schemas import (
    ClientProfileOut,
    ClientProfileUpdate,
    DashboardStats,
    JobCreate,
    JobOut,
    MatchResult,
)
from app.services.ai_service import ai_service
from app.services.notification_service import notify

router = APIRouter(prefix="/client", tags=["Client"])


@router.get("/profile", response_model=ClientProfileOut)
def get_profile(
    user: User = Depends(require_role(UserRole.CLIENT)),
    db: Session = Depends(get_db),
):
    profile = db.query(ClientProfile).filter(ClientProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Client profile not found")
    return profile


@router.put("/profile", response_model=ClientProfileOut)
def update_profile(
    payload: ClientProfileUpdate,
    user: User = Depends(require_role(UserRole.CLIENT)),
    db: Session = Depends(get_db),
):
    profile = db.query(ClientProfile).filter(ClientProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Client profile not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, key, value)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/dashboard", response_model=DashboardStats)
def dashboard(
    user: User = Depends(require_role(UserRole.CLIENT)),
    db: Session = Depends(get_db),
):
    active = (
        db.query(func.count(Booking.id))
        .filter(
            Booking.client_id == user.id,
            Booking.status.in_(
                [BookingStatus.PENDING, BookingStatus.ACCEPTED, BookingStatus.IN_PROGRESS, BookingStatus.SUBMITTED]
            ),
        )
        .scalar()
    )
    completed = (
        db.query(func.count(Booking.id))
        .filter(Booking.client_id == user.id, Booking.status == BookingStatus.COMPLETED)
        .scalar()
    )
    open_jobs = db.query(func.count(Job.id)).filter(Job.client_id == user.id, Job.status == "open").scalar()
    saved = db.query(func.count(SavedCreator.id)).filter(SavedCreator.client_id == user.id).scalar()
    spent = (
        db.query(func.coalesce(func.sum(Booking.amount), 0.0))
        .filter(Booking.client_id == user.id, Booking.status == BookingStatus.COMPLETED)
        .scalar()
    )
    return DashboardStats(
        total_earnings=float(spent or 0),
        active_bookings=int(active or 0),
        completed_bookings=int(completed or 0),
        open_jobs=int(open_jobs or 0),
        saved_items=int(saved or 0),
    )


@router.post("/jobs", response_model=JobOut, status_code=201)
def create_job(
    payload: JobCreate,
    user: User = Depends(require_role(UserRole.CLIENT)),
    db: Session = Depends(get_db),
):
    job = Job(client_id=user.id, **payload.model_dump())
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.get("/jobs", response_model=list[JobOut])
def list_jobs(
    user: User = Depends(require_role(UserRole.CLIENT)),
    db: Session = Depends(get_db),
):
    return db.query(Job).filter(Job.client_id == user.id).order_by(Job.created_at.desc()).all()


@router.get("/jobs/{job_id}/matches", response_model=list[MatchResult])
def match_job(
    job_id: int,
    user: User = Depends(require_role(UserRole.CLIENT)),
    db: Session = Depends(get_db),
):
    job = db.get(Job, job_id)
    if not job or job.client_id != user.id:
        raise HTTPException(status_code=404, detail="Job not found")

    creators = db.query(CreatorProfile, User).join(User, User.id == CreatorProfile.user_id).all()
    creator_payload = []
    for profile, u in creators:
        projects = (
            db.query(PortfolioProject)
            .filter(PortfolioProject.creator_id == u.id)
            .limit(10)
            .all()
        )
        creator_payload.append(
            {
                "user_id": u.id,
                "full_name": u.full_name,
                "headline": profile.headline,
                "skills": profile.skills or [],
                "tags": profile.tags or [],
                "experience_years": profile.experience_years,
                "trust_score": profile.trust_score,
                "rating_avg": profile.rating_avg,
                "portfolio_texts": [f"{p.title} {p.description}" for p in projects],
            }
        )

    matches = ai_service.match_creators(
        {
            "title": job.title,
            "description": job.description,
            "required_skills": job.required_skills or [],
            "tags": job.tags or [],
        },
        creator_payload,
    )
    return matches[:20]


@router.get("/creators")
def browse_creators(
    q: str | None = None,
    skill: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.CLIENT)),
):
    rows = db.query(CreatorProfile, User).join(User, User.id == CreatorProfile.user_id).all()
    results = []
    for profile, u in rows:
        if q and q.lower() not in (u.full_name.lower() + " " + (profile.headline or "").lower()):
            continue
        if skill and skill.lower() not in [s.lower() for s in (profile.skills or [])]:
            continue
        results.append(
            {
                "id": u.id,
                "full_name": u.full_name,
                "avatar_url": u.avatar_url,
                "headline": profile.headline,
                "skills": profile.skills,
                "rating_avg": profile.rating_avg,
                "trust_score": profile.trust_score,
                "hourly_rate": profile.hourly_rate,
                "location": profile.location,
            }
        )
    return results


@router.get("/creators/{creator_id}")
def creator_public_profile(creator_id: int, db: Session = Depends(get_db)):
    user = db.get(User, creator_id)
    profile = db.query(CreatorProfile).filter(CreatorProfile.user_id == creator_id).first()
    if not user or not profile or user.role != UserRole.CREATOR:
        raise HTTPException(status_code=404, detail="Creator not found")
    portfolio = (
        db.query(PortfolioProject)
        .filter(PortfolioProject.creator_id == creator_id)
        .order_by(PortfolioProject.created_at.desc())
        .all()
    )
    return {
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "avatar_url": user.avatar_url,
        },
        "profile": {
            "headline": profile.headline,
            "bio": profile.bio,
            "skills": profile.skills,
            "tools": profile.tools,
            "experience_years": profile.experience_years,
            "hourly_rate": profile.hourly_rate,
            "rating_avg": profile.rating_avg,
            "rating_count": profile.rating_count,
            "trust_score": profile.trust_score,
            "completed_projects": profile.completed_projects,
            "location": profile.location,
        },
        "portfolio": [
            {
                "id": p.id,
                "title": p.title,
                "description": p.description,
                "skills_used": p.skills_used,
                "tools_used": p.tools_used,
                "image_url": p.image_url,
                "ai_generated": p.ai_generated,
            }
            for p in portfolio
        ],
    }


@router.post("/creators/{creator_id}/save", status_code=201)
def save_creator(
    creator_id: int,
    user: User = Depends(require_role(UserRole.CLIENT)),
    db: Session = Depends(get_db),
):
    if creator_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot save yourself")
    existing = (
        db.query(SavedCreator)
        .filter(SavedCreator.client_id == user.id, SavedCreator.creator_id == creator_id)
        .first()
    )
    if not existing:
        db.add(SavedCreator(client_id=user.id, creator_id=creator_id))
        notify(db, creator_id, "You were saved", f"{user.full_name} saved your profile", "social")
        db.commit()
    return {"saved": True}


@router.post("/jobs/{job_id}/save", status_code=201)
def save_job(
    job_id: int,
    user: User = Depends(require_role(UserRole.CREATOR)),
    db: Session = Depends(get_db),
):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    existing = db.query(SavedJob).filter(SavedJob.user_id == user.id, SavedJob.job_id == job_id).first()
    if not existing:
        db.add(SavedJob(user_id=user.id, job_id=job_id))
        db.commit()
    return {"saved": True}


@router.get("/analytics")
def analytics(
    user: User = Depends(require_role(UserRole.CLIENT)),
    db: Session = Depends(get_db),
):
    bookings = db.query(Booking).filter(Booking.client_id == user.id).all()
    jobs = db.query(Job).filter(Job.client_id == user.id).all()
    return {
        "jobs_posted": len(jobs),
        "bookings": len(bookings),
        "spend_completed": sum(b.amount for b in bookings if b.status == BookingStatus.COMPLETED),
        "active": sum(
            1
            for b in bookings
            if b.status
            in {BookingStatus.PENDING, BookingStatus.ACCEPTED, BookingStatus.IN_PROGRESS, BookingStatus.SUBMITTED}
        ),
    }

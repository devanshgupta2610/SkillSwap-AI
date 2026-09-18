"""Seed SkillSwap AI with demo creator + client accounts and sample data.

Usage (from backend/ with venv active):
    python -m app.seed
"""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.auth.security import hash_password
from app.database import SessionLocal, init_db
from app.models.booking import Booking, BookingStatus, Milestone
from app.models.gig import Gig
from app.models.job import Job
from app.models.portfolio import PortfolioProject
from app.models.profile import ClientProfile, CreatorProfile
from app.models.review import Review
from app.models.user import User, UserRole


DEMO_PASSWORD = "Demo@12345"


def _get_or_create_user(
    db: Session,
    *,
    email: str,
    full_name: str,
    role: UserRole,
) -> User:
    user = db.query(User).filter(User.email == email).first()
    if user:
        return user
    user = User(
        email=email,
        full_name=full_name,
        role=role,
        hashed_password=hash_password(DEMO_PASSWORD),
        is_active=True,
    )
    db.add(user)
    db.flush()
    if role == UserRole.CREATOR:
        db.add(CreatorProfile(user_id=user.id))
    else:
        db.add(ClientProfile(user_id=user.id))
    db.flush()
    return user


def seed(db: Session) -> None:
    creator = _get_or_create_user(
        db,
        email="creator@skillswap.ai",
        full_name="Aanya Sharma",
        role=UserRole.CREATOR,
    )
    creator2 = _get_or_create_user(
        db,
        email="creator2@skillswap.ai",
        full_name="Rohan Mehta",
        role=UserRole.CREATOR,
    )
    client = _get_or_create_user(
        db,
        email="client@skillswap.ai",
        full_name="Neha Kapoor",
        role=UserRole.CLIENT,
    )

    profile = db.query(CreatorProfile).filter(CreatorProfile.user_id == creator.id).first()
    if profile:
        profile.headline = "Product designer · SIH finalist"
        profile.bio = "I design student-friendly SaaS products with crisp systems and motion."
        profile.skills = ["Figma", "UI Design", "Design Systems", "Prototyping"]
        profile.tags = ["saas", "edtech", "mobile"]
        profile.tools = ["Figma", "FigJam", "Framer"]
        profile.experience_years = 2.5
        profile.hourly_rate = 800
        profile.location = "Bengaluru"
        profile.trust_score = 82
        profile.rating_avg = 4.8
        profile.rating_count = 1
        profile.completed_projects = 1

    profile2 = db.query(CreatorProfile).filter(CreatorProfile.user_id == creator2.id).first()
    if profile2:
        profile2.headline = "Full-stack engineer · React + FastAPI"
        profile2.bio = "Shipping production APIs and polished frontends for campus startups."
        profile2.skills = ["React", "TypeScript", "FastAPI", "PostgreSQL"]
        profile2.tags = ["web", "ai", "hackathon"]
        profile2.tools = ["VS Code", "Docker", "Git"]
        profile2.experience_years = 3.0
        profile2.hourly_rate = 1200
        profile2.location = "Pune"
        profile2.trust_score = 76

    client_profile = db.query(ClientProfile).filter(ClientProfile.user_id == client.id).first()
    if client_profile:
        client_profile.company_name = "CampusLaunch Labs"
        client_profile.industry = "EdTech"
        client_profile.bio = "We hire student creators for MVPs and hackathon demos."
        client_profile.location = "Mumbai"

    if not db.query(PortfolioProject).filter(PortfolioProject.creator_id == creator.id).first():
        db.add(
            PortfolioProject(
                creator_id=creator.id,
                title="SkillSwap Concept OS",
                description=(
                    "End-to-end dark SaaS concept for an AI creator marketplace with glass panels, "
                    "trust-weighted match cards, and milestone booking flows."
                ),
                skills_used=["UI Design", "Design Systems", "Prototyping"],
                tools_used=["Figma", "Framer"],
                ai_generated=True,
                raw_input="SIH Track 2 marketplace UI exploration",
                image_url="https://placehold.co/800x500/0B0B0F/4F7FFF?text=SkillSwap+UI",
            )
        )

    if not db.query(PortfolioProject).filter(PortfolioProject.creator_id == creator2.id).first():
        db.add(
            PortfolioProject(
                creator_id=creator2.id,
                title="Realtime Match API",
                description=(
                    "FastAPI service that scores creators using skills, portfolio text similarity, "
                    "and trust signals instead of lowest-price ranking."
                ),
                skills_used=["FastAPI", "PostgreSQL", "Matching Algorithms"],
                tools_used=["Python", "SQLAlchemy"],
                ai_generated=True,
                raw_input="Talent match microservice for student marketplace",
            )
        )

    if not db.query(Gig).filter(Gig.creator_id == creator.id).first():
        db.add(
            Gig(
                creator_id=creator.id,
                title="AI-ready SaaS landing + dashboard UI",
                description=(
                    "I'll design a premium dark landing page and dashboard shell optimized for "
                    "student-creator marketplaces, including component states and handoff notes."
                ),
                category="design",
                tags=["figma", "saas", "dashboard"],
                price=6500,
                delivery_days=5,
                cover_image="https://placehold.co/800x500/0B0B0F/4F7FFF?text=Gig+Design",
            )
        )

    if not db.query(Gig).filter(Gig.creator_id == creator2.id).first():
        db.add(
            Gig(
                creator_id=creator2.id,
                title="FastAPI MVP backend with JWT auth",
                description=(
                    "Production-minded FastAPI backend with auth, Postgres models, and clean "
                    "service modules for marketplace features."
                ),
                category="development",
                tags=["fastapi", "jwt", "postgres"],
                price=12000,
                delivery_days=10,
            )
        )

    job = db.query(Job).filter(Job.client_id == client.id).first()
    if not job:
        job = Job(
            client_id=client.id,
            title="Need UI + API for student skill marketplace",
            description=(
                "Looking for creators who can design and/or build an AI portfolio marketplace "
                "with trust-weighted matching and milestone bookings."
            ),
            required_skills=["Figma", "React", "FastAPI"],
            tags=["saas", "ai", "edtech"],
            budget_min=5000,
            budget_max=25000,
            status="open",
        )
        db.add(job)
        db.flush()

    booking = (
        db.query(Booking)
        .filter(Booking.client_id == client.id, Booking.creator_id == creator.id)
        .first()
    )
    if not booking:
        booking = Booking(
            client_id=client.id,
            creator_id=creator.id,
            title="Marketplace UI kit",
            description="Landing + dashboard screens for SIH demo",
            amount=6500,
            status=BookingStatus.COMPLETED,
        )
        db.add(booking)
        db.flush()
        db.add_all(
            [
                Milestone(
                    booking_id=booking.id,
                    title="Wireframes",
                    amount=2000,
                    order_index=0,
                    is_completed=True,
                ),
                Milestone(
                    booking_id=booking.id,
                    title="Final UI kit",
                    amount=4500,
                    order_index=1,
                    is_completed=True,
                ),
            ]
        )

    if not db.query(Review).filter(Review.booking_id == booking.id).first():
        db.add(
            Review(
                booking_id=booking.id,
                reviewer_id=client.id,
                reviewee_id=creator.id,
                rating=5,
                feedback="Exceptional SIH-ready UI. Clear systems and fast delivery.",
                project_verified=True,
            )
        )

    db.commit()
    print("Seed complete.")
    print("")
    print("Demo accounts (password for all):", DEMO_PASSWORD)
    print("  Creator : creator@skillswap.ai")
    print("  Creator : creator2@skillswap.ai")
    print("  Client  : client@skillswap.ai")


def main() -> None:
    init_db()
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()

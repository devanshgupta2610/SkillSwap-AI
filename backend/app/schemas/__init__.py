from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.user import UserRole


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: UserRole
    user_id: int


class RefreshRequest(BaseModel):
    refresh_token: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=2, max_length=150)
    role: UserRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    role: UserRole
    avatar_url: str | None = None
    is_active: bool
    created_at: datetime


class CreatorProfileUpdate(BaseModel):
    headline: str | None = None
    bio: str | None = None
    skills: list[str] | None = None
    tags: list[str] | None = None
    tools: list[str] | None = None
    experience_years: float | None = None
    hourly_rate: float | None = None
    location: str | None = None
    availability: str | None = None


class CreatorProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    headline: str | None = None
    bio: str | None = None
    skills: list[Any] = []
    tags: list[Any] = []
    tools: list[Any] = []
    experience_years: float
    hourly_rate: float | None = None
    location: str | None = None
    availability: str
    rating_avg: float
    rating_count: int
    completed_projects: int
    response_rate: float
    trust_score: float


class ClientProfileUpdate(BaseModel):
    company_name: str | None = None
    bio: str | None = None
    industry: str | None = None
    location: str | None = None
    website: str | None = None


class ClientProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    company_name: str | None = None
    bio: str | None = None
    industry: str | None = None
    location: str | None = None
    website: str | None = None


class PortfolioCreate(BaseModel):
    title: str | None = None
    description: str | None = None
    skills_used: list[str] = []
    tools_used: list[str] = []
    project_details: str = Field(min_length=10)
    image_url: str | None = None
    pdf_url: str | None = None
    project_url: str | None = None
    use_ai: bool = True


class PortfolioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    creator_id: int
    title: str
    description: str
    skills_used: list[Any]
    tools_used: list[Any]
    image_url: str | None = None
    pdf_url: str | None = None
    project_url: str | None = None
    ai_generated: bool
    created_at: datetime


class GigCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=20)
    category: str
    tags: list[str] = []
    price: float = Field(gt=0)
    delivery_days: int = Field(ge=1, le=365)
    cover_image: str | None = None


class GigUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    tags: list[str] | None = None
    price: float | None = Field(default=None, gt=0)
    delivery_days: int | None = Field(default=None, ge=1, le=365)
    cover_image: str | None = None
    is_active: bool | None = None


class GigOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    creator_id: int
    title: str
    description: str
    category: str
    tags: list[Any]
    price: float
    delivery_days: int
    is_active: bool
    cover_image: str | None = None
    views: int
    orders_count: int
    created_at: datetime


class JobCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=20)
    required_skills: list[str] = []
    tags: list[str] = []
    budget_min: float | None = None
    budget_max: float | None = None


class JobOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    client_id: int
    title: str
    description: str
    required_skills: list[Any]
    tags: list[Any]
    budget_min: float | None = None
    budget_max: float | None = None
    status: str
    created_at: datetime


class MilestoneIn(BaseModel):
    title: str
    description: str | None = None
    amount: float = 0
    order_index: int = 0


class BookingCreate(BaseModel):
    creator_id: int
    gig_id: int | None = None
    job_id: int | None = None
    title: str
    description: str | None = None
    amount: float = Field(gt=0)
    milestones: list[MilestoneIn] = []


class BookingUpdate(BaseModel):
    status: str | None = None
    delivery_url: str | None = None


class MilestoneOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None = None
    amount: float
    is_completed: bool
    order_index: int


class BookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    client_id: int
    creator_id: int
    gig_id: int | None = None
    job_id: int | None = None
    title: str
    description: str | None = None
    amount: float
    status: str
    delivery_url: str | None = None
    created_at: datetime
    milestones: list[MilestoneOut] = []


class ReviewCreate(BaseModel):
    booking_id: int
    rating: int = Field(ge=1, le=5)
    feedback: str = Field(min_length=10, max_length=2000)


class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    booking_id: int
    reviewer_id: int
    reviewee_id: int
    rating: int
    feedback: str
    project_verified: bool
    created_at: datetime


class MatchResult(BaseModel):
    creator_id: int
    full_name: str
    headline: str | None = None
    compatibility_score: float
    matching_reasons: list[str]
    trust_score: float
    rating_avg: float
    skills: list[Any] = []


class MessageCreate(BaseModel):
    recipient_id: int
    content: str = Field(min_length=1, max_length=5000)
    booking_id: int | None = None


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    conversation_id: int
    sender_id: int
    content: str
    is_read: bool
    created_at: datetime


class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    body: str
    type: str
    link: str | None = None
    is_read: bool
    created_at: datetime


class DashboardStats(BaseModel):
    total_earnings: float = 0
    active_bookings: int = 0
    completed_bookings: int = 0
    avg_rating: float = 0
    portfolio_count: int = 0
    gig_count: int = 0
    open_jobs: int = 0
    saved_items: int = 0

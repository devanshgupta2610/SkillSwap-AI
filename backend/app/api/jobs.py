from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.auth.deps import require_role
from app.database import get_db
from app.models.job import Job
from app.models.user import User, UserRole
from app.schemas import JobCreate, JobOut

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.post("", response_model=JobOut, status_code=201)
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


@router.get("", response_model=list[JobOut])
def list_jobs(
    mine: bool = Query(False),
    status: str | None = Query(None),
    user: User = Depends(require_role(UserRole.CLIENT, UserRole.CREATOR)),
    db: Session = Depends(get_db),
):
    q = db.query(Job)
    if mine and user.role == UserRole.CLIENT:
        q = q.filter(Job.client_id == user.id)
    elif user.role == UserRole.CREATOR:
        q = q.filter(Job.status == "open")
    else:
        q = q.filter(Job.client_id == user.id)
    if status:
        q = q.filter(Job.status == status)
    return q.order_by(Job.created_at.desc()).all()

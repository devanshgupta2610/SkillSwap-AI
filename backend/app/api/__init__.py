from fastapi import APIRouter

from app.api import auth, booking, chat, client, creator, gigs, jobs, review, shared

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(creator.router)
api_router.include_router(gigs.router)
api_router.include_router(client.router)
api_router.include_router(jobs.router)
api_router.include_router(booking.router)
api_router.include_router(review.router)
api_router.include_router(chat.router)
api_router.include_router(shared.router)

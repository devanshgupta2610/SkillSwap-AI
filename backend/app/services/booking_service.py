from app.models.booking import BookingStatus

ALLOWED_TRANSITIONS: dict[BookingStatus, set[BookingStatus]] = {
    BookingStatus.PENDING: {BookingStatus.ACCEPTED, BookingStatus.CANCELLED},
    BookingStatus.ACCEPTED: {BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED},
    BookingStatus.IN_PROGRESS: {BookingStatus.SUBMITTED, BookingStatus.CANCELLED},
    BookingStatus.SUBMITTED: {BookingStatus.COMPLETED, BookingStatus.IN_PROGRESS},
    BookingStatus.COMPLETED: set(),
    BookingStatus.CANCELLED: set(),
}


def can_transition(current: BookingStatus, new: BookingStatus) -> bool:
    return new in ALLOWED_TRANSITIONS.get(current, set())

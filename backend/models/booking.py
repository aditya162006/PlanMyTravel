import uuid
from datetime import datetime, timezone
from backend.database import db


class Booking(db.Model):
    __tablename__ = "bookings"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    booking_reference = db.Column(db.String(50), unique=True, index=True, default=lambda: f"PMT-{uuid.uuid4().hex[:8].upper()}")
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    trip_id = db.Column(db.String(64), db.ForeignKey("trips.id", ondelete="SET NULL"), nullable=True)
    package_id = db.Column(db.Integer, nullable=True)
    departure_id = db.Column(db.Integer, nullable=True)
    status = db.Column(db.String(50), nullable=False, default="pending")  # pending, confirmed, cancelled, completed
    travelers_count = db.Column(db.Integer, nullable=False, default=1)
    total_amount = db.Column(db.Float, nullable=False, default=0.0)
    currency = db.Column(db.String(10), nullable=False, default="INR")
    contact_name = db.Column(db.String(150), nullable=True)
    contact_email = db.Column(db.String(150), nullable=True)
    contact_phone = db.Column(db.String(50), nullable=True)
    payment_status = db.Column(db.String(50), nullable=False, default="unpaid")  # unpaid, authorized, paid, refunded, failed
    booked_at = db.Column(db.String(50), nullable=False, default=lambda: datetime.now(timezone.utc).isoformat())
    created_at = db.Column(db.String(50), nullable=False, default=lambda: datetime.now(timezone.utc).isoformat())
    updated_at = db.Column(db.String(50), nullable=False, default=lambda: datetime.now(timezone.utc).isoformat(), onupdate=lambda: datetime.now(timezone.utc).isoformat())

    def to_dict(self):
        return {
            "id": self.id,
            "booking_reference": self.booking_reference,
            "user_id": self.user_id,
            "trip_id": self.trip_id,
            "status": self.status,
            "travelers_count": self.travelers_count,
            "total_amount": round(self.total_amount, 2),
            "currency": self.currency,
            "contact_name": self.contact_name,
            "contact_email": self.contact_email,
            "payment_status": self.payment_status,
            "booked_at": self.booked_at,
            "created_at": self.created_at,
        }


class Expense(db.Model):
    __tablename__ = "expenses"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    trip_id = db.Column(db.String(64), db.ForeignKey("trips.id", ondelete="SET NULL"), nullable=True)
    booking_id = db.Column(db.Integer, db.ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True)
    title = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(10), nullable=False, default="INR")
    category = db.Column(db.String(50), nullable=True)
    spent_at = db.Column(db.String(50), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    paid_with_wallet = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.String(50), nullable=False, default=lambda: datetime.now(timezone.utc).isoformat())
    updated_at = db.Column(db.String(50), nullable=False, default=lambda: datetime.now(timezone.utc).isoformat(), onupdate=lambda: datetime.now(timezone.utc).isoformat())

    def to_dict(self):
        paid = bool(self.paid_with_wallet) or ('[Paid via Wallet]' in (self.notes or ''))
        return {
            "id": self.id,
            "user_id": self.user_id,
            "trip_id": self.trip_id,
            "booking_id": self.booking_id,
            "title": self.title,
            "amount": round(self.amount, 2),
            "currency": self.currency,
            "category": self.category or "General",
            "spent_at": self.spent_at or self.created_at,
            "notes": self.notes,
            "paid_with_wallet": paid,
            "created_at": self.created_at,
        }


class Review(db.Model):
    __tablename__ = "reviews"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    destination_id = db.Column(db.Integer, db.ForeignKey("destinations.id", ondelete="CASCADE"), nullable=True)
    stay_id = db.Column(db.String(100), nullable=True, index=True)
    guide_id = db.Column(db.Integer, db.ForeignKey("guides.id", ondelete="CASCADE"), nullable=True, index=True)
    package_id = db.Column(db.Integer, nullable=True)
    trip_id = db.Column(db.String(64), db.ForeignKey("trips.id", ondelete="SET NULL"), nullable=True)
    rating = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(200), nullable=True)
    body = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), nullable=False, default="published")
    is_verified = db.Column(db.Integer, nullable=False, default=1)
    created_at = db.Column(db.String(50), nullable=False, default=lambda: datetime.now(timezone.utc).isoformat())
    updated_at = db.Column(db.String(50), nullable=False, default=lambda: datetime.now(timezone.utc).isoformat(), onupdate=lambda: datetime.now(timezone.utc).isoformat())

    # User relationship
    user = db.relationship("User", backref="user_reviews", lazy="joined")

    def to_dict(self):
        diverse_names = [
            "Elena Rostova", "Sophia Montgomery", "Rajesh Khurana",
            "Clara Dupont", "Liam O'Connor", "Mei-Ling Zhou",
            "Julian Vance", "Aarav Patel", "Charlotte Bennett", "Mateo Silva"
        ]
        user_name = "Verified Traveler"
        if self.user and self.user.name and self.user.name not in ["Taylor Traveler", "Test Traveller"]:
            user_name = self.user.name or self.user.full_name or "Verified Traveler"
        else:
            user_name = diverse_names[self.id % len(diverse_names)]
        return {
            "id": self.id,
            "user_id": self.user_id,
            "user_name": user_name,
            "stay_id": self.stay_id,
            "guide_id": self.guide_id,
            "destination_id": self.destination_id,
            "rating": self.rating,
            "title": self.title,
            "body": self.body,
            "is_verified": bool(self.is_verified),
            "created_at": self.created_at,
        }


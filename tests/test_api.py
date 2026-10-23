import pytest
import time
import random
import json
from backend.app import create_app
from backend.database import db
from backend.models.user import User, AdminUser
from backend.models.destination import Destination
from backend.models.wallet import Wallet
from backend.models.booking import Booking
from backend.services.payment_service import PaymentService
from backend.services.wallet_service import WalletService
from backend.services.hotel_service import HotelService
from backend.services.flight_service import FlightService
from backend.services.ai_travel_service import AITravelService


@pytest.fixture
def app():
    app = create_app()
    app.config["TESTING"] = True
    yield app


@pytest.fixture
def client(app):
    return app.test_client()


def get_authenticated_client(client, email=None, password="Password123!"):
    """Helper to register and login user with CSRF token."""
    user_email = email or f"traveler_{random.randint(10000, 999999)}@planmytravel.com"
    res = client.post("/api/auth/register", json={
        "email": user_email,
        "password": password,
        "name": "Test Traveller"
    })
    csrf = res.get_json().get("csrf_token", "")
    return client, csrf


def test_health_check(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert "integrations" in data


def test_destination_listing_and_filtering(client):
    res = client.get("/api/destinations")
    assert res.status_code == 200
    data = res.get_json()
    assert data["total"] > 0
    assert len(data["destinations"]) > 0

    # Test keyword query
    res_q = client.get("/api/destinations?q=Singapore")
    assert res_q.status_code == 200
    data_q = res_q.get_json()
    assert any("Singapore" in d["name"] for d in data_q["destinations"])

    # Test single destination details
    res_single = client.get("/api/destinations/singapore")
    assert res_single.status_code == 200
    data_single = res_single.get_json()
    assert data_single["name"] == "Singapore"
    assert "related_stays" in data_single


def test_stays_discovery_and_hotelbeds_adapter(client):
    res = client.get("/api/stays")
    assert res.status_code == 200
    data = res.get_json()
    assert "stays" in data
    assert len(data["stays"]) > 0
    first_stay = data["stays"][0]
    assert "nightly_rate" in first_stay
    assert "amenities" in first_stay
    assert "is_verified_provider" in first_stay


def test_flights_discovery_adapter(client):
    res = client.get("/api/flights/search?origin=DEL&destination=SIN")
    assert res.status_code == 200
    data = res.get_json()
    assert "outbound" in data
    assert len(data["outbound"]) > 0
    assert "Singapore Airlines" in [f["airline"] for f in data["outbound"]]


def test_csrf_protection_blocks_unsigned_mutations(client):
    # Attempting POST without CSRF token must return 403
    res = client.post("/api/trips", json={"title": "Unauthorized Trip"})
    assert res.status_code in (401, 403)


def test_auth_workflow_and_session(client):
    email = f"user_{random.randint(10000, 999999)}@test.com"
    reg_res = client.post("/api/auth/register", json={
        "email": email,
        "password": "Password123!",
        "name": "Jane Explorer"
    })
    assert reg_res.status_code == 201
    csrf_token = reg_res.get_json()["csrf_token"]

    # Check /api/auth/me
    me_res = client.get("/api/auth/me")
    assert me_res.status_code == 200
    assert me_res.get_json()["authenticated"] is True
    assert me_res.get_json()["user"]["email"] == email

    # Logout
    logout_res = client.post("/api/auth/logout", headers={"X-CSRF-Token": csrf_token})
    assert logout_res.status_code == 200

    # Verify session cleared
    me_res_after = client.get("/api/auth/me")
    assert me_res_after.get_json()["authenticated"] is False


def test_wallet_order_creation_validation(client):
    auth_client, csrf = get_authenticated_client(client, f"wallet_val_{random.randint(1000, 99999)}@test.com")
    headers = {"X-CSRF-Token": csrf}

    # Invalid negative or zero amount
    res_zero = auth_client.post("/api/wallet/create-order", json={"amount": 0}, headers=headers)
    assert res_zero.status_code == 400

    # Valid amount
    res_valid = auth_client.post("/api/wallet/create-order", json={"amount": 2500}, headers=headers)
    assert res_valid.status_code == 200
    order_data = res_valid.get_json()["order"]
    assert order_data["amount"] == 250000  # 2500 INR = 250,000 paise


def test_wallet_credit_and_idempotent_deduplication(app):
    with app.app_context():
        # Create test user
        unique_email = f"ledger_test_{random.randint(1000, 99999)}@planmytravel.com"
        user = User(email=unique_email, name="Ledger Tester")
        user.set_password("Pass123!")
        db.session.add(user)
        db.session.commit()

        ref = f"pay_test_idem_{user.id}_{int(time.time())}"

        # 1. First credit
        res1 = WalletService.credit_wallet(user.id, amount_rupees=3000.0, reference=ref)
        assert res1["success"] is True
        assert res1["already_processed"] is False
        initial_balance = res1["balance"]

        # 2. Duplicate credit with same reference must be idempotent
        res2 = WalletService.credit_wallet(user.id, amount_rupees=3000.0, reference=ref)
        assert res2["success"] is True
        assert res2["already_processed"] is True
        assert res2["balance"] == initial_balance


def test_wallet_insufficient_funds_rejection(app):
    with app.app_context():
        unique_email = f"poor_traveler_{random.randint(1000, 99999)}@planmytravel.com"
        user = User(email=unique_email, name="Traveler")
        user.set_password("Pass123!")
        db.session.add(user)
        db.session.commit()

        # Set wallet balance to 500
        wallet = WalletService.get_or_create_wallet(user.id)
        wallet.balance = 500.0
        db.session.commit()

        # Attempt to debit 10,000
        with pytest.raises(ValueError, match="Insufficient wallet balance"):
            WalletService.debit_wallet(user.id, amount_rupees=10000.0, description="Luxury stay")


def test_booking_creation_and_wallet_atomic_payment(client):
    auth_client, csrf = get_authenticated_client(client, f"booking_flow_{random.randint(1000, 99999)}@test.com")
    headers = {"X-CSRF-Token": csrf}

    # Top up wallet with 8,000
    ord_res = auth_client.post("/api/wallet/create-order", json={"amount": 8000}, headers=headers)
    order_id = ord_res.get_json()["order"]["order_id"]
    auth_client.post("/api/wallet/verify-payment", json={
        "razorpay_order_id": order_id,
        "razorpay_payment_id": f"pay_flow_{order_id}",
        "razorpay_signature": "sig_valid",
        "amount": 8000,
    }, headers=headers)

    # Create Booking for 5,000
    bk_res = auth_client.post("/api/bookings", json={
        "total_amount": 5000,
        "travelers_count": 2,
    }, headers=headers)
    assert bk_res.status_code == 201
    bk_id = bk_res.get_json()["booking"]["id"]

    # Pay Booking via Wallet
    pay_res = auth_client.post(f"/api/bookings/{bk_id}/pay-wallet", headers=headers)
    assert pay_res.status_code == 200
    pay_data = pay_res.get_json()
    assert pay_data["success"] is True
    assert pay_data["booking"]["payment_status"] == "paid"
    assert pay_data["booking"]["status"] == "confirmed"
    assert pay_data["wallet_balance"] == 3000.0  # 8000 - 5000 = 3000


def test_unauthorized_user_cannot_access_other_users_trips(app):
    client_a = app.test_client()
    client_b = app.test_client()

    # User A
    email_a = f"user_a_{random.randint(1000, 99999)}@test.com"
    _, csrf_a = get_authenticated_client(client_a, email_a)
    save_res = client_a.post("/api/trips", json={
        "title": "Private Trip User A",
        "itinerary": {"destination": "Tokyo", "days": []},
        "preferences": {"budget": 50000}
    }, headers={"X-CSRF-Token": csrf_a})
    trip_id_a = save_res.get_json()["trip"]["id"]

    # User B
    email_b = f"user_b_{random.randint(1000, 99999)}@test.com"
    _, csrf_b = get_authenticated_client(client_b, email_b)

    # User B tries to read User A's trip -> MUST return 404
    get_res = client_b.get(f"/api/trips/{trip_id_a}")
    assert get_res.status_code == 404


def test_admin_route_security_rejects_unauthorized(client):
    # Traveler attempts to call admin stats -> MUST return 403
    res = client.get("/api/admin/stats")
    assert res.status_code in (401, 403)


def test_stays_destination_filter_returns_regional_hotels(client):
    """Ensure stays search strictly returns properties in the specified region."""
    # Search Kyoto
    res_kyoto = client.get("/api/stays?destination=Kyoto")
    assert res_kyoto.status_code == 200
    data_kyoto = res_kyoto.get_json()
    assert len(data_kyoto["stays"]) > 0
    for s in data_kyoto["stays"]:
        assert "kyoto" in s["city"].lower() or "japan" in s.get("country", "").lower()

    # Search Singapore
    res_sg = client.get("/api/stays?destination=Singapore")
    assert res_sg.status_code == 200
    data_sg = res_sg.get_json()
    assert len(data_sg["stays"]) > 0
    for s in data_sg["stays"]:
        assert "singapore" in s["city"].lower()


def test_stays_weather_forecast_endpoint(client):
    """Ensure weather endpoint responds with temperature and atmospheric condition."""
    res = client.get("/api/stays/weather?destination=Singapore&date=2026-10-25&lat=1.2847&lng=103.8540")
    assert res.status_code == 200
    data = res.get_json()
    assert "temperature_c" in data
    assert "condition" in data
    assert "advice" in data


def test_guide_discovery_and_registration(client):
    """Ensure guide listing and candidate registration operate with pending approval."""
    # List approved guides
    res_list = client.get("/api/guides?destination=Singapore")
    assert res_list.status_code == 200
    guides = res_list.get_json().get("guides", [])
    assert len(guides) > 0

    # Register candidate
    res_reg = client.post("/api/guides/register", json={
        "display_name": "New Candidate Guide",
        "destination": "Singapore",
        "bio": "Expert in hawker culture and heritage architecture.",
        "languages": ["English", "Malay"],
        "specialties": ["Culinary"],
        "daily_rate": 4500,
        "contact_email": f"guide_{random.randint(100, 99999)}@test.com",
        "contact_phone": "+65 9111 2222",
        "photo_url": "/images/guides/guide_1.jpg",
        "id_document_url": "https://example.com/id.pdf"
    })
    assert res_reg.status_code == 201
    assert res_reg.get_json()["guide"]["approval_status"] == "pending"


def test_review_authorization_protection(app):
    """Ensure only travelers who completed a booking can submit verified reviews."""
    auth_client = app.test_client()
    _, csrf = get_authenticated_client(auth_client)
    headers = {"X-CSRF-Token": csrf}

    # 1. Traveler without completed booking attempts review -> MUST return 403
    unauth_res = auth_client.post("/api/reviews", json={
        "stay_id": "stay_sg_1",
        "rating": 5,
        "title": "Unauthorized attempt",
        "body": "Should fail with 403"
    }, headers=headers)
    assert unauth_res.status_code == 403

    # 2. Complete a booking for this user
    with app.app_context():
        user = User.query.filter_by(email=auth_client.get("/api/auth/me").get_json()["user"]["email"]).first()
        b = Booking(user_id=user.id, status="completed", total_amount=15000, payment_status="paid")
        db.session.add(b)
        db.session.commit()

    # 3. Now review submission MUST succeed with 201
    auth_res = auth_client.post("/api/reviews", json={
        "stay_id": "stay_sg_1",
        "rating": 5,
        "title": "Authorized review",
        "body": "Wonderful boutique stay experience."
    }, headers=headers)
    assert auth_res.status_code == 201
    assert auth_res.get_json()["success"] is True


def test_expense_tracker_and_wallet_settlement(app):
    """Test journey expense logging, wallet deduction, and overexpense calculations."""
    auth_client = app.test_client()
    user, csrf = get_authenticated_client(auth_client)
    headers = {"X-CSRF-Token": csrf}

    # Credit user wallet with 50,000 for testing
    with app.app_context():
        u = User.query.filter_by(email=user["email"]).first()
        from backend.services.wallet_service import WalletService
        WalletService.credit(u.id, 50000.0, f"test_credit_{random.randint(100, 99999)}")

    # 1. Fetch initial expenses
    res = auth_client.get("/api/expenses")
    assert res.status_code == 200
    data = res.get_json()
    assert "total_spent" in data
    assert "budget" in data
    assert data["wallet_balance"] >= 50000.0

    # 2. Add an expense and pay directly with wallet
    res_add = auth_client.post("/api/expenses", json={
        "title": "Shinkansen High Speed Rail",
        "amount": 12500.0,
        "category": "Flights & Transit",
        "pay_with_wallet": True,
        "notes": "Express ticket booking",
    }, headers=headers)
    assert res_add.status_code == 201
    exp_data = res_add.get_json()
    assert exp_data["success"] is True
    assert exp_data["expense"]["paid_with_wallet"] is True

    # 3. Verify ledger summary updated
    res_summary = auth_client.get("/api/expenses")
    assert res_summary.status_code == 200
    summary_data = res_summary.get_json()
    assert summary_data["total_spent"] >= 12500.0
    assert summary_data["categories"].get("Flights & Transit", 0) >= 12500.0


def test_ai_chat_assistant_endpoint(app):
    """Ensure the AI travel concierge chatbot answers traveler queries."""
    client = app.test_client()
    res = client.post("/api/ai/chat", json={
        "message": "How do I plan a trip with AI concierge?"
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "reply" in data
    assert len(data["reply"]) > 20


def test_stay_fake_reviews_retrieval(app):
    """Ensure travel stays return verified reviews."""
    client = app.test_client()
    res = client.get("/api/reviews?stay_id=stay_sg_1")
    assert res.status_code == 200
    data = res.get_json()
    assert data["total"] > 0
    assert len(data["reviews"]) > 0
    assert data["reviews"][0]["rating"] >= 4



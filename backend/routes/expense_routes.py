import logging
import uuid
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, g
from backend.models.booking import Expense
from backend.models.trip import Trip
from backend.models.wallet import Wallet
from backend.services.wallet_service import WalletService
from backend.utils.auth_helpers import login_required
from backend.database import db

logger = logging.getLogger(__name__)
expense_bp = Blueprint("expense_bp", __name__, url_prefix="/api/expenses")


@expense_bp.route("", methods=["GET"])
@login_required
def get_expenses():
    """Retrieve overall journey expenses, breakdown by category, budget tracking, and overexpense alerts."""
    user_id = g.current_user.id
    trip_id = request.args.get("trip_id", "").strip()

    query = Expense.query.filter_by(user_id=user_id)
    if trip_id:
        query = query.filter_by(trip_id=trip_id)

    expenses = query.order_by(Expense.created_at.desc()).all()

    # Determine Journey Budget
    budget = 100000.0  # Default indicative journey budget
    if trip_id:
        trip = Trip.query.filter_by(id=trip_id, user_id=user_id).first()
        if trip and trip.budget:
            budget = float(trip.budget)
    else:
        # Check if user has an active trip with budget
        latest_trip = Trip.query.filter_by(user_id=user_id).order_by(Trip.created_at.desc()).first()
        if latest_trip and latest_trip.budget:
            budget = float(latest_trip.budget)

    # Calculate summary metrics
    total_spent = sum(e.amount for e in expenses)
    remaining_budget = max(0.0, budget - total_spent)
    is_over_budget = total_spent > budget
    over_budget_by = max(0.0, total_spent - budget)
    spent_percentage = round((total_spent / budget * 100) if budget > 0 else 0, 1)

    # Category breakdown
    categories_breakdown = {}
    for e in expenses:
        cat = e.category or "Miscellaneous"
        categories_breakdown[cat] = round(categories_breakdown.get(cat, 0.0) + e.amount, 2)

    # Current wallet balance
    wallet = WalletService.get_or_create_wallet(user_id)
    wallet_balance = round(wallet.balance or 0.0, 2)

    # Overexpense warning alert
    alert = None
    if is_over_budget:
        alert = {
            "type": "danger",
            "title": "Overexpense Alert",
            "message": f"You have exceeded your planned journey budget of ₹{budget:,.0f} by ₹{over_budget_by:,.0f}! You have currently spent {spent_percentage}% of your planned allocation.",
            "over_by": round(over_budget_by, 2),
        }
    elif spent_percentage >= 85:
        alert = {
            "type": "warning",
            "title": "Budget Alert",
            "message": f"Notice: You have used {spent_percentage}% of your journey budget. ₹{remaining_budget:,.0f} remaining.",
            "over_by": 0.0,
        }

    return jsonify({
        "expenses": [e.to_dict() for e in expenses],
        "total_spent": round(total_spent, 2),
        "budget": round(budget, 2),
        "remaining_budget": round(remaining_budget, 2),
        "spent_percentage": spent_percentage,
        "is_over_budget": is_over_budget,
        "over_budget_by": round(over_budget_by, 2),
        "alert": alert,
        "categories": categories_breakdown,
        "wallet_balance": wallet_balance,
    })


@expense_bp.route("", methods=["POST"])
@login_required
def add_expense():
    """Log an expense for the journey with optional direct settlement via the Trip Wallet."""
    user_id = g.current_user.id
    data = request.get_json() or {}

    title = data.get("title", "").strip()
    try:
        amount = float(data.get("amount", 0))
    except (TypeError, ValueError):
        return jsonify({"error": "Valid amount is required"}), 400

    if not title:
        return jsonify({"error": "Expense title or item name is required"}), 400
    if amount <= 0:
        return jsonify({"error": "Amount must be greater than zero"}), 400

    category = data.get("category", "General").strip()
    trip_id = data.get("trip_id", "").strip() or None
    notes = data.get("notes", "").strip()
    spent_at = data.get("spent_at", "").strip() or datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
    pay_with_wallet = bool(data.get("pay_with_wallet", False))

    paid_status = 0
    if pay_with_wallet:
        try:
            # Atomically debit from Trip Wallet
            idempotency_key = f"exp_{user_id}_{uuid.uuid4().hex[:12]}"
            WalletService.debit(
                user_id=user_id,
                amount_rupees=amount,
                idempotency_key=idempotency_key,
                description=f"Journey expense: {title} ({category})",
            )
            paid_status = 1
            notes = (notes + " [Paid via Wallet]").strip()
        except ValueError as err:
            return jsonify({"error": str(err), "wallet_insufficient": True}), 400

    expense = Expense(
        user_id=user_id,
        trip_id=trip_id,
        title=title,
        amount=amount,
        currency="INR",
        category=category,
        spent_at=spent_at,
        notes=notes,
        paid_with_wallet=paid_status,
    )
    db.session.add(expense)
    db.session.commit()

    wallet = WalletService.get_or_create_wallet(user_id)
    return jsonify({
        "success": True,
        "message": f"Expense recorded{' and settled via Wallet' if paid_status else ''}.",
        "expense": expense.to_dict(),
        "wallet_balance": round(wallet.balance or 0.0, 2),
    }), 201


@expense_bp.route("/<int:expense_id>/pay", methods=["POST"])
@login_required
def pay_expense_with_wallet(expense_id: int):
    """Settle an existing unpaid journey expense directly from the user's Trip Wallet."""
    user_id = g.current_user.id
    expense = Expense.query.filter_by(id=expense_id, user_id=user_id).first()
    if not expense:
        return jsonify({"error": "Expense record not found"}), 404

    if expense.paid_with_wallet or "[Paid via Wallet]" in (expense.notes or ""):
        return jsonify({"error": "This expense has already been paid via Wallet"}), 400

    try:
        idempotency_key = f"exp_settle_{expense.id}_{uuid.uuid4().hex[:8]}"
        WalletService.debit(
            user_id=user_id,
            amount_rupees=expense.amount,
            idempotency_key=idempotency_key,
            description=f"Settled expense: {expense.title} ({expense.category})",
        )
        expense.paid_with_wallet = 1
        expense.notes = ((expense.notes or "") + " [Paid via Wallet]").strip()
        db.session.commit()
    except ValueError as err:
        return jsonify({"error": str(err), "wallet_insufficient": True}), 400

    wallet = WalletService.get_or_create_wallet(user_id)
    return jsonify({
        "success": True,
        "message": f"Successfully paid ₹{expense.amount:,.2f} for '{expense.title}' via your Trip Wallet.",
        "expense": expense.to_dict(),
        "wallet_balance": round(wallet.balance or 0.0, 2),
    })


@expense_bp.route("/<int:expense_id>", methods=["DELETE"])
@login_required
def delete_expense(expense_id: int):
    """Delete an expense record."""
    user_id = g.current_user.id
    expense = Expense.query.filter_by(id=expense_id, user_id=user_id).first()
    if not expense:
        return jsonify({"error": "Expense not found"}), 404

    db.session.delete(expense)
    db.session.commit()
    return jsonify({"success": True, "message": "Expense removed successfully"})


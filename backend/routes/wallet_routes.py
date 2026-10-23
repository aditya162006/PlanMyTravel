import logging
from flask import Blueprint, request, jsonify, g
from backend.services.wallet_service import WalletService
from backend.services.payment_service import PaymentService
from backend.utils.auth_helpers import login_required
from backend.config import Config

logger = logging.getLogger(__name__)
wallet_bp = Blueprint("wallet_bp", __name__, url_prefix="/api/wallet")

payment_service = PaymentService()


@wallet_bp.route("", methods=["GET"])
@login_required
def get_wallet():
    """Retrieve user's Trip Wallet balance, status, and transaction history."""
    data = WalletService.get_wallet_summary(g.current_user.id)
    data["is_test_mode"] = payment_service.mode == "test" or payment_service.client is None
    data["wallet_enabled"] = Config.WALLET_ENABLED
    data["regulatory_notice"] = (
        "PlanMyTravel Trip Wallet operates in developer sandbox mode for travel purchases and test top-ups. "
        "Complies with non-reloadable simulated travel budget standards."
    )
    return jsonify(data)


@wallet_bp.route("/create-order", methods=["POST"])
@login_required
def create_wallet_order():
    """Create a Razorpay payment order for wallet top-up."""
    if not Config.WALLET_ENABLED:
        return jsonify({"error": "Stored value wallet features are currently disabled"}), 403

    data = request.get_json() or {}
    amount_rupees = data.get("amount", 0.0)

    try:
        amount_rupees = float(amount_rupees)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid amount"}), 400

    if amount_rupees < 1:
        return jsonify({"error": "Minimum top-up amount is ₹1"}), 400
    if amount_rupees > 200000:
        return jsonify({"error": "Maximum single top-up amount is ₹2,00,000"}), 400

    # Represent as minor units (paise)
    amount_paise = int(round(amount_rupees * 100))

    try:
        order = payment_service.create_order(
            amount_paise=amount_paise,
            currency="INR",
            receipt=f"topup_u{g.current_user.id}"
        )
        return jsonify({
            "order": order,
            "user": {
                "name": g.current_user.name or g.current_user.full_name,
                "email": g.current_user.email,
                "phone": g.current_user.phone or "9999999999",
            }
        })
    except Exception as e:
        logger.error("Order creation failed: %s", e)
        return jsonify({"error": str(e)}), 500


@wallet_bp.route("/verify-payment", methods=["POST"])
@login_required
def verify_payment():
    """Cryptographically verify payment response from Razorpay and credit wallet."""
    data = request.get_json() or {}
    order_id = data.get("razorpay_order_id", "").strip()
    payment_id = data.get("razorpay_payment_id", "").strip()
    signature = data.get("razorpay_signature", "").strip()
    amount_rupees = data.get("amount")

    if not order_id or not payment_id:
        return jsonify({"error": "Missing payment reference or order ID"}), 400

    try:
        amount_rupees = float(amount_rupees)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid top-up amount"}), 400

    # Cryptographic verification
    is_valid = payment_service.verify_payment_signature(
        order_id=order_id,
        payment_id=payment_id,
        signature=signature
    )
    if not is_valid:
        logger.warning("Payment signature verification failed for user %d, order %s", g.current_user.id, order_id)
        return jsonify({"error": "Cryptographic payment verification failed"}), 400

    # Credit wallet idempotently
    try:
        result = WalletService.credit_wallet(
            user_id=g.current_user.id,
            amount_rupees=amount_rupees,
            reference=payment_id,
            description=f"Razorpay Top-up ({order_id})",
        )
        return jsonify({
            "success": True,
            "message": "Payment verified and wallet credited successfully",
            "balance": result["balance"],
            "transaction": result["transaction"],
        })
    except Exception as e:
        logger.error("Error crediting wallet: %s", e)
        return jsonify({"error": f"Failed to credit wallet: {e}"}), 500


@wallet_bp.route("/webhook", methods=["POST"])
def razorpay_webhook():
    """Idempotent webhook listener for Razorpay payment captures."""
    raw_payload = request.get_data()
    sig_header = request.headers.get("X-Razorpay-Signature", "")

    # If webhook secret is set, verify cryptographic HMAC
    if Config.RAZORPAY_WEBHOOK_SECRET:
        if not payment_service.verify_webhook_signature(raw_payload, sig_header):
            return jsonify({"error": "Invalid webhook signature"}), 400

    data = request.get_json() or {}
    event = data.get("event")
    logger.info("Received Razorpay webhook event: %s", event)

    if event == "payment.captured":
        payload = data.get("payload", {}).get("payment", {}).get("entity", {})
        payment_id = payload.get("id")
        amount_paise = payload.get("amount", 0)
        # Note: If order_id or notes specify user, credit can be reconciled here safely
        logger.info("Webhook captured payment: %s, amount paise: %s", payment_id, amount_paise)

    return jsonify({"status": "received"})


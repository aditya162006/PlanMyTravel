import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from backend.database import db
from backend.models.wallet import Wallet, WalletTransaction

logger = logging.getLogger(__name__)


class WalletService:
    """Core ledger and wallet balance service with integer minor-unit math and idempotency."""

    @staticmethod
    def get_or_create_wallet(user_id: int, currency: str = "INR") -> Wallet:
        """Retrieve existing user wallet or safely initialize one."""
        wallet = Wallet.query.filter_by(user_id=user_id).first()
        if not wallet:
            wallet = Wallet(user_id=user_id, balance=0.0, currency=currency)
            db.session.add(wallet)
            db.session.commit()
        return wallet

    @classmethod
    def credit_wallet(cls, user_id: int, amount_rupees: float, reference: str, description: str = "Wallet Top-up", currency: str = "INR") -> Dict[str, Any]:
        """Credit funds to user wallet idempotently using unique provider payment reference."""
        if amount_rupees <= 0:
            raise ValueError("Credit amount must be greater than zero")

        if not reference:
            raise ValueError("Unique payment reference is required for credit transactions")

        # Idempotency check: Ensure payment reference has not already been credited
        existing_tx = WalletTransaction.query.filter_by(reference=reference).first()
        if existing_tx:
            logger.info("Transaction with reference %s already processed. Returning existing state.", reference)
            wallet = db.session.get(Wallet, existing_tx.wallet_id)
            return {
                "success": True,
                "already_processed": True,
                "transaction": existing_tx.to_dict(),
                "balance": round(wallet.balance, 2),
            }

        wallet = cls.get_or_create_wallet(user_id, currency=currency)

        # Minor unit calculation
        current_paise = wallet.balance_paise
        addition_paise = int(round(amount_rupees * 100))
        new_balance_paise = current_paise + addition_paise
        wallet.balance = new_balance_paise / 100.0
        wallet.updated_at = datetime.now(timezone.utc).isoformat()

        tx = WalletTransaction(
            wallet_id=wallet.id,
            type="credit",
            transaction_type="topup",
            amount=round(amount_rupees, 2),
            status="completed",
            currency=currency,
            description=description,
            reference=reference,
        )
        db.session.add(tx)
        db.session.commit()

        logger.info("Credited %.2f to user %d wallet. New balance: %.2f", amount_rupees, user_id, wallet.balance)
        return {
            "success": True,
            "already_processed": False,
            "transaction": tx.to_dict(),
            "balance": round(wallet.balance, 2),
        }

    @classmethod
    def debit_wallet(cls, user_id: int, amount_rupees: float, description: str, reference: Optional[str] = None, booking_id: Optional[int] = None, trip_id: Optional[str] = None) -> Dict[str, Any]:
        """Debit funds from user wallet for booking or reservation. Fails if balance insufficient."""
        if amount_rupees <= 0:
            raise ValueError("Debit amount must be greater than zero")

        wallet = cls.get_or_create_wallet(user_id)

        # Check balance in minor units
        current_paise = wallet.balance_paise
        charge_paise = int(round(amount_rupees * 100))

        if current_paise < charge_paise:
            shortfall = (charge_paise - current_paise) / 100.0
            raise ValueError(f"Insufficient wallet balance. You need an additional ₹{shortfall:,.2f}")

        # Idempotency check if reference provided
        if reference:
            existing = WalletTransaction.query.filter_by(reference=reference).first()
            if existing:
                return {
                    "success": True,
                    "already_processed": True,
                    "transaction": existing.to_dict(),
                    "balance": round(wallet.balance, 2),
                }

        # Deduct atomically
        new_balance_paise = current_paise - charge_paise
        wallet.balance = new_balance_paise / 100.0
        wallet.updated_at = datetime.now(timezone.utc).isoformat()

        tx = WalletTransaction(
            wallet_id=wallet.id,
            trip_id=trip_id,
            booking_id=booking_id,
            type="debit",
            transaction_type="booking_payment",
            amount=round(amount_rupees, 2),
            status="completed",
            currency=wallet.currency,
            description=description,
            reference=reference or f"deb_{user_id}_{int(datetime.now(timezone.utc).timestamp())}",
        )
        db.session.add(tx)
        db.session.commit()

        logger.info("Debited %.2f from user %d wallet. New balance: %.2f", amount_rupees, user_id, wallet.balance)
        return {
            "success": True,
            "already_processed": False,
            "transaction": tx.to_dict(),
            "balance": round(wallet.balance, 2),
        }

    @classmethod
    def credit(cls, user_id: int, amount_rupees: float, reference: str, description: str = "Wallet Top-up", currency: str = "INR", **kwargs) -> Dict[str, Any]:
        """Convenience alias for credit_wallet."""
        return cls.credit_wallet(user_id=user_id, amount_rupees=amount_rupees, reference=reference, description=description, currency=currency)

    @classmethod
    def debit(cls, user_id: int, amount_rupees: float, description: str, reference: Optional[str] = None, idempotency_key: Optional[str] = None, **kwargs) -> Dict[str, Any]:
        """Convenience alias for debit_wallet supporting reference or idempotency_key."""
        ref = reference or idempotency_key
        return cls.debit_wallet(user_id=user_id, amount_rupees=amount_rupees, description=description, reference=ref, **kwargs)

    @classmethod
    def get_wallet_summary(cls, user_id: int) -> Dict[str, Any]:
        """Retrieve balance and full transaction history."""
        wallet = cls.get_or_create_wallet(user_id)
        transactions = wallet.transactions.limit(50).all()
        return {
            "wallet": wallet.to_dict(),
            "transactions": [tx.to_dict() for tx in transactions],
        }

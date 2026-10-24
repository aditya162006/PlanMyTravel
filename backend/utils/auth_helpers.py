import functools
import secrets
import logging
from datetime import datetime, timezone, timedelta
from flask import session, request, jsonify, g
from backend.config import Config
from backend.models.user import User, AdminUser, AdminAuditLog
from backend.database import db

logger = logging.getLogger(__name__)


def generate_csrf_token() -> str:
    """Generate or retrieve per-session CSRF token."""
    if "csrf_token" not in session:
        session["csrf_token"] = secrets.token_hex(24)
    return session["csrf_token"]


def validate_csrf():
    """Verify CSRF token for state-changing HTTP requests."""
    # Skip for safe methods and webhook endpoints
    if request.method in ("GET", "HEAD", "OPTIONS"):
        return
    if request.path.startswith("/api/wallet/webhook") or request.path.startswith("/api/emergency"):
        return

    # Allow unauthenticated entrypoints to establish or refresh session without CSRF deadlock
    if request.path in ("/api/auth/login", "/api/auth/register", "/api/auth/admin/login", "/api/auth/logout", "/api/guides/upload"):
        generate_csrf_token()
        return

    expected = session.get("csrf_token")
    header_token = request.headers.get("X-CSRF-Token") or request.headers.get("X-XSRF-TOKEN")
    
    # If no token in session yet (e.g. initial request), set one
    if not expected:
        generate_csrf_token()
        return

    if not header_token or not secrets.compare_digest(str(expected), str(header_token)):
        return jsonify({"error": "Invalid or missing CSRF token"}), 403


def login_required(f):
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"error": "Authentication required", "authenticated": False}), 401

        # Check session age
        login_time = session.get("user_login_time")
        if login_time:
            max_age = timedelta(minutes=Config.USER_SESSION_MINUTES)
            if datetime.now(timezone.utc).timestamp() - login_time > max_age.total_seconds():
                session.clear()
                return jsonify({"error": "Session expired. Please sign in again.", "authenticated": False}), 401

        user = db.session.get(User, user_id)
        if not user or not user.is_active:
            session.clear()
            return jsonify({"error": "User account inactive or not found", "authenticated": False}), 401

        g.current_user = user
        return f(*args, **kwargs)
    return decorated_function


def admin_required(f):
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        admin_id = session.get("admin_id")
        if not admin_id:
            return jsonify({"error": "Admin authorization required", "is_admin": False}), 403

        # Check session age
        login_time = session.get("admin_login_time")
        if login_time:
            max_age = timedelta(minutes=Config.ADMIN_SESSION_MINUTES)
            if datetime.now(timezone.utc).timestamp() - login_time > max_age.total_seconds():
                session.clear()
                return jsonify({"error": "Admin session expired. Please sign in again.", "is_admin": False}), 401

        admin = db.session.get(AdminUser, admin_id)
        if not admin or not admin.is_active:
            session.clear()
            return jsonify({"error": "Admin account not found or disabled", "is_admin": False}), 403

        g.current_admin = admin
        return f(*args, **kwargs)
    return decorated_function


def log_admin_action(action: str, entity_type: str = "", entity_id: str = "", details: dict = None):
    """Record an audit trail log for administrative mutations."""
    try:
        admin_id = session.get("admin_id")
        ip = request.headers.get("X-Forwarded-For", request.remote_addr)
        if ip and "," in ip:
            ip = ip.split(",")[0].strip()

        log = AdminAuditLog(
            admin_id=admin_id,
            action=action,
            entity_type=entity_type,
            entity_id=str(entity_id) if entity_id else None,
            details_json=str(details or {}),
            ip=ip,
            ip_address=ip,
            user_agent=request.user_agent.string if request.user_agent else None,
        )
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        logger.error("Failed to write admin audit log: %s", e)


def bootstrap_admin_account():
    """Ensure configured administrator account exists in database."""
    email = Config.ADMIN_BOOTSTRAP_EMAIL
    password = Config.ADMIN_BOOTSTRAP_PASSWORD
    if not email or not password:
        return

    try:
        admin = AdminUser.query.filter_by(email=email).first()
        if not admin:
            admin = AdminUser(
                email=email,
                name="System Administrator",
                role="super_admin",
                is_active=1,
            )
            admin.set_password(password)
            db.session.add(admin)
            db.session.commit()
            logger.info("Admin bootstrap account successfully verified/created for %s", email)
    except Exception as e:
        logger.error("Admin bootstrap error: %s", e)
        db.session.rollback()

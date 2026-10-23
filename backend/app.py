import os
import logging
from pathlib import Path
from flask import Flask, send_from_directory, jsonify
from backend.config import Config
from backend.database import db
from backend.utils.auth_helpers import validate_csrf, bootstrap_admin_account
from backend.utils.seed_data import seed_database_if_needed

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)


def create_app(test_config=None) -> Flask:
    """Application factory for PlanMyTravel."""
    app = Flask(__name__, static_folder=None)

    # Base configuration
    app.config.from_object(Config)

    if test_config:
        app.config.update(test_config)
    else:
        # Configure Turso or SQLite database engine
        engine_url, connect_args = Config.get_database_uri_and_connect_args()
        app.config["SQLALCHEMY_DATABASE_URI"] = engine_url
        app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {"connect_args": connect_args}

    # Initialize extensions
    db.init_app(app)

    # CSRF protection
    @app.before_request
    def check_csrf():
        return validate_csrf()

    # Security headers
    @app.after_request
    def set_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

    # Register blueprints
    from backend.routes.health_routes import health_bp
    from backend.routes.auth_routes import auth_bp
    from backend.routes.destination_routes import dest_bp
    from backend.routes.stay_routes import stay_bp
    from backend.routes.flight_routes import flight_bp
    from backend.routes.ai_routes import ai_bp
    from backend.routes.trip_routes import trip_bp
    from backend.routes.wallet_routes import wallet_bp
    from backend.routes.booking_routes import booking_bp
    from backend.routes.admin_routes import admin_bp
    from backend.routes.guide_routes import guide_bp
    from backend.routes.review_routes import review_bp
    from backend.routes.expense_routes import expense_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(dest_bp)
    app.register_blueprint(stay_bp)
    app.register_blueprint(flight_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(trip_bp)
    app.register_blueprint(wallet_bp)
    app.register_blueprint(booking_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(guide_bp)
    app.register_blueprint(review_bp)
    app.register_blueprint(expense_bp)

    # Images serving
    images_dir = Path(__file__).resolve().parent.parent / "frontend" / "public" / "images"

    @app.route("/images/<path:filename>")
    def serve_images(filename):
        if images_dir.exists():
            return send_from_directory(images_dir, filename)
        return jsonify({"error": "Image not found"}), 404

    # Frontend SPA serving
    frontend_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_frontend(path):
        if path.startswith("api/"):
            return jsonify({"error": "Endpoint not found"}), 404

        file_path = frontend_dist / path
        if path and file_path.exists() and file_path.is_file():
            return send_from_directory(frontend_dist, path)

        index_file = frontend_dist / "index.html"
        if index_file.exists():
            return send_from_directory(frontend_dist, "index.html")

        # Friendly placeholder if frontend is not yet built
        return jsonify({
            "service": "PlanMyTravel API Server",
            "status": "running",
            "message": "Frontend assets not yet compiled. Run 'npm run build' inside frontend directory.",
            "api_health": "/api/health",
            "destinations": "/api/destinations",
        })

    # Safe schema & bootstrap check
    with app.app_context():
        try:
            # We preserve existing tables and seed curated content safely
            bootstrap_admin_account()
            seed_database_if_needed()
        except Exception as e:
            logger.warning("Database bootstrap/seed notice: %s", e)

    return app


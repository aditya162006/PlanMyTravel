import logging
from flask import Blueprint, request, jsonify
from backend.services.ai_travel_service import AITravelService
from backend.services.hotel_service import HotelService
from backend.services.flight_service import FlightService
from backend.models.destination import Destination

logger = logging.getLogger(__name__)
ai_bp = Blueprint("ai_bp", __name__, url_prefix="/api/ai")

ai_service = AITravelService()
hotel_service = HotelService()
flight_service = FlightService()


@ai_bp.route("/plan", methods=["POST"])
def generate_trip_plan():
    """Generate a structured, end-to-end travel concierge itinerary with Gemini."""
    data = request.get_json() or {}

    destination_name = data.get("destination", "").strip() or "Singapore"
    origin = data.get("origin", "").strip() or "New Delhi"
    days = int(data.get("days", 4))
    travelers = int(data.get("travelers", 2))
    budget = float(data.get("budget", 150000))
    currency = data.get("currency", "INR")
    travel_style = data.get("travel_style", "Cultural & Relaxation")
    pace = data.get("pace", "balanced")
    interests = data.get("interests", ["sightseeing", "local food", "architecture"])
    requirements = data.get("requirements", "")
    notes = data.get("notes", "")

    # Retrieve destination context from DB if available
    dest_record = Destination.query.filter(
        (Destination.name.ilike(f"%{destination_name}%")) |
        (Destination.slug.ilike(f"%{destination_name}%"))
    ).first()
    dest_context = dest_record.to_dict(include_details=True) if dest_record else None

    preferences = {
        "destination": destination_name,
        "origin": origin,
        "days": max(1, min(days, 14)),
        "travelers": max(1, travelers),
        "budget": budget,
        "currency": currency,
        "travel_style": travel_style,
        "pace": pace,
        "interests": interests,
        "requirements": requirements,
        "notes": notes,
    }

    try:
        itinerary = ai_service.generate_concierge_itinerary(preferences, destination_context=dest_context)

        # Enrich with live/test hotel listings from Hotelbeds
        provider_hotels = hotel_service.search_hotels(destination=destination_name, limit=3)
        if provider_hotels:
            itinerary["verified_hotel_options"] = provider_hotels
            # Also ensure accommodations array in itinerary has hotels from destination
            itinerary["accommodations"] = provider_hotels

        # Enrich with real flight options
        flights = flight_service.search_flights(origin=origin, destination=destination_name, travelers=travelers)
        itinerary["flight_search_summary"] = flights

        # Enrich with verified local guides
        from backend.models.guide import Guide
        matching_guides = Guide.query.filter(
            ((Guide.approval_status == "approved") | (Guide.is_verified == 1)) &
            (Guide.destination.ilike(f"%{destination_name}%"))
        ).all()
        if not matching_guides:
            matching_guides = Guide.query.filter(
                (Guide.approval_status == "approved") | (Guide.is_verified == 1)
            ).limit(2).all()
        if matching_guides:
            itinerary["assigned_guide"] = matching_guides[0].to_dict()
            itinerary["available_guides"] = [g.to_dict() for g in matching_guides]

        return jsonify({
            "success": True,
            "itinerary": itinerary,
            "preferences": preferences,
        })
    except Exception as e:
        logger.error("Itinerary generation error: %s", e)
        # Use reliable fallback plan
        fallback = ai_service._generate_fallback_itinerary(preferences, destination_name)
        provider_hotels = hotel_service.search_hotels(destination=destination_name, limit=3)
        if provider_hotels:
            fallback["verified_hotel_options"] = provider_hotels
            fallback["accommodations"] = provider_hotels

        from backend.models.guide import Guide
        fallback_guides = Guide.query.filter(
            ((Guide.approval_status == "approved") | (Guide.is_verified == 1)) &
            (Guide.destination.ilike(f"%{destination_name}%"))
        ).all()
        if not fallback_guides:
            fallback_guides = Guide.query.filter(
                (Guide.approval_status == "approved") | (Guide.is_verified == 1)
            ).limit(2).all()
        if fallback_guides:
            fallback["assigned_guide"] = fallback_guides[0].to_dict()
            fallback["available_guides"] = [g.to_dict() for g in fallback_guides]

        return jsonify({
            "success": True,
            "itinerary": fallback,
            "preferences": preferences,
            "notice": "Generated via verified destination template while external AI is warming up.",
        })


@ai_bp.route("/regenerate-day", methods=["POST"])
def regenerate_day():
    """Regenerate an individual itinerary day without altering other days."""
    data = request.get_json() or {}
    day_data = data.get("day", {})
    destination = data.get("destination", "Tokyo")
    travel_style = data.get("travel_style", "Cultural")
    user_notes = data.get("notes", "")

    if not day_data:
        return jsonify({"error": "Current day data is required"}), 400

    updated_day = ai_service.regenerate_single_day(
        current_day=day_data,
        destination=destination,
        travel_style=travel_style,
        user_notes=user_notes,
    )
    return jsonify({"success": True, "day": updated_day})


@ai_bp.route("/replace-activity", methods=["POST"])
def replace_activity():
    """Replace an individual activity in a morning, afternoon, or evening slot."""
    data = request.get_json() or {}
    slot = data.get("slot", "afternoon")
    current_act = data.get("current_activity", {})
    destination = data.get("destination", "Singapore")
    notes = data.get("notes", "")

    if not current_act:
        return jsonify({"error": "Current activity data required"}), 400

    new_activity = ai_service.replace_single_activity(
        destination=destination,
        slot=slot,
        current_activity=current_act,
        user_notes=notes,
    )
    return jsonify({"success": True, "activity": new_activity})


@ai_bp.route("/chat", methods=["POST"])
def ai_chat():
    """Interactive AI Travel Concierge chatbot answering questions about the website."""
    data = request.get_json() or {}
    message = data.get("message", "").strip()
    history = data.get("history", [])

    if not message:
        return jsonify({"error": "Message cannot be empty"}), 400

    reply = ai_service.chat_assistant(message=message, history=history)
    return jsonify({
        "success": True,
        "reply": reply,
    })



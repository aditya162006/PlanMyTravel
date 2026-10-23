import json
import logging
import re
from typing import Dict, Any, Optional, List
from google import genai
from google.genai import types
from backend.config import Config

logger = logging.getLogger(__name__)

CANDIDATE_MODELS = [
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-flash-latest",
    "gemini-3.8-flash",
]


class AITravelService:
    """Service layer for AI-driven travel concierge itineraries using Google Gemini."""

    def __init__(self):
        self.keys = [k for k in [Config.GEMINI_API_KEY_1, Config.GEMINI_API_KEY_2] if k]
        self._current_key_idx = 0

    def _get_client(self, key_idx: Optional[int] = None) -> Optional[genai.Client]:
        if not self.keys:
            return None
        idx = (self._current_key_idx if key_idx is None else key_idx) % len(self.keys)
        return genai.Client(api_key=self.keys[idx])

    def _rotate_key(self):
        if len(self.keys) > 1:
            self._current_key_idx = (self._current_key_idx + 1) % len(self.keys)
            logger.info("Rotated to alternate Gemini API key index: %d", self._current_key_idx)

    def _clean_json_markdown(self, text: str) -> str:
        text = text.strip()
        # Remove ```json or ``` blocks
        text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.MULTILINE)
        text = re.sub(r"\s*```$", "", text, flags=re.MULTILINE)
        # Find outer JSON braces
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            return text[start:end+1]
        return text

    def _call_gemini_with_fallback(self, prompt: str, system_instruction: str = "") -> str:
        """Execute Gemini request with automatic key rotation and model fallback."""
        if not self.keys:
            raise RuntimeError("No Gemini API keys configured. Set GEMINI_API_KEY_1 in environment.")

        last_error = None
        # Try both keys if needed
        for key_attempt in range(len(self.keys)):
            client = self._get_client()
            for model_name in CANDIDATE_MODELS:
                try:
                    config = types.GenerateContentConfig(
                        temperature=0.4,
                        system_instruction=system_instruction or None,
                        response_mime_type="application/json",
                    )
                    response = client.models.generate_content(
                        model=model_name,
                        contents=prompt,
                        config=config,
                    )
                    if response and response.text:
                        return response.text
                except Exception as e:
                    last_error = e
                    err_msg = str(e).lower()
                    logger.warning("Gemini call failed with model %s: %s", model_name, str(e)[:120])
                    # If quota or rate limit, rotate key immediately
                    if "429" in err_msg or "resource_exhausted" in err_msg or "quota" in err_msg:
                        break
            # Rotate key for next attempt
            self._rotate_key()

        raise RuntimeError(f"All Gemini models and keys exhausted. Last error: {last_error}")

    def generate_concierge_itinerary(self, preferences: Dict[str, Any], destination_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Generate a complete, structured travel itinerary."""
        system_instruction = (
            "You are PlanMyTravel's elite AI Travel Concierge. "
            "Your output must be 100% valid JSON conforming strictly to the requested schema. "
            "Never fabricate confirmed booking tokens, real-time airline ticket numbers, or live hotel availability. "
            "Clearly distinguish estimated costs from verified supplier prices. "
            "Provide realistic, geographically logical schedules that factor in travel times and meal periods."
        )

        currency = preferences.get("currency", "INR")
        destination = preferences.get("destination", "Tokyo, Japan")
        origin = preferences.get("origin", "New Delhi, India")
        days_count = preferences.get("days", 4)
        travelers = preferences.get("travelers", 2)
        travel_style = preferences.get("travel_style", "Cultural & Relaxation")
        total_budget = preferences.get("budget", 150000)

        prompt = f"""
Plan a detailed, personalized {days_count}-day travel itinerary for {travelers} travelers.
Origin: {origin}
Destination: {destination}
Trip Duration: {days_count} days
Target Budget: {total_budget} {currency}
Travel Style: {travel_style}
Preferred Pace: {preferences.get('pace', 'balanced')}
Interests: {preferences.get('interests', ['sightseeing', 'local cuisine', 'culture'])}
Special Requirements / Dietary: {preferences.get('requirements', 'None')}
Additional Notes: {preferences.get('notes', '')}

Destination Context:
{json.dumps(destination_context or {}, indent=2)}

Output a JSON object with this exact structure:
{{
  "title": "Inspiring Title for Trip",
  "summary": "2-3 sentences capturing the essence of the journey",
  "destination": "{destination}",
  "origin": "{origin}",
  "duration_days": {days_count},
  "travelers": {travelers},
  "currency": "{currency}",
  "flights": {{
    "outbound": {{
      "airline": "Airline Name",
      "flight_number": "Indicative flight (e.g. AI-306)",
      "departure_airport": "Airport Code / Name",
      "arrival_airport": "Airport Code / Name",
      "departure_time": "10:30 AM",
      "arrival_time": "06:45 PM",
      "duration": "6h 15m",
      "layovers": "Non-stop",
      "estimated_price_per_person": 25000,
      "booking_advice": "Book 3-4 weeks in advance on official airline portal."
    }},
    "return": {{
      "airline": "Airline Name",
      "flight_number": "Indicative flight (e.g. AI-307)",
      "departure_airport": "Airport Code / Name",
      "arrival_airport": "Airport Code / Name",
      "departure_time": "11:00 AM",
      "arrival_time": "03:30 PM",
      "duration": "6h 30m",
      "layovers": "Non-stop",
      "estimated_price_per_person": 25000,
      "booking_advice": "Check seasonal luggage allowances."
    }}
  }},
  "transfers": [
    {{
      "mode": "Airport Express Train or Private Taxi",
      "from": "Airport",
      "to": "City Center Hotel",
      "duration": "45 mins",
      "estimated_cost": 2500,
      "tips": "Purchase reloadable transit IC card at airport terminal."
    }}
  ],
  "accommodations": [
    {{
      "name": "Recommended Hotel or Boutique Stay",
      "category": "4-Star Boutique",
      "neighborhood": "Central district",
      "nightly_rate": 8000,
      "total_stay_cost": {8000 * max(1, days_count - 1)},
      "amenities": ["Wi-Fi", "Breakfast included", "Metro access"],
      "image_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
      "booking_advice": "Free cancellation option recommended."
    }}
  ],
  "days": [
    {{
      "day_number": 1,
      "title": "Day Title (e.g. Arrival & Evening Promenade)",
      "summary": "Brief summary of the day",
      "morning": {{
        "title": "Activity name",
        "description": "Engaging description",
        "location": "Specific place or landmark",
        "time": "09:30 AM",
        "duration_min": 120,
        "estimated_cost": 1000
      }},
      "afternoon": {{
        "title": "Activity name",
        "description": "Engaging description",
        "location": "Specific place or landmark",
        "time": "02:00 PM",
        "duration_min": 150,
        "estimated_cost": 1500
      }},
      "evening": {{
        "title": "Activity name or dining",
        "description": "Culinary or evening view experience",
        "location": "Specific place or landmark",
        "time": "07:30 PM",
        "duration_min": 120,
        "estimated_cost": 2000
      }}
    }}
  ],
  "budget_breakdown": {{
    "flights_total": 50000,
    "accommodation_total": 32000,
    "transfers_and_transit": 8000,
    "activities_and_tickets": 15000,
    "food_and_dining": 20000,
    "contingency_fund": 10000,
    "estimated_grand_total": 135000,
    "remaining_budget": {max(0, total_budget - 135000)},
    "budget_status": "within_budget"
  }},
  "practical_tips": [
    "Tip 1 regarding best local transit or SIM card",
    "Tip 2 regarding payments (cards vs cash)",
    "Tip 3 regarding seasonal weather attire"
  ]
}}
"""
        raw_text = self._call_gemini_with_fallback(prompt, system_instruction)
        cleaned = self._clean_json_markdown(raw_text)
        try:
            data = json.loads(cleaned)
            # Ensure day count matches requested days
            if "days" in data and len(data["days"]) > 0:
                return data
        except Exception as e:
            logger.error("Failed to parse AI response JSON: %s. Raw: %s", e, cleaned[:200])

        # Graceful fallback structure if JSON was slightly damaged
        return self._generate_fallback_itinerary(preferences, destination)

    def regenerate_single_day(self, current_day: Dict[str, Any], destination: str, travel_style: str, user_notes: str = "") -> Dict[str, Any]:
        """Regenerate a specific day without altering other days of the itinerary."""
        system_instruction = "You are an AI travel itinerary architect. Output valid JSON only for the requested day."
        day_num = current_day.get("day_number", 1)
        prompt = f"""
Regenerate Day {day_num} for a trip to {destination}.
Travel Style: {travel_style}
User requests / modifications: {user_notes or 'Provide alternative activities focusing on hidden gems and local cuisine.'}

Current Day to replace:
{json.dumps(current_day, indent=2)}

Output JSON format:
{{
  "day_number": {day_num},
  "title": "New Title for Day {day_num}",
  "summary": "Refreshed summary of day",
  "morning": {{
    "title": "Activity Title",
    "description": "Engaging description",
    "location": "Location name",
    "time": "09:30 AM",
    "duration_min": 120,
    "estimated_cost": 1200
  }},
  "afternoon": {{
    "title": "Activity Title",
    "description": "Engaging description",
    "location": "Location name",
    "time": "02:30 PM",
    "duration_min": 150,
    "estimated_cost": 1500
  }},
  "evening": {{
    "title": "Activity Title",
    "description": "Engaging description",
    "location": "Location name",
    "time": "07:30 PM",
    "duration_min": 120,
    "estimated_cost": 2000
  }}
}}
"""
        try:
            raw_text = self._call_gemini_with_fallback(prompt, system_instruction)
            return json.loads(self._clean_json_markdown(raw_text))
        except Exception as e:
            logger.error("Failed to regenerate day %d: %s", day_num, e)
            return current_day

    def replace_single_activity(self, destination: str, slot: str, current_activity: Dict[str, Any], user_notes: str = "") -> Dict[str, Any]:
        """Replace a specific activity in an itinerary day slot."""
        system_instruction = "You are an AI travel concierge. Output valid JSON only for the replacement activity."
        prompt = f"""
Suggest a high-quality alternative activity for {slot} in {destination}.
Current activity being replaced: {json.dumps(current_activity)}
User preference: {user_notes or 'Suggest something authentic and engaging.'}

Output JSON format:
{{
  "title": "New Activity Title",
  "description": "Engaging description",
  "location": "Specific location or neighborhood",
  "time": "{current_activity.get('time', '10:00 AM')}",
  "duration_min": {current_activity.get('duration_min', 120)},
  "estimated_cost": {current_activity.get('estimated_cost', 1000)}
}}
"""
        try:
            raw_text = self._call_gemini_with_fallback(prompt, system_instruction)
            return json.loads(self._clean_json_markdown(raw_text))
        except Exception as e:
            logger.error("Failed to replace activity: %s", e)
            return current_activity

    def _generate_fallback_itinerary(self, preferences: Dict[str, Any], destination: str) -> Dict[str, Any]:
        """Safe structured fallback when external AI calls are unavailable or exhausted."""
        days = preferences.get("days", 3)
        curr = preferences.get("currency", "INR")
        budget = preferences.get("budget", 100000)
        return {
            "title": f"A Curated Journey to {destination}",
            "summary": f"A balanced travel itinerary exploring the most celebrated highlights and local character of {destination}.",
            "destination": destination,
            "origin": preferences.get("origin", "New Delhi"),
            "duration_days": days,
            "travelers": preferences.get("travelers", 2),
            "currency": curr,
            "flights": {
                "outbound": {
                    "airline": "National Carrier / Partner Airline",
                    "flight_number": "FL-101",
                    "departure_airport": preferences.get("origin", "DEL"),
                    "arrival_airport": destination,
                    "departure_time": "09:00 AM",
                    "arrival_time": "02:30 PM",
                    "duration": "5h 30m",
                    "layovers": "Non-stop",
                    "estimated_price_per_person": int(budget * 0.2),
                    "booking_advice": "Check flexible booking options directly on airline site."
                },
                "return": {
                    "airline": "National Carrier / Partner Airline",
                    "flight_number": "FL-102",
                    "departure_airport": destination,
                    "arrival_airport": preferences.get("origin", "DEL"),
                    "departure_time": "04:00 PM",
                    "arrival_time": "09:30 PM",
                    "duration": "5h 30m",
                    "layovers": "Non-stop",
                    "estimated_price_per_person": int(budget * 0.2),
                    "booking_advice": "Verify return baggage limits."
                }
            },
            "transfers": [
                {
                    "mode": "Express Airport Link or Pre-booked Taxi",
                    "from": "Arrival Airport",
                    "to": "City Accommodation",
                    "duration": "40 mins",
                    "estimated_cost": 2000,
                    "tips": "Airport taxi counters or official transit passes offer fixed pricing."
                }
            ],
            "accommodations": [
                {
                    "name": f"The Grand Heritage Stay {destination}",
                    "category": "4-Star Boutique",
                    "neighborhood": "City Center",
                    "nightly_rate": int((budget * 0.3) / max(1, days)),
                    "total_stay_cost": int(budget * 0.3),
                    "amenities": ["Wi-Fi", "Breakfast", "Prime Location"],
                    "image_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
                    "booking_advice": "Verified provider listing."
                }
            ],
            "days": [
                {
                    "day_number": i + 1,
                    "title": f"Day {i + 1}: Iconic Sights & Culinary Flavors",
                    "summary": f"Immerse yourself in landmark attractions and regional cuisine in {destination}.",
                    "morning": {
                        "title": f"Historic Walking Tour & Architectural Highlights",
                        "description": "Explore timeless avenues, historic districts, and scenic vantage points.",
                        "location": f"Old Town / Central Landmark, {destination}",
                        "time": "09:30 AM",
                        "duration_min": 120,
                        "estimated_cost": 1000
                    },
                    "afternoon": {
                        "title": f"Cultural Discovery & Local Markets",
                        "description": "Stroll through artisan craft stalls, botanical gardens, and museum galleries.",
                        "location": f"Artisans Quarter, {destination}",
                        "time": "02:00 PM",
                        "duration_min": 150,
                        "estimated_cost": 1500
                    },
                    "evening": {
                        "title": f"Gastronomic Tasting & Sunset Views",
                        "description": "Savor authentic regional specialties paired with scenic evening panoramas.",
                        "location": f"Waterfront / Skyline District, {destination}",
                        "time": "07:30 PM",
                        "duration_min": 120,
                        "estimated_cost": 2500
                    }
                } for i in range(days)
            ],
            "budget_breakdown": {
                "flights_total": int(budget * 0.4),
                "accommodation_total": int(budget * 0.3),
                "transfers_and_transit": int(budget * 0.05),
                "activities_and_tickets": int(budget * 0.1),
                "food_and_dining": int(budget * 0.1),
                "contingency_fund": int(budget * 0.05),
                "estimated_grand_total": int(budget * 0.95),
                "remaining_budget": int(budget * 0.05),
                "budget_status": "within_budget"
            },
            "practical_tips": [
                "Keep a digital copy of your travel documents and local offline maps.",
                "Most urban transit lines accept contactless payments.",
                "Verify museum and gallery reservation rules ahead of time."
            ]
        }

    def chat_assistant(self, message: str, history: Optional[List[Dict[str, str]]] = None) -> str:
        """Answer traveler questions about the PlanMyTravel website and services."""
        msg_clean = (message or "").strip()
        if not msg_clean:
            return "Hello! I am your PlanMyTravel AI concierge. How can I assist you with your journeys, stays, guides, or wallet today?"

        system_instruction = (
            "You are the official AI Assistant for PlanMyTravel (inspired by Airbnb luxury aesthetics). "
            "Help travelers with website questions, destinations, AI itineraries, curated stays, personal local guides, "
            "Trip Wallet payments, and journey expense tracking. "
            "Key features:\n"
            "- Concierge AI Planner: Click 'AI Concierge' to customize origin, dates, budget in INR (₹), and pace for full day-by-day plans.\n"
            "- Curated Stays: Verified luxury hotels/ryokans with interactive Google Maps & date-specific weather forecasts.\n"
            "- Personal Local Guides: Professional verified guides in each region. Users can apply at '/become-a-guide' with photo and government ID.\n"
            "- Trip Wallet: Digital ledger in INR for instant 1-click booking and expense settlement.\n"
            "- Journey Expense Tracker: Track total trip spending, receive over-expense alerts, and pay directly through wallet.\n"
            "- Verified Reviews: Authenticity-guaranteed reviews from travelers who completed their trips.\n"
            "Keep answers concise, friendly, and formatted in clean markdown. Always mention prices in ₹ (INR)."
        )

        # Contextual prompt
        history_context = ""
        if history:
            for item in history[-4:]:
                role = item.get("role", "user")
                content = item.get("content", "")
                history_context += f"{role.capitalize()}: {content}\n"

        prompt = f"{history_context}User: {msg_clean}\nAssistant:"

        try:
            response = self._call_gemini_with_fallback(prompt, system_instruction)
            if response and len(response.strip()) > 10:
                return response.strip()
        except Exception as e:
            logger.warning("Gemini chat call failed: %s. Using rule-based fallback.", e)

        # High-quality rule-based fallback responses
        lower_q = msg_clean.lower()
        if any(w in lower_q for w in ["plan", "itinerary", "concierge", "ai trip", "generate"]):
            return (
                "**How to Plan with AI Concierge:**\n"
                "1. Click **AI Concierge** in the top navigation.\n"
                "2. Choose your destination, travel duration, number of guests, and approximate budget in ₹ (INR).\n"
                "3. Our AI crafts a bespoke day-by-day itinerary with matched boutique stays, curated activities, and transit advice in seconds!"
            )
        elif any(w in lower_q for w in ["wallet", "balance", "money", "pay", "topup", "recharge"]):
            return (
                "**PlanMyTravel Trip Wallet:**\n"
                "- Your real-time wallet balance is always visible in the navigation bar.\n"
                "- Top up securely using UPI or cards on the **Trip Wallet** page.\n"
                "- Use your wallet balance for 1-click bookings and settling on-trip expenses with zero gateway fees."
            )
        elif any(w in lower_q for w in ["expense", "tracker", "budget", "overexpense", "alert"]):
            return (
                "**Journey Expense Tracker:**\n"
                "- Track your overall expenses throughout your trip by category (stays, flights, food, activities).\n"
                "- Set your trip budget and get instant **Overexpense Alerts** if your spending exceeds the target.\n"
                "- Settle individual expenses directly with a single click using your Trip Wallet!"
            )
        elif any(w in lower_q for w in ["guide", "local guide", "become a guide", "tour guide"]):
            return (
                "**Personal Local Guides:**\n"
                "- Browse verified personal guides across top destinations (Singapore, Kyoto, Amalfi, Alps, Udaipur, Thailand).\n"
                "- Want to guide travelers? Visit **Become a Guide** (`/become-a-guide`), upload your portrait and government ID for staff verification, and start hosting!"
            )
        elif any(w in lower_q for w in ["stay", "hotel", "weather", "map"]):
            return (
                "**Curated Stays & Live Weather:**\n"
                "- Explore our handpicked boutique stays with interactive Google Maps.\n"
                "- Enter your check-in dates to see live weather forecasts and packing tips for your stay's specific location!"
            )
        elif any(w in lower_q for w in ["review", "fake review", "feedback", "rating"]):
            return (
                "**Verified Reviews:**\n"
                "- All published reviews feature genuine traveler insights on stay hospitality, quietness, and breakfast.\n"
                "- Only verified travelers with completed bookings are authorized to submit new reviews."
            )
        else:
            return (
                "Welcome to **PlanMyTravel**! I can assist you with:\n"
                "- ✈️ **AI Concierge**: Generating personalized itineraries\n"
                "- 🏨 **Stays**: Boutique hotel recommendations, maps, and weather\n"
                "- 🧭 **Personal Guides**: Connecting with local experts or registering as a guide\n"
                "- 💳 **Trip Wallet & Expense Tracker**: Tracking your budget and 1-click payments\n\n"
                "Feel free to ask me anything about your upcoming journey!"
            )


import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List
from flask import Blueprint, request, jsonify, g
from backend.utils.auth_helpers import optional_login, login_required
from backend.services.wallet_service import WalletService
from backend.database import db

logger = logging.getLogger(__name__)
rental_bp = Blueprint("rental_bp", __name__, url_prefix="/api/rentals")

# Curated international fleet across destinations
VEHICLE_CATALOG: List[Dict[str, Any]] = [
    # --- BALI / INDONESIA ---
    {
        "id": "veh_bali_scooter_1",
        "name": "Honda Scoopy Smart Key 110cc",
        "category": "scooter",
        "location": "Bali",
        "city": "Ubud & Seminyak",
        "country": "Indonesia",
        "image_url": "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
        "daily_rate": 450.0,
        "hourly_rate": 60.0,
        "security_deposit": 1500.0,
        "currency": "INR",
        "transmission": "Automatic",
        "fuel_type": "Petrol (4.2L Tank)",
        "engine_capacity": "110cc",
        "seats": 2,
        "luggage_capacity": "1 under-seat bag + phone mount",
        "mileage": "Unlimited Kilometers",
        "has_chauffeur": False,
        "inclusions": [
            "2 Sanitized Helmets included",
            "Comprehensive Third-Party Insurance",
            "Free Hotel Delivery in Ubud & Seminyak",
            "24/7 Island Roadside Assistance",
            "Waterproof Phone Mount with USB Charger"
        ],
        "requirements": {
            "min_age": 18,
            "license": "Valid National or International Driving Permit (IDP Class A)",
            "deposit_type": "Refundable Cash or Card Hold",
            "fuel_policy": "Full-to-Full"
        },
        "pickup_locations": ["Ngurah Rai Airport Terminal", "Ubud Central Desk", "Seminyak Beach Office", "Free Villa Delivery"],
        "rating": 4.94,
        "review_count": 312,
        "supplier": "Bali Heritage MotoRent"
    },
    {
        "id": "veh_bali_bike_1",
        "name": "Royal Enfield Classic 350 Desert Sand",
        "category": "motorbike",
        "location": "Bali",
        "city": "Ubud & Kintamani",
        "country": "Indonesia",
        "image_url": "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80",
        "daily_rate": 2200.0,
        "hourly_rate": 280.0,
        "security_deposit": 5000.0,
        "currency": "INR",
        "transmission": "Manual (5-Speed)",
        "fuel_type": "Petrol (13L Tank)",
        "engine_capacity": "349cc Single Cylinder",
        "seats": 2,
        "luggage_capacity": "Twin leather saddlebags",
        "mileage": "Unlimited Kilometers",
        "has_chauffeur": False,
        "inclusions": [
            "2 Premium Retro Helmets",
            "Dual-Channel ABS Protection",
            "Waterproof Saddlebags included",
            "Full Collision Damage Waiver (Zero-excess)",
            "Volcano Pass & Highland Road Map"
        ],
        "requirements": {
            "min_age": 21,
            "license": "Motorcycle Driving License + IDP",
            "deposit_type": "Credit Card Hold",
            "fuel_policy": "Full-to-Full"
        },
        "pickup_locations": ["Ubud Central Hub", "Canggu Station", "Airport Meet & Greet"],
        "rating": 4.97,
        "review_count": 184,
        "supplier": "Island Cruiser Guild"
    },
    {
        "id": "veh_bali_cab_1",
        "name": "Toyota Innova Crysta VIP Chauffeur Cab",
        "category": "cab",
        "location": "Bali",
        "city": "All Bali Districts",
        "country": "Indonesia",
        "image_url": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
        "daily_rate": 3400.0,
        "hourly_rate": 450.0,
        "security_deposit": 0.0,
        "currency": "INR",
        "transmission": "Automatic (With Dedicated Chauffeur)",
        "fuel_type": "Diesel / Clean Air",
        "engine_capacity": "2.4L Turbo",
        "seats": 6,
        "luggage_capacity": "4 Large Suitcases + 3 Hand Luggage",
        "mileage": "Unlimited Daily Island Touring",
        "has_chauffeur": True,
        "inclusions": [
            "Professional English-Speaking Private Chauffeur",
            "All Island Fuel & Parking Tolls Included",
            "10 Consecutive Hours Daily Service",
            "Chilled Mineral Water & Wet Towelettes",
            "Airport Pickup & Drop with Name Placard"
        ],
        "requirements": {
            "min_age": 0,
            "license": "No Driving License Required (Professional Chauffeur provided)",
            "deposit_type": "Zero Deposit",
            "fuel_policy": "Fuel Fully Included"
        },
        "pickup_locations": ["Ngurah Rai Airport Terminal", "Direct Resort/Villa Lobby Pickup"],
        "rating": 4.99,
        "review_count": 420,
        "supplier": "Bali Luxury Chauffeur Fleet"
    },

    # --- KYOTO & TOKYO / JAPAN ---
    {
        "id": "veh_jp_scooter_1",
        "name": "Panasonic Gyutto Heritage Electric City E-Bike",
        "category": "scooter",
        "location": "Kyoto",
        "city": "Kyoto",
        "country": "Japan",
        "image_url": "https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=800&q=80",
        "daily_rate": 950.0,
        "hourly_rate": 120.0,
        "security_deposit": 2000.0,
        "currency": "INR",
        "transmission": "Pedal-Assist 3-Speed Electric",
        "fuel_type": "Electric (80km Battery Range per Charge)",
        "engine_capacity": "250W Whisper Motor",
        "seats": 1,
        "luggage_capacity": "Front woven wicker shopping basket",
        "mileage": "Unlimited Daily Use",
        "has_chauffeur": False,
        "inclusions": [
            "Smart Bluetooth Ring Lock",
            "Lightweight Japanese Helmet included",
            "Kyoto Temple Bicycle Parking Pass Map",
            "Free Battery Swap at 12 City Stations",
            "Anti-Theft Insurance"
        ],
        "requirements": {
            "min_age": 16,
            "license": "No Motor License Required (Bicycle regulations apply)",
            "deposit_type": "Credit Card Hold",
            "fuel_policy": "Charged to 100% on delivery"
        },
        "pickup_locations": ["Kyoto Station Central Gate", "Gion Shijo Depot", "Arashiyama Tourist Office", "Hotel Delivery"],
        "rating": 4.96,
        "review_count": 275,
        "supplier": "Kyoto Green Mobility"
    },
    {
        "id": "veh_jp_bike_1",
        "name": "Yamaha MT-07 Alpine & Lake Touring",
        "category": "motorbike",
        "location": "Kyoto",
        "city": "Kyoto & Lake Biwa",
        "country": "Japan",
        "image_url": "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80",
        "daily_rate": 5200.0,
        "hourly_rate": 650.0,
        "security_deposit": 12000.0,
        "currency": "INR",
        "transmission": "Manual (6-Speed)",
        "fuel_type": "Petrol (14L Tank)",
        "engine_capacity": "689cc CP2 Parallel Twin",
        "seats": 2,
        "luggage_capacity": "Hard rear top case + tank bag",
        "mileage": "Unlimited Kilometers",
        "has_chauffeur": False,
        "inclusions": [
            "Japanese ETC Toll Card Reader included",
            "QuadLock Vibration-Dampening Phone Mount",
            "Arai DOT/SNELL Certified Helmet",
            "Comprehensive Collision & Theft Waiver",
            "Lake Biwa Scenic Mountain Pass Routing"
        ],
        "requirements": {
            "min_age": 21,
            "license": "Large Motorcycle License + International Driving Permit (Geneva 1949 Convention)",
            "deposit_type": "Credit Card Hold",
            "fuel_policy": "Full-to-Full"
        },
        "pickup_locations": ["Kyoto Station South Plaza", "Osaka Itami Airport Office"],
        "rating": 4.98,
        "review_count": 142,
        "supplier": "Nippon Moto Touring"
    },
    {
        "id": "veh_jp_cab_1",
        "name": "Toyota Crown Royal Executive Chauffeur Cab",
        "category": "cab",
        "location": "Kyoto",
        "city": "Kyoto & Nara",
        "country": "Japan",
        "image_url": "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=800&q=80",
        "daily_rate": 7800.0,
        "hourly_rate": 950.0,
        "security_deposit": 0.0,
        "currency": "INR",
        "transmission": "Automatic (With Licensed Chauffeur)",
        "fuel_type": "Hybrid Synergy Drive",
        "engine_capacity": "2.5L Hybrid",
        "seats": 4,
        "luggage_capacity": "3 Large Hard-case Suitcases",
        "mileage": "Unlimited Kyoto & Nara Touring",
        "has_chauffeur": True,
        "inclusions": [
            "Licensed English/Japanese Speaking Chauffeur",
            "White-Glove Door Service & Umbrellas",
            "Express Highway Tolls & Fuel Included",
            "Curated Temple Drop-off without Parking Delays",
            "Refreshments & On-board Wi-Fi Hotspot"
        ],
        "requirements": {
            "min_age": 0,
            "license": "No License Required (Professional Chauffeur)",
            "deposit_type": "Zero Deposit",
            "fuel_policy": "Fuel Fully Included"
        },
        "pickup_locations": ["Kyoto Station Shinkansen Gate", "Ryokan/Hotel Direct Lobby"],
        "rating": 4.99,
        "review_count": 380,
        "supplier": "Kyoto Royal Chauffeurs"
    },

    # --- SANTORINI / GREECE ---
    {
        "id": "veh_gr_scooter_1",
        "name": "Vespa Primavera 125cc Italian Heritage",
        "category": "scooter",
        "location": "Santorini",
        "city": "Oia & Fira",
        "country": "Greece",
        "image_url": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
        "daily_rate": 1600.0,
        "hourly_rate": 200.0,
        "security_deposit": 3000.0,
        "currency": "INR",
        "transmission": "Automatic",
        "fuel_type": "Petrol (8L Tank)",
        "engine_capacity": "125cc i-get",
        "seats": 2,
        "luggage_capacity": "Under-seat compartment + leather rear trunk",
        "mileage": "Unlimited Island Kilometers",
        "has_chauffeur": False,
        "inclusions": [
            "2 Vintage Mediterranean Helmets",
            "Island Windscreen & Rear Top Box",
            "Full Third-Party & Collision Insurance",
            "Free Delivery to any Oia / Fira Cave Suite",
            "Santorini Secret Caldera Viewpoint Map"
        ],
        "requirements": {
            "min_age": 21,
            "license": "EU Driving License (A1/A) or International Driving Permit",
            "deposit_type": "Card Pre-Authorization",
            "fuel_policy": "Same-to-Same"
        },
        "pickup_locations": ["Santorini Thira Airport (JTR)", "Athinios Ferry Port", "Oia Village Office", "Hotel Delivery"],
        "rating": 4.97,
        "review_count": 290,
        "supplier": "Aegean Coast Scooters"
    },
    {
        "id": "veh_gr_bike_1",
        "name": "Kymco MXU 300cc All-Terrain Quad / ATV",
        "category": "motorbike",
        "location": "Santorini",
        "city": "Santorini Island-wide",
        "country": "Greece",
        "image_url": "https://images.unsplash.com/photo-1558980394-4c7c9299fe96?auto=format&fit=crop&w=800&q=80",
        "daily_rate": 2800.0,
        "hourly_rate": 350.0,
        "security_deposit": 5000.0,
        "currency": "INR",
        "transmission": "Automatic CVT with Reverse",
        "fuel_type": "Petrol (12.5L Tank)",
        "engine_capacity": "271cc Liquid-Cooled",
        "seats": 2,
        "luggage_capacity": "Front & Rear Heavy-Duty Cargo Racks",
        "mileage": "Unlimited Island Kilometers",
        "has_chauffeur": False,
        "inclusions": [
            "2 Heavy-Duty Helmets & Dust Goggles",
            "Caldera & Red Beach Off-Road Capability",
            "24/7 Island Mechanical Assistance",
            "Full Collision Insurance Coverage",
            "Beach Towel Cargo Box"
        ],
        "requirements": {
            "min_age": 21,
            "license": "Standard Car Driving License (Class B) or Motorcycle License + IDP",
            "deposit_type": "Credit Card Hold",
            "fuel_policy": "Full-to-Full"
        },
        "pickup_locations": ["Santorini Airport Desk", "Athinios Port Terminal", "Fira Central Plaza"],
        "rating": 4.95,
        "review_count": 310,
        "supplier": "Santorini Caldera Wheels"
    },
    {
        "id": "veh_gr_cab_1",
        "name": "Fiat 500 Cabriolet Open-Air Island Convertible",
        "category": "cab",
        "location": "Santorini",
        "city": "Santorini Island-wide",
        "country": "Greece",
        "image_url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
        "daily_rate": 3800.0,
        "hourly_rate": 480.0,
        "security_deposit": 6000.0,
        "currency": "INR",
        "transmission": "Automatic",
        "fuel_type": "Hybrid Mild 1.0L",
        "engine_capacity": "1.0L Hybrid",
        "seats": 4,
        "luggage_capacity": "2 Medium Suitcases",
        "mileage": "Unlimited Island Kilometers",
        "has_chauffeur": False,
        "inclusions": [
            "Electric Retractable Canvas Soft-Top",
            "Apple CarPlay / Android Auto Navigation",
            "Zero Deductible Insurance Protection",
            "Free Port / Airport Terminal Transfer",
            "No Cancellation Fees up to 24h Prior"
        ],
        "requirements": {
            "min_age": 21,
            "license": "Valid National Driving License + IDP",
            "deposit_type": "Credit Card Pre-Authorization",
            "fuel_policy": "Full-to-Full"
        },
        "pickup_locations": ["Santorini Airport (JTR)", "Oia Central Parking", "Port Terminal"],
        "rating": 4.96,
        "review_count": 215,
        "supplier": "Cyclades Boutique Rentals"
    },

    # --- SWISS ALPS / SWITZERLAND ---
    {
        "id": "veh_ch_bike_1",
        "name": "BMW R1250 GS Adventure Alpine Edition",
        "category": "motorbike",
        "location": "Swiss Alps",
        "city": "Zermatt, Grindelwald & Interlaken",
        "country": "Switzerland",
        "image_url": "https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?auto=format&fit=crop&w=800&q=80",
        "daily_rate": 9800.0,
        "hourly_rate": 1250.0,
        "security_deposit": 20000.0,
        "currency": "INR",
        "transmission": "Manual (6-Speed with Shift Assist Pro)",
        "fuel_type": "Petrol (30L Tank)",
        "engine_capacity": "1,254cc Boxer Twin (136 HP)",
        "seats": 2,
        "luggage_capacity": "Triple Aluminum Panniers (112L total)",
        "mileage": "300 km/day included (Unlimited optional)",
        "has_chauffeur": False,
        "inclusions": [
            "Heated Grips & Heated Saddle for Cold Alpine Passes",
            "BMW Motorrad Connected GPS with Furka & Grimsel routes",
            "Swiss Motorway Vignette Included",
            "Comprehensive Collision & Mountain Rescue Insurance",
            "Rain Gear & Premium GORE-TEX Gloves"
        ],
        "requirements": {
            "min_age": 25,
            "license": "Unrestricted Motorcycle License (Class A) held 2+ years + IDP",
            "deposit_type": "Credit Card Hold",
            "fuel_policy": "Full-to-Full"
        },
        "pickup_locations": ["Zurich Airport Desk", "Interlaken Hub", "Tasch/Zermatt Terminal"],
        "rating": 4.99,
        "review_count": 168,
        "supplier": "Swiss Alpine Moto Tours"
    },
    {
        "id": "veh_ch_cab_1",
        "name": "Tesla Model Y Long Range AWD All-Weather",
        "category": "cab",
        "location": "Swiss Alps",
        "city": "Zurich, Lucerne & Grindelwald",
        "country": "Switzerland",
        "image_url": "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80",
        "daily_rate": 7200.0,
        "hourly_rate": 900.0,
        "security_deposit": 15000.0,
        "currency": "INR",
        "transmission": "Automatic Electric Dual Motor",
        "fuel_type": "100% Electric (530km Range)",
        "engine_capacity": "Dual Motor All-Wheel Drive",
        "seats": 5,
        "luggage_capacity": "4 Large Suitcases + Frunk Storage",
        "mileage": "Unlimited Swiss Kilometers",
        "has_chauffeur": False,
        "inclusions": [
            "Tesla Supercharger Network Access across Switzerland",
            "Winter M+S Tires & Snow Chains for Mountain Passes",
            "Swiss National Motorway Vignette Included",
            "Panoramic All-Glass Roof for Alpine Peak Viewing",
            "Autopilot Navigation on Swiss Motorways"
        ],
        "requirements": {
            "min_age": 23,
            "license": "Valid Driver's License held 1+ year + IDP",
            "deposit_type": "Credit Card Pre-Authorization",
            "fuel_policy": "Return with min 70% charge"
        },
        "pickup_locations": ["Zurich Airport (ZRH)", "Geneva Airport", "Interlaken Rail Hub"],
        "rating": 4.98,
        "review_count": 240,
        "supplier": "Swiss Green EV Rental"
    },

    # --- REYKJAVIK & GOLDEN CIRCLE / ICELAND ---
    {
        "id": "veh_is_cab_1",
        "name": "Dacia Duster 4x4 Highland & F-Road Expedition",
        "category": "cab",
        "location": "Reykjavik",
        "city": "Reykjavik & Golden Circle",
        "country": "Iceland",
        "image_url": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
        "daily_rate": 5200.0,
        "hourly_rate": 650.0,
        "security_deposit": 10000.0,
        "currency": "INR",
        "transmission": "Manual 6-Speed 4WD",
        "fuel_type": "Diesel / Clean AWD",
        "engine_capacity": "1.5L dCi Turbo",
        "seats": 5,
        "luggage_capacity": "3 Large Suitcases + Camping Packs",
        "mileage": "Unlimited Kilometers",
        "has_chauffeur": False,
        "inclusions": [
            "F-Road Highland Approved Ground Clearance",
            "Studded Winter Tires & Gravel Protection Insurance",
            "Gravel, Sand & Ash Damage Waiver (SAW)",
            "24/7 Arctic Roadside Rescue Coverage",
            "Free Cancellation up to 24h prior"
        ],
        "requirements": {
            "min_age": 20,
            "license": "National Driver's License held 1+ year + IDP",
            "deposit_type": "Credit Card Hold",
            "fuel_policy": "Full-to-Full"
        },
        "pickup_locations": ["Keflavik International Airport (KEF)", "Reykjavik Downtown Office"],
        "rating": 4.97,
        "review_count": 310,
        "supplier": "Nordic Highland 4x4"
    },

    # --- UDAIPUR & RAJASTHAN / INDIA ---
    {
        "id": "veh_in_scooter_1",
        "name": "Honda Activa 6G Premium City Explorer",
        "category": "scooter",
        "location": "Udaipur & Rajasthan",
        "city": "Udaipur",
        "country": "India",
        "image_url": "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
        "daily_rate": 500.0,
        "hourly_rate": 70.0,
        "security_deposit": 1000.0,
        "currency": "INR",
        "transmission": "Automatic (CVT)",
        "fuel_type": "Petrol (5.3L Tank)",
        "engine_capacity": "109cc HET BS6",
        "seats": 2,
        "luggage_capacity": "Under-seat storage + floor hook",
        "mileage": "Unlimited City Travel",
        "has_chauffeur": False,
        "inclusions": [
            "2 ISI Certified Helmets",
            "Third-Party Comprehensive Insurance",
            "Free Hotel Delivery near Lake Pichola",
            "City Gate & Ghat Route Guide",
            "24/7 Local Support"
        ],
        "requirements": {
            "min_age": 18,
            "license": "Valid Indian Driving License or International Driving Permit",
            "deposit_type": "Cash or UPI Deposit",
            "fuel_policy": "Same-to-Same"
        },
        "pickup_locations": ["Udaipur City Railway Station", "Lake Pichola Ghat Depot", "Hotel Delivery"],
        "rating": 4.92,
        "review_count": 420,
        "supplier": "Mewar City Wheels"
    },
    {
        "id": "veh_in_bike_1",
        "name": "Royal Enfield Himalayan 450 Sherpa",
        "category": "motorbike",
        "location": "Udaipur & Rajasthan",
        "city": "Udaipur & Kumbhalgarh",
        "country": "India",
        "image_url": "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80",
        "daily_rate": 1600.0,
        "hourly_rate": 220.0,
        "security_deposit": 3000.0,
        "currency": "INR",
        "transmission": "Manual (6-Speed with Slipper Clutch)",
        "fuel_type": "Petrol (17L Tank)",
        "engine_capacity": "452cc Liquid-Cooled Sherpa (40 HP)",
        "seats": 2,
        "luggage_capacity": "Rear tail rack + tank bag",
        "mileage": "Unlimited Touring Kilometers",
        "has_chauffeur": False,
        "inclusions": [
            "2 Full-Face Dual Sport Helmets",
            "Switchable Rear ABS for Gravel Fort Trails",
            "Engine Guard & Knuckle Protectors",
            "Rajasthan Fort Scenic Highway Map",
            "Full Roadside Assistance"
        ],
        "requirements": {
            "min_age": 21,
            "license": "Valid Motorcycle License with Gear + IDP",
            "deposit_type": "Card or UPI Security Hold",
            "fuel_policy": "Full-to-Full"
        },
        "pickup_locations": ["Udaipur Central Station", "Fateh Sagar Lake Hub", "Airport Desk"],
        "rating": 4.96,
        "review_count": 280,
        "supplier": "Royal Rajputana Rides"
    },
    {
        "id": "veh_in_cab_1",
        "name": "Toyota Innova Crysta Luxury Chauffeur Cab",
        "category": "cab",
        "location": "Udaipur & Rajasthan",
        "city": "Udaipur, Jodhpur & Jaipur",
        "country": "India",
        "image_url": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
        "daily_rate": 2800.0,
        "hourly_rate": 350.0,
        "security_deposit": 0.0,
        "currency": "INR",
        "transmission": "Automatic (Dedicated Chauffeur)",
        "fuel_type": "Diesel",
        "engine_capacity": "2.4L Turbo",
        "seats": 6,
        "luggage_capacity": "4 Large Bags + 3 Duffels",
        "mileage": "250 km/day included (Fuel included)",
        "has_chauffeur": True,
        "inclusions": [
            "Professional Uniformed Local Chauffeur",
            "Fuel, Toll Taxes & State Border Permits Included",
            "8 Hours / 80km or Outstation Fort Itineraries",
            "Chilled Packaged Water & Hand Sanitizer",
            "Airport Pickup with Name Signboard"
        ],
        "requirements": {
            "min_age": 0,
            "license": "No License Required (Experienced Driver Provided)",
            "deposit_type": "Zero Deposit",
            "fuel_policy": "Fuel Fully Covered"
        },
        "pickup_locations": ["Maharana Pratap Airport (UDR)", "Udaipur Railway Station", "Any Hotel Lobby"],
        "rating": 4.98,
        "review_count": 510,
        "supplier": "Rajasthan Heritage Chauffeurs"
    },

    # --- SINGAPORE ---
    {
        "id": "veh_sg_scooter_1",
        "name": "Segway Ninebot Max City Electric Scooter",
        "category": "scooter",
        "location": "Singapore",
        "city": "Marina Bay & Sentosa",
        "country": "Singapore",
        "image_url": "https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=800&q=80",
        "daily_rate": 800.0,
        "hourly_rate": 100.0,
        "security_deposit": 2000.0,
        "currency": "INR",
        "transmission": "Thumb Throttle Electric Drive",
        "fuel_type": "Electric (65km Range)",
        "engine_capacity": "350W High-Torque Motor",
        "seats": 1,
        "luggage_capacity": "Hook for backpack (max 10kg)",
        "mileage": "Unlimited Daily Riding",
        "has_chauffeur": False,
        "inclusions": [
            "Singapore LTA Compliant Speed Limiter (25 km/h)",
            "Safety Helmet & Front/Rear LED Night Lights",
            "Park Connector Network (PCN) Route Map",
            "Fast Magnetic Charger Included",
            "Sentosa Island Boardwalk Clearance"
        ],
        "requirements": {
            "min_age": 16,
            "license": "No License Required (LTA PMD rules apply)",
            "deposit_type": "Credit Card Hold",
            "fuel_policy": "Fully Charged on Pickup"
        },
        "pickup_locations": ["Marina Bay Sands Promenade", "Sentosa Express Station", "Changi Jewel Hub"],
        "rating": 4.93,
        "review_count": 340,
        "supplier": "Lion City E-Mobility"
    },
    {
        "id": "veh_sg_cab_1",
        "name": "Mercedes-Benz E-Class Luxury Executive Chauffeur",
        "category": "cab",
        "location": "Singapore",
        "city": "Singapore Island-wide",
        "country": "Singapore",
        "image_url": "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=800&q=80",
        "daily_rate": 6800.0,
        "hourly_rate": 850.0,
        "security_deposit": 0.0,
        "currency": "INR",
        "transmission": "Automatic (Dedicated Chauffeur)",
        "fuel_type": "Hybrid Mild Drive",
        "engine_capacity": "2.0L Turbo",
        "seats": 4,
        "luggage_capacity": "3 Large Suitcases",
        "mileage": "Unlimited Island Touring",
        "has_chauffeur": True,
        "inclusions": [
            "Licensed English-Speaking Executive Chauffeur",
            "Changi Airport VIP Gate Meet & Greet",
            "Electronic Road Pricing (ERP) & Parking Covered",
            "Complimentary High-Speed Wi-Fi & Bottled Evian",
            "Door-to-Door Dining & Meeting Transfers"
        ],
        "requirements": {
            "min_age": 0,
            "license": "No License Required (Professional Chauffeur)",
            "deposit_type": "Zero Deposit",
            "fuel_policy": "Fuel Fully Included"
        },
        "pickup_locations": ["Changi Airport Terminals 1-4", "Marina Bay Sands Lobby", "Any Singapore Hotel"],
        "rating": 4.99,
        "review_count": 480,
        "supplier": "Singapore Prestige Chauffeur"
    }
]

# Popular location suggestions
POPULAR_LOCATIONS = [
    {"name": "Bali", "country": "Indonesia", "tag": "Island Scooters & Private Cabs"},
    {"name": "Kyoto", "country": "Japan", "tag": "Electric City Bikes & Executive Cabs"},
    {"name": "Santorini", "country": "Greece", "tag": "Cliffside Vespas & Quad ATVs"},
    {"name": "Swiss Alps", "country": "Switzerland", "tag": "Alpine Touring Bikes & EV AWD"},
    {"name": "Reykjavik", "country": "Iceland", "tag": "Highland 4x4s & Trail Bikes"},
    {"name": "Udaipur & Rajasthan", "country": "India", "tag": "Royal Enfield Bikes & City Scooters"},
    {"name": "Singapore", "country": "Singapore", "tag": "Park E-Scooters & Mercedes Cabs"},
]


@rental_bp.route("/locations", methods=["GET"])
def get_popular_locations():
    """Return top rental locations."""
    return jsonify({"locations": POPULAR_LOCATIONS})


@rental_bp.route("", methods=["GET"])
def get_vehicles():
    """Retrieve available rental vehicles matching location and category filters."""
    loc_query = request.args.get("location", "").strip().lower()
    category = request.args.get("category", "all").strip().lower()
    sort_by = request.args.get("sort", "rating_desc").strip().lower()
    max_price = request.args.get("max_price", type=float)

    results: List[Dict[str, Any]] = []

    # Map aliases for broader location matching
    location_aliases = {
        "bali": ["bali", "indonesia", "ubud", "seminyak", "canggu", "kuta"],
        "kyoto": ["kyoto", "japan", "tokyo", "osaka", "nara"],
        "japan": ["kyoto", "japan", "tokyo", "osaka"],
        "santorini": ["santorini", "greece", "oia", "fira", "cyclades"],
        "greece": ["santorini", "greece", "oia", "fira", "cyclades"],
        "swiss alps": ["swiss", "switzerland", "zermatt", "grindelwald", "interlaken", "zurich"],
        "switzerland": ["swiss", "switzerland", "zermatt", "grindelwald", "interlaken", "zurich"],
        "reykjavik": ["reykjavik", "iceland", "golden circle", "keflavik"],
        "iceland": ["reykjavik", "iceland", "golden circle", "keflavik"],
        "udaipur": ["udaipur", "rajasthan", "india", "jaipur"],
        "india": ["udaipur", "rajasthan", "india", "delhi", "goa"],
        "singapore": ["singapore"],
    }

    search_terms = [loc_query]
    if loc_query:
        for key, aliases in location_aliases.items():
            if loc_query in key or any(t in loc_query for t in aliases):
                search_terms.extend(aliases)
    search_terms = list(set([t for t in search_terms if t]))

    for veh in VEHICLE_CATALOG:
        # Category filter
        if category and category != "all" and veh["category"] != category:
            continue

        # Max price filter
        if max_price and veh["daily_rate"] > max_price:
            continue

        # Location filter
        if search_terms:
            searchable = f"{veh['location']} {veh['city']} {veh['country']}".lower()
            if not any(term in searchable for term in search_terms):
                continue

        results.append(veh)

    # Fallback: If no exact location matched, return universal vehicles adapted to location
    if loc_query and not results:
        # Pick top 4 representative vehicles across all categories
        for v in VEHICLE_CATALOG[:6]:
            if category and category != "all" and v["category"] != category:
                continue
            adapted = dict(v)
            adapted["location"] = loc_query.capitalize()
            adapted["city"] = f"{loc_query.capitalize()} Central"
            results.append(adapted)

    # Default if no query is given: return all catalog items
    if not loc_query and not results:
        results = [v for v in VEHICLE_CATALOG if (category == "all" or v["category"] == category)]

    # Sorting
    if sort_by == "price_asc":
        results.sort(key=lambda x: x["daily_rate"])
    elif sort_by == "price_desc":
        results.sort(key=lambda x: x["daily_rate"], reverse=True)
    elif sort_by == "name_asc":
        results.sort(key=lambda x: x["name"])
    else:  # rating_desc
        results.sort(key=lambda x: x["rating"], reverse=True)

    return jsonify({
        "total": len(results),
        "location": loc_query,
        "category": category,
        "vehicles": results,
    })


@rental_bp.route("/<vehicle_id>", methods=["GET"])
def get_vehicle_details(vehicle_id: str):
    """Retrieve full rental terms and specs for a specific vehicle."""
    vehicle = next((v for v in VEHICLE_CATALOG if v["id"] == vehicle_id), None)
    if not vehicle:
        return jsonify({"error": "Vehicle not found"}), 404
    return jsonify({"vehicle": vehicle})


@rental_bp.route("/book", methods=["POST"])
@optional_login
def book_vehicle():
    """Book a rental vehicle with optional direct settlement from Trip Wallet."""
    data = request.get_json() or {}
    vehicle_id = data.get("vehicle_id", "").strip()
    days = int(data.get("days", 1))
    pickup_date = data.get("pickup_date", "").strip() or datetime.now(timezone.utc).strftime("%Y-%m-%d")
    return_date = data.get("return_date", "").strip()
    pickup_point = data.get("pickup_point", "Airport Terminal").strip()
    driver_name = data.get("driver_name", "").strip() or (g.current_user.name if g.current_user else "Traveler")
    driver_phone = data.get("driver_phone", "").strip()
    pay_with_wallet = bool(data.get("pay_with_wallet", False))

    vehicle = next((v for v in VEHICLE_CATALOG if v["id"] == vehicle_id), None)
    if not vehicle:
        return jsonify({"error": "Vehicle not found"}), 404

    if days < 1:
        return jsonify({"error": "Rental duration must be at least 1 day"}), 400

    total_amount = round(vehicle["daily_rate"] * days, 2)
    booking_reference = f"RNT-{uuid.uuid4().hex[:8].upper()}"

    paid_status = False
    new_wallet_balance = None

    if pay_with_wallet:
        if not g.current_user:
            return jsonify({"error": "Please log in to settle rental bookings via your Trip Wallet"}), 401

        try:
            idempotency_key = f"rnt_pay_{g.current_user.id}_{booking_reference}"
            WalletService.debit(
                user_id=g.current_user.id,
                amount_rupees=total_amount,
                idempotency_key=idempotency_key,
                description=f"Vehicle Rental: {vehicle['name']} ({days} days in {vehicle['location']})",
            )
            paid_status = True
            wallet = WalletService.get_or_create_wallet(g.current_user.id)
            new_wallet_balance = round(wallet.balance, 2)
        except ValueError as err:
            return jsonify({"error": str(err), "wallet_insufficient": True}), 400

    confirmation = {
        "booking_reference": booking_reference,
        "vehicle": {
            "id": vehicle["id"],
            "name": vehicle["name"],
            "category": vehicle["category"],
            "location": vehicle["location"],
            "image_url": vehicle["image_url"],
            "transmission": vehicle["transmission"],
        },
        "days": days,
        "daily_rate": vehicle["daily_rate"],
        "total_amount": total_amount,
        "security_deposit": vehicle["security_deposit"],
        "currency": "INR",
        "pickup_date": pickup_date,
        "return_date": return_date,
        "pickup_point": pickup_point,
        "driver_name": driver_name,
        "driver_phone": driver_phone,
        "paid_with_wallet": paid_status,
        "status": "confirmed",
        "inclusions": vehicle["inclusions"],
        "instructions": (
            f"Present your confirmation code {booking_reference} and valid driving license at {pickup_point}. "
            f"Supplier contact: {vehicle['supplier']}."
        ),
        "booked_at": datetime.now(timezone.utc).isoformat(),
    }

    logger.info("Rental booked: %s for %d days (Total ₹%.2f, Paid via Wallet: %s)", booking_reference, days, total_amount, paid_status)

    return jsonify({
        "success": True,
        "message": f"Rental confirmed! Reference: {booking_reference}" + (" (Paid via Trip Wallet)" if paid_status else " (Pay upon vehicle collection)"),
        "confirmation": confirmation,
        "wallet_balance": new_wallet_balance,
    }), 201

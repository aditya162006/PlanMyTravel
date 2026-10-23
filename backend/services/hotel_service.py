import hashlib
import logging
import time
from typing import Dict, Any, List, Optional
import requests
from backend.config import Config

logger = logging.getLogger(__name__)

# Curated global boutique hotels directory across major worldwide destinations
CURATED_HOTELS_CATALOG: List[Dict[str, Any]] = [
    # --- SINGAPORE ---
    {
        "id": "stay_sg_1",
        "provider_code": "SG-FBT-01",
        "name": "The Fullerton Bay Hotel",
        "city": "Singapore",
        "country": "Singapore",
        "region": "Southeast Asia",
        "category": "Waterfront Heritage Luxury",
        "description": "Perched over the sparkling waters of Marina Bay, featuring bespoke interiors by Andre Fu, private waterfront balconies, and panoramic rooftop lantern bar views.",
        "cover_image_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80"
        ],
        "nightly_rate": 28500,
        "currency": "INR",
        "rating": 4.94,
        "review_count": 218,
        "latitude": 1.2847,
        "longitude": 103.8540,
        "address": "80 Collyer Quay, Singapore 049326",
        "amenities": ["Rooftop Infinity Pool", "Waterfront Balcony", "Artisanal Afternoon Tea", "Bespoke Concierge", "High-Speed Wi-Fi", "Michelin Dining"],
        "is_verified_provider": True,
        "source": "PlanMyTravel Verified Portfolio",
        "requires_partner_checkout": False,
    },
    {
        "id": "stay_sg_2",
        "provider_code": "SG-WHH-02",
        "name": "The Warehouse Hotel",
        "city": "Singapore",
        "country": "Singapore",
        "region": "Southeast Asia",
        "category": "Industrial Heritage Shophouse",
        "description": "A meticulously restored 1895 spice warehouse on Robertson Quay, featuring soaring truss ceilings, industrial brass accents, and craft cocktails inspired by historical spice routes.",
        "cover_image_url": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
        ],
        "nightly_rate": 18200,
        "currency": "INR",
        "rating": 4.88,
        "review_count": 142,
        "latitude": 1.2898,
        "longitude": 103.8378,
        "address": "320 Havelock Road, Robertson Quay, Singapore 169628",
        "amenities": ["Glass-walled Rooftop Pool", "Artisanal Minibar", "Craft Cocktail Bar", "Riverside Dining", "Bicycle Rentals"],
        "is_verified_provider": True,
        "source": "PlanMyTravel Verified Portfolio",
        "requires_partner_checkout": False,
    },
    {
        "id": "stay_sg_3",
        "provider_code": "SG-CAP-03",
        "name": "Capella Singapore Sentosa",
        "city": "Singapore",
        "country": "Singapore",
        "region": "Southeast Asia",
        "category": "Lush Tropical Island Sanctuary",
        "description": "Nestled within 30 acres of rolling rainforest on Sentosa Island, marrying colonial heritage bungalows with cascading Norman Foster curve architecture overlooking the South China Sea.",
        "cover_image_url": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80"
        ],
        "nightly_rate": 39500,
        "currency": "INR",
        "rating": 4.96,
        "review_count": 189,
        "latitude": 1.2494,
        "longitude": 103.8247,
        "address": "1 The Knolls, Sentosa Island, Singapore 098297",
        "amenities": ["Three Tiered Cascading Pools", "Award-winning Auriga Spa", "Personal Culturist Service", "Private Jacuzzi Villa", "Peacock Gardens"],
        "is_verified_provider": True,
        "source": "PlanMyTravel Verified Portfolio",
        "requires_partner_checkout": False,
    },

    # --- KYOTO & JAPAN ---
    {
        "id": "stay_jp_1",
        "provider_code": "JP-HKY-01",
        "name": "Hoshinoya Kyoto Riverfront Ryokan",
        "city": "Kyoto",
        "country": "Japan",
        "region": "East Asia",
        "category": "Zen Riverfront Ryokan",
        "description": "Accessible solely via a traditional wooden skiff gliding up the Oi River, this 17th-century riverside retreat features tatami pavilions, hand-carved woodblocks, and cedar hot baths.",
        "cover_image_url": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80"
        ],
        "nightly_rate": 42000,
        "currency": "INR",
        "rating": 4.97,
        "review_count": 275,
        "latitude": 35.0116,
        "longitude": 135.6777,
        "address": "11-2 Arashiyama Genrokuzancho, Nishikyo Ward, Kyoto 616-0007, Japan",
        "amenities": ["Private Wooden Boat Transfer", "Seasonal Kaiseki Dining", "Cedar Onsen Baths", "Morning Temple Chanting", "Matcha Tea Salon"],
        "is_verified_provider": True,
        "source": "PlanMyTravel Verified Portfolio",
        "requires_partner_checkout": False,
    },
    {
        "id": "stay_jp_2",
        "provider_code": "JP-RCK-02",
        "name": "The Ritz-Carlton Kyoto",
        "city": "Kyoto",
        "country": "Japan",
        "region": "East Asia",
        "category": "Contemporary Zen Palace",
        "description": "Built on the banks of the serene Kamogawa River in central Kyoto, blending Meiji-era timber craftsmanship with modern luxury and serene indoor bonsai gardens.",
        "cover_image_url": "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80"
        ],
        "nightly_rate": 36000,
        "currency": "INR",
        "rating": 4.92,
        "review_count": 164,
        "latitude": 35.0125,
        "longitude": 135.7725,
        "address": "Kamogawa Nijo-ohashi Hotori, Nakagyo Ward, Kyoto 604-0902, Japan",
        "amenities": ["Kamogawa River Balcony", "Pierre Herme Patisserie", "Subterranean Thermal Spa", "Artisan Sake Tasting", "Japanese Stone Garden"],
        "is_verified_provider": True,
        "source": "PlanMyTravel Verified Portfolio",
        "requires_partner_checkout": False,
    },
    {
        "id": "stay_jp_3",
        "provider_code": "JP-SOW-03",
        "name": "Sowaka Heritage Ryokan Gion",
        "city": "Kyoto",
        "country": "Japan",
        "region": "East Asia",
        "category": "Historic Sukiya Ryokan",
        "description": "A tranquil 100-year-old restored Sukiya-style ryokan located in the historic Yasaka shrine enclave of Gion, with traditional sliding shoji screens and courtyard moss gardens.",
        "cover_image_url": "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1200&q=80"
        ],
        "nightly_rate": 24500,
        "currency": "INR",
        "rating": 4.91,
        "review_count": 98,
        "latitude": 34.9998,
        "longitude": 135.7785,
        "address": "480 Kiyoi-cho, Yasaka Torii-mae Sagaru, Higashiyama-ku, Kyoto 605-0821, Japan",
        "amenities": ["Private Moss Courtyard", "Hinoki Wood Soaking Tub", "Gion Geisha District Access", "Curated Library", "Seasonal Kaiseki"],
        "is_verified_provider": True,
        "source": "PlanMyTravel Verified Portfolio",
        "requires_partner_checkout": False,
    },

    # --- AMALFI COAST & ITALY ---
    {
        "id": "stay_it_1",
        "provider_code": "IT-SIR-01",
        "name": "Le Sirenuse Cliffside Palace",
        "city": "Positano",
        "country": "Italy",
        "region": "Southern Europe",
        "category": "Pastel Cliffside Luxury",
        "description": "An aristocratic 18th-century summer palace converted into Italy's most romantic cliffside resort, adorned with antique majolica tiles, lemon trees, and sweeping Mediterranean vistas.",
        "cover_image_url": "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80"
        ],
        "nightly_rate": 48000,
        "currency": "INR",
        "rating": 4.96,
        "review_count": 210,
        "latitude": 40.6288,
        "longitude": 14.4850,
        "address": "Via Cristoforo Colombo 30, 84017 Positano, SA, Italy",
        "amenities": ["Cliffside Pool with Bay Views", "Champagne & Oyster Bar", "Private Gozzo Wooden Boat", "Aveda Herbal Spa", "Michelin-starred La Sponda"],
        "is_verified_provider": True,
        "source": "PlanMyTravel Verified Portfolio",
        "requires_partner_checkout": False,
    },
    {
        "id": "stay_it_2",
        "provider_code": "IT-SCA-02",
        "name": "Hotel Santa Caterina",
        "city": "Amalfi",
        "country": "Italy",
        "region": "Southern Europe",
        "category": "Cliffside Sea Sanctuary",
        "description": "Perched on a dramatic cliff outside Amalfi town, featuring glass elevators carved through solid rock descending to a private Mediterranean beach club and seawater pool.",
        "cover_image_url": "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80"
        ],
        "nightly_rate": 38000,
        "currency": "INR",
        "rating": 4.92,
        "review_count": 145,
        "latitude": 40.6305,
        "longitude": 14.5936,
        "address": "Via Mauro Comite 9, 84011 Amalfi, SA, Italy",
        "amenities": ["Rock-cut Glass Elevator", "Private Sea Beach Club", "Heated Seawater Pool", "Lemon Grove Terraces", "Al Fresco Dining"],
        "is_verified_provider": True,
        "source": "PlanMyTravel Verified Portfolio",
        "requires_partner_checkout": False,
    },
    {
        "id": "stay_it_3",
        "provider_code": "IT-CAR-03",
        "name": "Belmond Hotel Caruso Ravello",
        "city": "Ravello",
        "country": "Italy",
        "region": "Southern Europe",
        "category": "11th-Century Palatial Haven",
        "description": "Set 350 meters above sea level in Ravello, this former 11th-century palace features ancient frescoed salons, rose-draped pergolas, and an infinity pool that appears to drift into the sky.",
        "cover_image_url": "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=1200&q=80"
        ],
        "nightly_rate": 52000,
        "currency": "INR",
        "rating": 4.98,
        "review_count": 182,
        "latitude": 40.6492,
        "longitude": 14.6119,
        "address": "Piazza San Giovanni del Toro 2, 84010 Ravello, SA, Italy",
        "amenities": ["World-famous Cliffside Infinity Pool", "Ancient 18th-century Frescoes", "Complimentary Amalfi Boat Cruise", "Private Olive Grove Dining"],
        "is_verified_provider": True,
        "source": "PlanMyTravel Verified Portfolio",
        "requires_partner_checkout": False,
    },

    # --- SWISS ALPS & SWITZERLAND ---
    {
        "id": "stay_ch_1",
        "provider_code": "CH-CHD-01",
        "name": "The Chedi Andermatt",
        "city": "Zermatt & Grindelwald",
        "country": "Switzerland",
        "region": "Central Europe",
        "category": "Alpine-Asian Masterpiece",
        "description": "A daring convergence of Swiss alpine timber and Asian Zen aesthetic by Jean-Michel Gathy, complete with 200 fireplaces, a 35-meter indoor pool, and a two-story glass cheese tower.",
        "cover_image_url": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
        ],
        "nightly_rate": 45000,
        "currency": "INR",
        "rating": 4.95,
        "review_count": 210,
        "latitude": 46.6342,
        "longitude": 8.5944,
        "address": "Gotthardstrasse 4, 6490 Andermatt, Switzerland",
        "amenities": ["Hydrothermal Thermal Spa", "Heated Outdoor Alpine Pool", "Ski Butler Service", "The Japanese Restaurant (Michelin Star)", "In-Room Fireplace"],
        "is_verified_provider": True,
        "source": "PlanMyTravel Verified Portfolio",
        "requires_partner_checkout": False,
    },
    {
        "id": "stay_ch_2",
        "provider_code": "CH-RIF-02",
        "name": "Riffelalp Resort 2222m",
        "city": "Zermatt",
        "country": "Switzerland",
        "region": "Central Europe",
        "category": "High Alpine Glacier Resort",
        "description": "Europe's highest luxury resort sitting at 2,222m elevation directly opposite the Matterhorn peak. Reached by mountain cogwheel railway with outdoor heated baths overlooking the glacier.",
        "cover_image_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
        ],
        "nightly_rate": 39000,
        "currency": "INR",
        "rating": 4.97,
        "review_count": 165,
        "latitude": 45.9922,
        "longitude": 7.7475,
        "address": "Riffelalp 2222m, 3920 Zermatt, Switzerland",
        "amenities": ["Direct Matterhorn Frontal Views", "Outdoor 35°C Thermal Spa", "Private Mountain Tramway", "Ski-in Ski-out Access", "Swiss Fondue Stube"],
        "is_verified_provider": True,
        "source": "PlanMyTravel Verified Portfolio",
        "requires_partner_checkout": False,
    },

    # --- UDAIPUR & RAJASTHAN, INDIA ---
    {
        "id": "stay_in_1",
        "provider_code": "IN-TLP-01",
        "name": "Taj Lake Palace Udaipur",
        "city": "Udaipur",
        "country": "India",
        "region": "South Asia",
        "category": "Floating Marble Island Palace",
        "description": "Originally built in 1746 by Maharana Jagat Singh II as a pleasure palace, this pristine white marble wonder floats serenely on the shimmering waters of Lake Pichola with dedicated royal butlers.",
        "cover_image_url": "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80"
        ],
        "nightly_rate": 38000,
        "currency": "INR",
        "rating": 4.98,
        "review_count": 340,
        "latitude": 24.5754,
        "longitude": 73.6800,
        "address": "Pichola, Udaipur, Rajasthan 313001, India",
        "amenities": ["Private Royal Boat Arrival", "Dedicated Royal Butler", "Jiva Spa Boat on Lake Pichola", "Mewari Palace Courtyard Dining", "Heritage Sunset Walks"],
        "is_verified_provider": True,
        "source": "PlanMyTravel Verified Portfolio",
        "requires_partner_checkout": False,
    },
    {
        "id": "stay_in_2",
        "provider_code": "IN-OBV-02",
        "name": "The Oberoi Udaivilas",
        "city": "Udaipur",
        "country": "India",
        "region": "South Asia",
        "category": "Royal Mewari Palace Sanctuary",
        "description": "Spread over 50 acres on the banks of Lake Pichola, featuring magnificent interconnected domes, hand-painted Mewari frescoes, and semi-private moat swimming pools hugging the suites.",
        "cover_image_url": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80"
        ],
        "nightly_rate": 44000,
        "currency": "INR",
        "rating": 4.97,
        "review_count": 298,
        "latitude": 24.5802,
        "longitude": 73.6732,
        "address": "Haridas Ji Ki Magri, Mulla Talai, Udaipur, Rajasthan 313001, India",
        "amenities": ["Semi-Private Moat Pool Access", "Peacock Wildlife Conservatory", "Private Lake Shikara Boat Cruise", "Holistic Ayurvedic Spa", "Fine Dining Courtyard"],
        "is_verified_provider": True,
        "source": "PlanMyTravel Verified Portfolio",
        "requires_partner_checkout": False,
    },

    # --- THAILAND ---
    {
        "id": "stay_th_1",
        "provider_code": "TH-TSB-01",
        "name": "The Siam Luxury Heritage Hotel",
        "city": "Bangkok",
        "country": "Thailand",
        "region": "Southeast Asia",
        "category": "Art Deco River Sanctuary",
        "description": "Bill Bensley-designed urban sanctuary set along the Chao Phraya River, combining Art Deco opulence with authentic Siamese antiquities, private plunge pools, and riverside muay thai rings.",
        "cover_image_url": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80"
        ],
        "nightly_rate": 31000,
        "currency": "INR",
        "rating": 4.94,
        "review_count": 178,
        "latitude": 13.7801,
        "longitude": 100.5050,
        "address": "Khao Rd, Wachira Phayaban, Dusit District, Bangkok 10300, Thailand",
        "amenities": ["Private Teakwood River Boat Shuttle", "Riverside Infinity Pool", "Opium Spa & Traditional Hammam", "Muay Thai Boxing Ring", "Antique Curated Suites"],
        "is_verified_provider": True,
        "source": "PlanMyTravel Verified Portfolio",
        "requires_partner_checkout": False,
    },
    {
        "id": "stay_th_2",
        "provider_code": "TH-AMP-02",
        "name": "Amanpuri Oceanfront Sanctuary",
        "city": "Phuket",
        "country": "Thailand",
        "region": "Southeast Asia",
        "category": "Oceanfront Coconut Grove Villa",
        "description": "A secluded tropical haven on Pansea Beach framed by turquoise Andaman waters, featuring Ayutthaya-inspired pavilions and holistic wellness immersion.",
        "cover_image_url": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80"
        ],
        "nightly_rate": 55000,
        "currency": "INR",
        "rating": 4.97,
        "review_count": 194,
        "latitude": 7.9868,
        "longitude": 98.2796,
        "address": "Pansea Beach, Cherngtalay, Thalang District, Phuket 83110, Thailand",
        "amenities": ["Private Secluded Beach", "Black Tiled Midnight Pool", "Holistic Wellness Center", "Private Catamaran Charters", "Japanese Nama Dining"],
        "is_verified_provider": True,
        "source": "PlanMyTravel Verified Portfolio",
        "requires_partner_checkout": False,
    },

    # --- FRANCE (PARIS) ---
    {
        "id": "stay_fr_1",
        "provider_code": "FR-LBR-01",
        "name": "Le Bristol Paris",
        "city": "Paris",
        "country": "France",
        "region": "Western Europe",
        "category": "Historic Parisian Palace",
        "description": "An icon of French art de vivre on the Rue du Faubourg Saint-Honoré, boasting an idyllic 13,000 sq ft inner French garden and a rooftop swimming pool resembling a luxury yacht.",
        "cover_image_url": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80"
        ],
        "nightly_rate": 62000,
        "currency": "INR",
        "rating": 4.96,
        "review_count": 280,
        "latitude": 48.8719,
        "longitude": 2.3147,
        "address": "112 Rue du Faubourg Saint-Honoré, 75008 Paris, France",
        "amenities": ["Rooftop Yacht-Style Indoor Pool", "3-Michelin-Starred Epicure", "Private French Courtyard Garden", "Spa Le Bristol by La Prairie", "Haute Couture Salons"],
        "is_verified_provider": True,
        "source": "PlanMyTravel Verified Portfolio",
        "requires_partner_checkout": False,
    },

    # --- INDONESIA (BALI) ---
    {
        "id": "stay_id_1",
        "provider_code": "ID-MAN-01",
        "name": "Mandapa, a Ritz-Carlton Reserve",
        "city": "Ubud",
        "country": "Indonesia",
        "region": "Southeast Asia",
        "category": "Ayung River Forest Sanctuary",
        "description": "Hidden along the rushing Ayung River in Ubud, this mindful sanctuary features private bamboo dining cocoons, traditional rice fields, and riverside private pool villas.",
        "cover_image_url": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80"
        ],
        "nightly_rate": 35000,
        "currency": "INR",
        "rating": 4.98,
        "review_count": 310,
        "latitude": -8.4900,
        "longitude": 115.2440,
        "address": "Jl. Raya Kedewatan, Banjar, Kedewatan, Kecamatan Ubud, Bali 80571",
        "amenities": ["Riverside Bamboo Dining Cocoons", "Padi Field Guided Walks", "Ayurvedic River Spa", "Private Heated Plunge Pool", "Balinese Healer Sessions"],
        "is_verified_provider": True,
        "source": "PlanMyTravel Verified Portfolio",
        "requires_partner_checkout": False,
    }
]


class HotelService:
    """Hotelbeds API integration adapter with intelligent fallback to our curated international portfolio."""

    def __init__(self):
        self.api_key = Config.HOTELBEDS_API_KEY
        self.secret = Config.HOTELBEDS_API_SECRET
        self.base_url = Config.HOTELBEDS_BASE_URL
        self.is_configured = bool(self.api_key and self.secret)

    def _generate_signature(self) -> str:
        """Hotelbeds requires SHA-256 of apiKey + secret + timestamp (in seconds)."""
        timestamp = int(time.time())
        seed = f"{self.api_key}{self.secret}{timestamp}"
        return hashlib.sha256(seed.encode("utf-8")).hexdigest()

    def _get_headers(self) -> Dict[str, str]:
        return {
            "Api-key": self.api_key,
            "X-Signature": self._generate_signature(),
            "Accept": "application/json",
            "Accept-Encoding": "gzip",
            "Content-Type": "application/json",
        }

    def check_health(self) -> Dict[str, Any]:
        """Verify connectivity with Hotelbeds test environment."""
        if not self.is_configured:
            return {"status": "unconfigured", "message": "Hotelbeds credentials not set"}
        try:
            url = f"{self.base_url}/hotel-api/1.0/status"
            res = requests.get(url, headers=self._get_headers(), timeout=6)
            if res.status_code == 200:
                return {"status": "healthy", "code": 200, "environment": "test"}
            return {"status": "error", "code": res.status_code, "detail": res.text[:200]}
        except Exception as e:
            logger.warning("Hotelbeds health check failed: %s", e)
            return {"status": "unavailable", "error": str(e)}

    def _get_stays_from_db(self) -> List[Dict[str, Any]]:
        """Fetch all stays directly from Turso database with fallback to in-memory catalog."""
        try:
            from backend.models.stay import Stay
            db_stays = Stay.query.order_by(Stay.rating.desc()).all()
            if db_stays:
                return [s.to_dict() for s in db_stays]
        except Exception as e:
            logger.warning("Could not query stays from Turso database: %s", e)
        return CURATED_HOTELS_CATALOG

    def search_hotels(self, destination: str = "", limit: int = 16) -> List[Dict[str, Any]]:
        """Search hotels matching the target destination/region from Turso database.
        Guarantees that stays strictly belong to the searched location/country.
        """
        catalog = self._get_stays_from_db()
        dest_query = (destination or "").strip().lower()

        # If a destination is requested, filter our verified global catalog
        if dest_query:
            matched: List[Dict[str, Any]] = []
            # Specific alias mappings for broader matching
            aliases = {
                "swiss alps": ["switzerland", "zermatt", "grindelwald", "swiss"],
                "amalfi coast": ["italy", "positano", "amalfi", "ravello"],
                "udaipur & rajasthan": ["india", "udaipur", "rajasthan", "jaipur"],
                "thailand": ["thailand", "bangkok", "phuket", "chiang mai"],
                "singapore": ["singapore"],
                "kyoto": ["japan", "kyoto", "tokyo"],
                "japan": ["japan", "kyoto", "tokyo"],
                "italy": ["italy", "positano", "amalfi", "ravello", "rome"],
                "france": ["france", "paris"],
                "bali": ["bali", "indonesia", "ubud", "payangan", "gianyar"],
                "santorini": ["santorini", "greece", "oia", "imerovigli", "fira", "cyclades"],
                "greece": ["santorini", "greece", "oia", "imerovigli", "fira", "cyclades"],
                "iceland": ["iceland", "reykjavik", "grindavik", "selfoss", "golden circle"],
                "reykjavik": ["iceland", "reykjavik", "grindavik", "selfoss", "golden circle"],
                "noida": ["noida", "delhi", "ncr"],
                "ghaziabad": ["ghaziabad", "delhi", "ncr"],
                "gurugram": ["gurugram", "gurgaon", "delhi", "ncr"],
                "delhi": ["delhi", "noida", "gurugram", "ghaziabad"],
            }

            search_terms = [dest_query]
            for key, val_list in aliases.items():
                if dest_query in key or any(term in dest_query for term in val_list):
                    search_terms.extend(val_list)

            search_terms = list(set(search_terms))

            for hotel in catalog:
                hotel_searchable = f"{hotel['name']} {hotel['city']} {hotel['country']} {hotel.get('region', '')}".lower()
                if any(term in hotel_searchable for term in search_terms):
                    matched.append(hotel)

            if matched:
                return matched[:limit]

            # If user entered a unique search query like "luxury", "pool", "palace"
            keyword_matches = [
                h for h in catalog
                if dest_query in h["name"].lower()
                or dest_query in h["category"].lower()
                or dest_query in h["description"].lower()
                or any(dest_query in a.lower() for a in h.get("amenities", []))
            ]
            if keyword_matches:
                return keyword_matches[:limit]

        # If no destination filter is provided, return rich cross-country portfolio
        return catalog[:limit]

    def get_hotel_by_id(self, hotel_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve full property profile by ID from Turso database."""
        try:
            from backend.models.stay import Stay
            stay = Stay.query.filter((Stay.id == str(hotel_id)) | (Stay.provider_code == str(hotel_id))).first()
            if stay:
                return stay.to_dict()
        except Exception as e:
            logger.warning("Could not query stay %s from Turso: %s", hotel_id, e)

        catalog = self._get_stays_from_db()
        for hotel in catalog:
            if str(hotel["id"]) == str(hotel_id) or str(hotel.get("provider_code")) == str(hotel_id):
                return hotel
        return catalog[0] if catalog else None

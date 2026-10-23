"""Seed enrichment script for PlanMyTravel:
1. Adds 3 new mock itineraries/destinations (Santorini, Bali, Iceland)
2. Adds regional boutique stays for each destination
3. Adds certified local guides for each destination
4. Populates rich, authentic-looking fake reviews for all stays
"""
import json
import random
from datetime import datetime, timezone, timedelta
from backend.app import create_app
from backend.database import db
from backend.models.destination import Destination, DestinationImage
from backend.models.stay import Stay
from backend.models.guide import Guide
from backend.models.booking import Review
from backend.models.user import User

NEW_DESTINATIONS = [
    {
        "name": "Santorini & Cyclades, Greece",
        "slug": "santorini-greece",
        "country": "Greece",
        "city": "Santorini",
        "region": "Mediterranean",
        "tagline": "Whitewashed cliffside sanctuaries overlooking azure Aegean calderas.",
        "category": "Coastal Sanctuaries",
        "short_description": "Sun-drenched cycladic architecture, dramatic volcanic cliffs, and legendary golden hour vistas in Oia.",
        "description": "Rising dramatically from the cobalt Aegean Sea, Santorini is the quintessential Mediterranean paradise. Experience cave suites carved into volcanic rock, private catamaran sails across the flooded caldera, ancient Minoan excavations at Akrotiri, and sunset dinners paired with crisp volcanic Assyrtiko wines.",
        "hero_image_url": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1600&q=80",
        "rating": 4.96,
        "is_featured": 1,
        "is_published": 1,
        "best_season": "May to October (Endless Aegean sunshine)",
        "cost_currency": "INR",
        "estimated_cost_min": 85000,
        "estimated_cost_max": 240000,
        "ideal_stay": "4-6 days",
        "weather_info": "Warm Mediterranean climate (24-30°C) with gentle Aegean sea breezes.",
        "travel_styles": ["Coastal & Beach", "Romantic", "Culinary & Wine", "Architecture"],
        "attractions": [
            {"name": "Oia Sunset Promenade & Blue Domes", "category": "Scenic Viewpoint", "rating": 4.98},
            {"name": "Akrotiri Prehistoric Bronze Age Ruins", "category": "Archaeological Site", "rating": 4.88},
            {"name": "Red Beach & Volcanic Caldera Sail", "category": "Catamaran Experience", "rating": 4.92},
            {"name": "Santo Wines Vineyard Cliffside Tasting", "category": "Wine & Culinary", "rating": 4.91}
        ],
        "activities": [
            "Private sunset catamaran sail across the volcanic hot springs",
            "Morning hike along the cliffside path from Fira to Oia",
            "Wine tasting of volcanic Assyrtiko at a cliffside estate",
            "Traditional Greek seafood dinner by candle-lit Ammoudi Bay"
        ],
        "images": [
            "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    {
        "name": "Bali & Nusa Islands, Indonesia",
        "slug": "bali-indonesia",
        "country": "Indonesia",
        "city": "Bali",
        "region": "Southeast Asia",
        "tagline": "Sacred water temples, emerald jungle valleys, and raw coastal cliffs.",
        "category": "Nature Retreats",
        "short_description": "Immerse in the spiritual calm of Ubud's terraced rice fields and the wild oceanic cliffs of Nusa Penida.",
        "description": "Bali is a living tapestry of spirituality, artistic heritage, and lush tropical landscapes. From the mist-shrouded rainforest valleys of Ubud to the spiritual morning blessing at Tirta Empul, and the breathtaking turquoise surf breaking against Nusa Penida's T-Rex cliff, Bali offers total rejuvenation.",
        "hero_image_url": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=80",
        "rating": 4.94,
        "is_featured": 1,
        "is_published": 1,
        "best_season": "April to October (Dry, sunny tropical season)",
        "cost_currency": "INR",
        "estimated_cost_min": 45000,
        "estimated_cost_max": 160000,
        "ideal_stay": "5-7 days",
        "weather_info": "Tropical warmth (27-31°C) with cool highland breezes in Ubud and Bedugul.",
        "travel_styles": ["Nature & Wildlife", "Relaxation & Wellness", "Cultural & Heritage", "Adventure"],
        "attractions": [
            {"name": "Tegallalang Sacred Rice Terraces", "category": "Natural UNESCO Landscape", "rating": 4.93},
            {"name": "Sacred Monkey Forest Sanctuary", "category": "Rainforest Wildlife", "rating": 4.86},
            {"name": "Tanah Lot Sunset Sea Temple", "category": "Spiritual Shrine", "rating": 4.89},
            {"name": "Kelingking Beach Cliff (Nusa Penida)", "category": "Coastal Marvel", "rating": 4.95}
        ],
        "activities": [
            "Sunrise yoga and Balinese herbal spa therapy in Ubud valley",
            "Speedboat excursion to Nusa Penida and manta ray snorkeling",
            "Traditional offering making and blessing at Tirta Empul",
            "Farm-to-table organic dining amidst lush jungle canopy"
        ],
        "images": [
            "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=1200&q=80"
        ]
    },
    {
        "name": "Reykjavik & Golden Circle, Iceland",
        "slug": "reykjavik-iceland",
        "country": "Iceland",
        "city": "Reykjavik",
        "region": "Nordic Europe",
        "tagline": "Thunderous glacial waterfalls, spouting geysers, and ethereal northern skies.",
        "category": "Affordable Adventures",
        "short_description": "Witness the raw tectonic forces of earth, soak in milky geothermal lagoons, and hunt the Northern Lights.",
        "description": "Iceland is nature in its purest, most primal expression. Travel across the famous Golden Circle to marvel at Gullfoss waterfall crashing into volcanic canyon walls, watch Strokkur shoot boiling water skyward, walk between North American and Eurasian tectonic plates at Thingvellir, and soak in silica-rich waters under the midnight sun or aurora borealis.",
        "hero_image_url": "https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1600&q=80",
        "rating": 4.97,
        "is_featured": 1,
        "is_published": 1,
        "best_season": "Sep to Apr for Aurora; Jun to Aug for Midnight Sun",
        "cost_currency": "INR",
        "estimated_cost_min": 95000,
        "estimated_cost_max": 260000,
        "ideal_stay": "4-5 days",
        "weather_info": "Subpolar oceanic climate (2-14°C) with brisk Arctic air and dramatic skies.",
        "travel_styles": ["Adventure", "Nature & Wildlife", "Relaxation & Wellness", "Photography"],
        "attractions": [
            {"name": "Gullfoss Double-Cascading Waterfall", "category": "Glacial Waterfall", "rating": 4.97},
            {"name": "Strokkur Geysir Geothermal Field", "category": "Geothermal Phenomenon", "rating": 4.91},
            {"name": "Thingvellir National Park Rift Valley", "category": "UNESCO Tectonic Site", "rating": 4.94},
            {"name": "The Blue Lagoon Geothermal Spa", "category": "Mineral Thermal Baths", "rating": 4.92}
        ],
        "activities": [
            "Private evening expedition to observe the Aurora Borealis",
            "Soaking in the mineral-rich geothermal waters of the Blue Lagoon",
            "Snowmobile excursion atop Langjökull Glacier ice cap",
            "Nordic artisanal dining in Reykjavik's Old Harbour district"
        ],
        "images": [
            "https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1529963183134-61a90db47eaf?auto=format&fit=crop&w=1200&q=80"
        ]
    }
]

NEW_STAYS = [
    # Santorini
    {
        "id": "stay_gr_1",
        "provider_code": "GR-CAN-01",
        "name": "Canaves Oia Suites & Spa",
        "city": "Santorini",
        "country": "Greece",
        "region": "Mediterranean",
        "category": "Cliffside Caldera Cave Suite",
        "description": "Carved into the dramatic volcanic cliffs of Oia with private plunge pools, gleaming whitewashed architecture, and front-row seats to the world's most acclaimed sunsets.",
        "cover_image_url": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80"
        ],
        "nightly_rate": 36500.0,
        "currency": "INR",
        "rating": 4.98,
        "review_count": 182,
        "latitude": 36.4618,
        "longitude": 25.3753,
        "address": "Main Street, Oia 847 02, Santorini, Greece",
        "amenities": ["Caldera Edge Plunge Pool", "Champagne Breakfast on Terrace", "Private Catamaran Charter", "Holistic Cave Spa", "Complimentary High-Speed Wi-Fi", "Sunset Cocktail Lounge"],
    },
    {
        "id": "stay_gr_2",
        "provider_code": "GR-GRA-02",
        "name": "Grace Hotel, Auberge Resorts Collection",
        "city": "Santorini",
        "country": "Greece",
        "region": "Mediterranean",
        "category": "Architectural Boutique Sanctuary",
        "description": "Perched 300 meters above the caldera in Imerovigli with iconic infinity pool looking straight out at Skaros Rock and the volcano.",
        "cover_image_url": "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80"
        ],
        "nightly_rate": 42000.0,
        "currency": "INR",
        "rating": 4.96,
        "review_count": 145,
        "latitude": 36.4342,
        "longitude": 25.4216,
        "address": "Imerovigli 847 00, Santorini, Greece",
        "amenities": ["Infinity Edge Cliff Pool", "Santorini Volcanic Wine Cellar", "Michelin-starred Mediterranean Chef", "Helipad Access", "Luxury Airport Shuttles"],
    },
    # Bali
    {
        "id": "stay_id_1",
        "provider_code": "ID-VIC-01",
        "name": "Viceroy Bali Valley of the Kings",
        "city": "Bali",
        "country": "Indonesia",
        "region": "Southeast Asia",
        "category": "Private Pool Rainforest Villa",
        "description": "Nestled on a tranquil ridge overlooking the sacred Petanu River valley, offering secluded private infinity pool villas and world-class fine dining at CasCades.",
        "cover_image_url": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80"
        ],
        "nightly_rate": 28000.0,
        "currency": "INR",
        "rating": 4.97,
        "review_count": 210,
        "latitude": -8.5069,
        "longitude": 115.2625,
        "address": "Jl. Lanyahan, Br. Nagi, Ubud, Bali 80571, Indonesia",
        "amenities": ["Heated Private Plunge Pool", "Lembah Rainforest Spa", "Private Helicopter Pad", "Complimentary Ubud Chauffeur", "Sunset Cocktail Pavilion"],
    },
    {
        "id": "stay_id_2",
        "provider_code": "ID-HNG-02",
        "name": "Hanging Gardens of Bali",
        "city": "Bali",
        "country": "Indonesia",
        "region": "Southeast Asia",
        "category": "Tiered Jungle Infinity Resort",
        "description": "Surrounded by ancient trees and mist-shrouded valleys in Payangan, famous for its world-renowned dual-tiered cascading infinity pool suspended over the Ayung River.",
        "cover_image_url": "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80"
        ],
        "nightly_rate": 31500.0,
        "currency": "INR",
        "rating": 4.95,
        "review_count": 178,
        "latitude": -8.4116,
        "longitude": 115.2443,
        "address": "Buahan, Payangan, Gianyar, Bali 80571, Indonesia",
        "amenities": ["Dual-Tier Suspended Infinity Pool", "Riverside Yoga Shala", "Traditional Balinese Healing Spa", "Canopy Gourmet Dining", "Funicular Mountain Transit"],
    },
    # Iceland
    {
        "id": "stay_is_1",
        "provider_code": "IS-RET-01",
        "name": "The Retreat at Blue Lagoon Iceland",
        "city": "Reykjavik",
        "country": "Iceland",
        "region": "Nordic Europe",
        "category": "Subterranean Geothermal Sanctuary",
        "description": "Encircled by 800-year-old lava flows and direct private lagoon access filled with mineral-rich geothermal seawater and floor-to-ceiling volcanic views.",
        "cover_image_url": "https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80"
        ],
        "nightly_rate": 48000.0,
        "currency": "INR",
        "rating": 4.99,
        "review_count": 164,
        "latitude": 63.8804,
        "longitude": -22.4495,
        "address": "Nordurljosavegur 11, 240 Grindavik, Iceland",
        "amenities": ["Private Geothermal Lagoon Access", "Subterranean Lava Spa", "Moss Restaurant Michelin Culinary", "Northern Lights Wake-Up Service", "Floor-to-Ceiling Lava Views"],
    },
    {
        "id": "stay_is_2",
        "provider_code": "IS-ION-02",
        "name": "ION Adventure Hotel Golden Circle",
        "city": "Reykjavik",
        "country": "Iceland",
        "region": "Nordic Europe",
        "category": "Design Hotel on Tectonic Slopes",
        "description": "Less than an hour from Reykjavik, perched on Mount Hengill with floor-to-ceiling glass Northern Lights Bar, outdoor warm thermal pool, and Golden Circle trail access.",
        "cover_image_url": "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80",
        "images": [
            "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80"
        ],
        "nightly_rate": 27500.0,
        "currency": "INR",
        "rating": 4.92,
        "review_count": 139,
        "latitude": 64.1206,
        "longitude": -21.2464,
        "address": "Nesjavellir vid Thingvallavatn, 801 Selfoss, Iceland",
        "amenities": ["Panoramic Northern Lights Bar", "10-Meter Warm Outdoor Pool", "Silfra Drysuit Snorkeling Desk", "Lava Spa Sauna", "Nordic Organic Farm Dining"],
    }
]

NEW_GUIDES = [
    {
        "display_name": "Eleni Vassiliou",
        "destination": "Santorini & Cyclades, Greece",
        "bio": "Cycladic historian and certified island guide. Born in Oia, Eleni leads travelers along secret volcanic caldera trails, private cliffside wine tastings, and hidden sea caves.",
        "languages": ["Greek", "English", "French"],
        "specialties": ["Minoan Akrotiri History", "Caldera Catamaran Sailing", "Assyrtiko Wine Terroir"],
        "daily_rate": 7200.0,
        "rating": 4.98,
        "review_count": 142,
        "photo_url": "/images/guides/guide_3.jpg",
        "approval_status": "approved",
        "is_verified": 1,
        "contact_email": "eleni.santorini@planmytravel.com",
        "contact_phone": "+30 22860 12345"
    },
    {
        "display_name": "Wayan Sudarsana",
        "destination": "Bali & Nusa Islands, Indonesia",
        "bio": "Certified cultural custodian and trekking leader from Ubud. Expert in Balinese water temple rituals, jungle ridge walks, and private island expeditions to Nusa Penida.",
        "languages": ["Indonesian", "English", "Balinese"],
        "specialties": ["Ubud Temple Architecture", "Tegallalang Terraces Trek", "Nusa Penida Boat Tours"],
        "daily_rate": 3800.0,
        "rating": 4.96,
        "review_count": 195,
        "photo_url": "/images/guides/guide_6.jpg",
        "approval_status": "approved",
        "is_verified": 1,
        "contact_email": "wayan.bali@planmytravel.com",
        "contact_phone": "+62 812 3456 7890"
    },
    {
        "display_name": "Astrid Sigurdardottir",
        "destination": "Reykjavik & Golden Circle, Iceland",
        "bio": "Glaciologist and licensed Arctic guide. Astrid leads thrilling excursions into ice caves, Golden Circle tectonic fissures, and unpolluted wilderness spots for Northern Lights viewing.",
        "languages": ["Icelandic", "English", "Danish"],
        "specialties": ["Northern Lights Photography", "Glacier Safety & Crampons", "Golden Circle Geothermal Geology"],
        "daily_rate": 8400.0,
        "rating": 4.99,
        "review_count": 178,
        "photo_url": "/images/guides/guide_7.jpg",
        "approval_status": "approved",
        "is_verified": 1,
        "contact_email": "astrid.iceland@planmytravel.com",
        "contact_phone": "+354 555 1234"
    }
]

REALISTIC_REVIEWS = [
    ("Exquisite hospitality & serene caldera views", "The property exceeded all our expectations. Waking up to panoramic caldera views and having breakfast delivered to our private terrace was unforgettable. Remarkably attentive staff and flawless luxury.", 5, "Elena Rostova"),
    ("Unmatched tranquility in the heart of nature", "The suite was spacious, quiet, and elegantly furnished with authentic local touches. Loved the artisanal morning spread and seamless concierge assistance.", 5, "Marcus Tan"),
    ("A standout boutique luxury experience", "Every detail was thoughtfully arranged from check-in to checkout. The heated plunge pool and sunset vistas were breathtaking. One of the finest stays we have ever experienced.", 5, "Sophia Montgomery"),
    ("Spotless comfort, delicious dining & stellar staff", "Impeccable cleanliness and world-class service throughout our four-night stay. The spa treatments and curated dinner reservations arranged by the concierge were 10/10.", 5, "Rajesh Khurana"),
    ("Pure bliss — couldn't have asked for a better getaway", "Stunning architecture that blends seamlessly with the surrounding landscape. The infinity pool overlooking the horizon was a dream. Highly recommend for couples or solo retreats.", 5, "Clara Dupont"),
    ("Magical location and top-tier amenities", "From the welcome champagne to the plush bedding and rainfall shower, this place is perfection. Truly sets the gold standard for boutique luxury travel.", 5, "Liam O'Connor")
]

def run():
    app = create_app()
    with app.app_context():
        # 1. Seed Destinations
        print("Checking destinations...")
        for d in NEW_DESTINATIONS:
            existing = Destination.query.filter_by(slug=d["slug"]).first()
            if not existing:
                dest = Destination(
                    name=d["name"],
                    slug=d["slug"],
                    country=d["country"],
                    city=d["city"],
                    region=d["region"],
                    tagline=d["tagline"],
                    category=d["category"],
                    short_description=d["short_description"],
                    description=d["description"],
                    hero_image_url=d["hero_image_url"],
                    image_url=d["hero_image_url"],
                    rating=d["rating"],
                    is_featured=d["is_featured"],
                    is_published=d["is_published"],
                    best_season=d["best_season"],
                    cost_currency=d["cost_currency"],
                    estimated_cost_min=d["estimated_cost_min"],
                    estimated_cost_max=d["estimated_cost_max"],
                    ideal_stay=d["ideal_stay"],
                    weather_info=d["weather_info"],
                )
                dest.travel_styles = d["travel_styles"]
                dest.attractions = d["attractions"]
                dest.activities = d["activities"]
                db.session.add(dest)
                db.session.flush()

                for idx, img_url in enumerate(d.get("images", [])):
                    img = DestinationImage(
                        destination_id=dest.id,
                        image_url=img_url,
                        alt_text=f"{dest.name} scenic landscape",
                        sort_order=idx,
                    )
                    db.session.add(img)
                print(f"Added destination: {d['name']}")
            else:
                print(f"Destination already exists: {d['name']}")

        # 2. Seed Stays
        print("Checking stays...")
        for s in NEW_STAYS:
            existing_stay = Stay.query.filter_by(id=s["id"]).first()
            if not existing_stay:
                stay = Stay(
                    id=s["id"],
                    provider_code=s["provider_code"],
                    name=s["name"],
                    city=s["city"],
                    country=s["country"],
                    region=s["region"],
                    category=s["category"],
                    description=s["description"],
                    cover_image_url=s["cover_image_url"],
                    nightly_rate=s["nightly_rate"],
                    currency=s["currency"],
                    rating=s["rating"],
                    review_count=s["review_count"],
                    latitude=s["latitude"],
                    longitude=s["longitude"],
                    address=s["address"],
                    is_verified_provider=1,
                    source="PlanMyTravel Verified Portfolio",
                    requires_partner_checkout=0
                )
                stay.images = s["images"]
                stay.amenities = s["amenities"]
                db.session.add(stay)
                print(f"Added stay: {s['name']}")
            else:
                print(f"Stay already exists: {s['name']}")

        # 3. Seed Guides
        print("Checking guides...")
        for g in NEW_GUIDES:
            existing_guide = Guide.query.filter_by(display_name=g["display_name"]).first()
            if not existing_guide:
                guide = Guide(
                    display_name=g["display_name"],
                    destination=g["destination"],
                    bio=g["bio"],
                    daily_rate=g["daily_rate"],
                    rating=g["rating"],
                    review_count=g["review_count"],
                    photo_url=g["photo_url"],
                    approval_status=g["approval_status"],
                    is_verified=g["is_verified"],
                    contact_email=g["contact_email"],
                    contact_phone=g["contact_phone"]
                )
                guide.languages = g["languages"]
                guide.specialties = g["specialties"]
                db.session.add(guide)
                print(f"Added guide: {g['display_name']}")
            else:
                print(f"Guide already exists: {g['display_name']}")

        db.session.commit()

        # 4. Populate Realistic Fake Reviews for ALL stays
        print("Enriching reviews for all stays...")
        all_stays = Stay.query.all()
        admin_user = User.query.first()
        admin_uid = admin_user.id if admin_user else 1

        total_added_reviews = 0
        now = datetime.now(timezone.utc)

        for stay in all_stays:
            current_reviews_count = Review.query.filter_by(stay_id=stay.id).count()
            if current_reviews_count < 3:
                # Add 3 authentic fake reviews for this stay
                for i in range(3):
                    rev_template = REALISTIC_REVIEWS[(i + len(stay.id)) % len(REALISTIC_REVIEWS)]
                    review_date = now - timedelta(days=random.randint(4, 90), hours=random.randint(1, 23))
                    rev = Review(
                        user_id=admin_uid,
                        stay_id=stay.id,
                        rating=rev_template[2],
                        title=rev_template[0],
                        body=f"{rev_template[1]} Highly recommend staying at {stay.name} when exploring {stay.city}!",
                        status="published",
                        is_verified=1,
                        created_at=review_date.isoformat()
                    )
                    db.session.add(rev)
                    total_added_reviews += 1

        db.session.commit()
        print(f"Successfully added {total_added_reviews} verified fake reviews across stays.")
        print("Database enrichment complete!")

if __name__ == "__main__":
    run()

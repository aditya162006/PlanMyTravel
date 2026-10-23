import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Sparkles, MapPin, Calendar, Users, ArrowRight, ShieldCheck, Bed, Compass, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { Destination, Stay } from '../types';
import { api } from '../api/client';
import { DestinationCard } from '../components/DestinationCard';
import { StayCard } from '../components/StayCard';
import { AIChatbot } from '../components/AIChatbot';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [featuredStays, setFeaturedStays] = useState<Stay[]>([]);
  const [loading, setLoading] = useState(true);

  // Search Bar State
  const [searchDest, setSearchDest] = useState('');
  const [travelers, setTravelers] = useState(2);
  const [durationDays, setDurationDays] = useState(4);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Places' },
    { id: 'weekend', label: 'Weekend Escapes' },
    { id: 'nature', label: 'Nature Retreats' },
    { id: 'coastal', label: 'Coastal Sanctuaries' },
    { id: 'cultural', label: 'Cultural Gems' },
    { id: 'adventure', label: 'Affordable Adventures' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [destRes, stayRes] = await Promise.all([
          api.getDestinations(),
          api.getStays({ limit: 4 })
        ]);
        if (destRes?.destinations) setDestinations(destRes.destinations);
        if (stayRes?.stays) setFeaturedStays(stayRes.stays.slice(0, 4));
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchDest.trim()) {
      navigate(`/concierge?destination=${encodeURIComponent(searchDest.trim())}&travelers=${travelers}&days=${durationDays}`);
    } else {
      navigate(`/explore`);
    }
  };

  const filteredDestinations = activeCategory === 'all'
    ? destinations
    : destinations.filter(d => (d.category || '').toLowerCase().includes(activeCategory));

  return (
    <div className="space-y-24 pb-16">

      {/* 1. Hero Section */}
      <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center rounded-b-[40px] overflow-hidden bg-forest-900 mx-2 sm:mx-6 mt-3 shadow-soft-lg">
        {/* Background Image with Dark Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80"
            alt="Travel inspiration"
            className="w-full h-full object-cover object-center opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-900/60 to-forest-950/80"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center py-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-ivory-100 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5 text-sage-300" />
            <span>AI-Powered Concierge & Discovery</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-ivory-50 tracking-tight leading-[1.1]">
            Your next adventure, <br />
            <span className="italic font-light text-sage-200">thoughtfully planned.</span>
          </h1>

          <p className="mt-5 text-sm sm:text-base text-ivory-200/90 max-w-xl mx-auto font-light leading-relaxed">
            Discover extraordinary places and let AI turn your travel ideas into a personalized, bookable itinerary with transparent budgets.
          </p>

          {/* Refined Rounded Search Bar Pill */}
          <div className="mt-10 max-w-3xl mx-auto">
            <form
              onSubmit={handleHeroSearch}
              className="bg-white p-2.5 sm:p-3 rounded-full shadow-float border border-charcoal-100 flex flex-col sm:flex-row items-center gap-2 sm:gap-4"
            >
              {/* Destination Input */}
              <div className="flex-1 flex items-center gap-3 px-4 py-2 w-full sm:w-auto">
                <MapPin className="w-4 h-4 text-forest-800 shrink-0" />
                <div className="text-left w-full">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-400">Where to?</label>
                  <input
                    type="text"
                    value={searchDest}
                    onChange={(e) => setSearchDest(e.target.value)}
                    placeholder="Search places (e.g. Kyoto, Singapore...)"
                    className="w-full text-xs sm:text-sm font-medium text-charcoal-900 bg-transparent outline-none placeholder:text-charcoal-300"
                  />
                </div>
              </div>

              <div className="hidden sm:block w-px h-8 bg-charcoal-200"></div>

              {/* Duration Days */}
              <div className="flex items-center gap-3 px-4 py-2 w-full sm:w-auto">
                <Calendar className="w-4 h-4 text-forest-800 shrink-0" />
                <div className="text-left">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-400">Duration</label>
                  <select
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="text-xs sm:text-sm font-medium text-charcoal-900 bg-transparent outline-none cursor-pointer"
                  >
                    <option value={2}>2 Days</option>
                    <option value={3}>3 Days</option>
                    <option value={4}>4 Days</option>
                    <option value={5}>5 Days</option>
                    <option value={7}>7 Days</option>
                    <option value={10}>10 Days</option>
                  </select>
                </div>
              </div>

              <div className="hidden sm:block w-px h-8 bg-charcoal-200"></div>

              {/* Travelers */}
              <div className="flex items-center gap-3 px-4 py-2 w-full sm:w-auto">
                <Users className="w-4 h-4 text-forest-800 shrink-0" />
                <div className="text-left">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-charcoal-400">Who</label>
                  <select
                    value={travelers}
                    onChange={(e) => setTravelers(Number(e.target.value))}
                    className="text-xs sm:text-sm font-medium text-charcoal-900 bg-transparent outline-none cursor-pointer"
                  >
                    <option value={1}>1 Traveler</option>
                    <option value={2}>2 Travelers</option>
                    <option value={3}>3 Travelers</option>
                    <option value={4}>4 Travelers</option>
                    <option value={6}>6+ Travelers</option>
                  </select>
                </div>
              </div>

              {/* CTA Action */}
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-forest-800 hover:bg-forest-900 text-ivory-50 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 shadow-soft hover:shadow-soft-lg transition-all"
              >
                <Sparkles className="w-4 h-4 text-sage-300" />
                <span>Plan Trip</span>
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* 2. Curated Destinations Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header with Category Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-forest-800 mb-1 block">Curated Escapes</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-charcoal-900">
              Extraordinary Destinations
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-500 mt-1 max-w-lg">
              Handpicked regions celebrated for natural beauty, authentic architecture, and rich local character.
            </p>
          </div>

          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-800 hover:text-forest-800 group"
          >
            <span>Browse all destinations</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-charcoal-900 text-ivory-50 shadow-soft-sm'
                  : 'bg-white text-charcoal-600 hover:text-charcoal-900 border border-charcoal-100 hover:border-charcoal-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Destination Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-[4/3] rounded-3xl bg-ivory-200 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDestinations.slice(0, 6).map((dest) => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        )}
      </section>

      {/* 3. AI Concierge Spotlight Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-ivory-100 border border-charcoal-100/90 p-8 sm:p-14 overflow-hidden shadow-soft flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-800 text-ivory-100 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-sage-300" />
              <span>Intelligent Concierge</span>
            </div>

            <h3 className="font-serif text-3xl sm:text-4xl font-normal text-charcoal-900 leading-tight">
              From a vague travel daydream <br />
              <span className="italic font-light text-forest-800">to a confirmed schedule in seconds.</span>
            </h3>

            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed font-light">
              Unlike generic chatbots, our travel concierge synthesizes real airline routes, boutique stay availability from Hotelbeds, transit transfers, and geographically optimal morning-to-night activities with a transparent budget breakdown.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/concierge"
                className="px-6 py-3.5 rounded-full bg-forest-800 hover:bg-forest-900 text-ivory-50 text-xs sm:text-sm font-medium flex items-center gap-2 shadow-soft hover:shadow-soft-lg transition-all"
              >
                <span>Launch Trip Planner</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/wallet"
                className="px-6 py-3.5 rounded-full bg-white hover:bg-ivory-50 text-charcoal-800 border border-charcoal-200 text-xs sm:text-sm font-medium transition-colors"
              >
                Explore Trip Wallet
              </Link>
            </div>
          </div>

          {/* Concierge Visual Mockup Preview */}
          <div className="w-full lg:w-auto flex-1 max-w-md bg-white rounded-2xl shadow-float border border-charcoal-100 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-charcoal-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sage-500 animate-ping"></span>
                <span className="font-semibold text-charcoal-800">AI Concierge Engine</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-sage-50 text-forest-800 text-[10px] font-bold">Verified</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-ivory-50">
                <span className="text-charcoal-600">Flights (Outbound & Return)</span>
                <span className="font-semibold text-charcoal-900">Singapore Airlines SQ-401</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-ivory-50">
                <span className="text-charcoal-600">Boutique Stay</span>
                <span className="font-semibold text-charcoal-900">The Glasshouse Sanctuary</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-ivory-50">
                <span className="text-charcoal-600">Estimated Total Budget</span>
                <span className="font-bold text-forest-800">₹1,24,000 (Within Target)</span>
              </div>
            </div>

            <p className="text-[11px] text-charcoal-400 italic text-center pt-1">
              "Never fabricates unconfirmed hotel inventory or arbitrary prices."
            </p>
          </div>
        </div>
      </section>

      {/* 3. AI Concierge & Chatbot Assistant Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-10 bg-gradient-to-br from-[#FFF0F2] via-white to-[#F7F7F7] p-8 sm:p-12 rounded-[40px] border border-[#DDDDDD] shadow-soft">
          <div className="flex-1 space-y-4">
            <span className="px-3.5 py-1 rounded-full bg-white border border-[#FFC5CC] text-[#FF385C] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-soft-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#FF385C]" />
              <span>Interactive AI Assistant</span>
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#222222]">
              Have questions about PlanMyTravel? <br />
              <span className="italic font-light text-[#FF385C]">Ask our live AI Concierge.</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#717171] leading-relaxed max-w-lg">
              Get instant answers about how to plan trips, how our Trip Wallet and zero-fee ledger work, how to register as a personal local guide, or how to track your journey expenses with live overexpense alerts.
            </p>

            <div className="pt-2 flex flex-wrap gap-2.5 text-xs text-[#717171]">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#DDDDDD] shadow-soft-sm">
                <span className="w-2 h-2 rounded-full bg-[#008A05]"></span>
                <span>AI Itineraries</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#DDDDDD] shadow-soft-sm">
                <span className="w-2 h-2 rounded-full bg-[#008A05]"></span>
                <span>Trip Wallet & Payments</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#DDDDDD] shadow-soft-sm">
                <span className="w-2 h-2 rounded-full bg-[#008A05]"></span>
                <span>Local Guides & Stays</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#DDDDDD] shadow-soft-sm">
                <span className="w-2 h-2 rounded-full bg-[#008A05]"></span>
                <span>Expense Tracker & Alerts</span>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <Link
                to="/concierge"
                className="px-6 py-3 rounded-full bg-[#FF385C] hover:bg-[#E00B41] text-white text-xs font-semibold shadow-coral transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                Launch AI Trip Planner →
              </Link>
              <Link
                to="/expenses"
                className="px-6 py-3 rounded-full bg-white hover:bg-[#F2F2F2] border border-[#DDDDDD] text-[#222222] text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-soft-sm"
              >
                View Expense Tracker
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-[480px]">
            <AIChatbot embedded={true} />
          </div>
        </div>
      </section>

      {/* 4. Featured Accommodations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-forest-800 mb-1 block">Sanctuaries & Lofts</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-charcoal-900">
              Featured Stays
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-500 mt-1 max-w-lg">
              Explore stays verified with Hotelbeds test environment integration and our handpicked architectural portfolio.
            </p>
          </div>

          <Link
            to="/stays"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-800 hover:text-forest-800 group"
          >
            <span>Explore all stays</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredStays.map((stay) => (
            <StayCard
              key={stay.id}
              stay={stay}
              onSelect={() => navigate(`/stays`)}
            />
          ))}
        </div>
      </section>

    </div>
  );
};


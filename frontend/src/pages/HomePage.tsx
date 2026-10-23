import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, ArrowRight, Star, Heart,
  Sparkles, Compass, ShieldCheck, MapPin, Wallet as WalletIcon
} from 'lucide-react';
import { Destination, Stay } from '../types';
import { api } from '../api/client';
import { StayCard } from '../components/StayCard';
import { DestinationCard } from '../components/DestinationCard';
import { AIChatbot } from '../components/AIChatbot';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [allStays, setAllStays] = useState<Stay[]>([]);
  const [recentlyViewedStays, setRecentlyViewedStays] = useState<Stay[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Stays' },
    { id: 'weekend', label: 'Weekend Escapes' },
    { id: 'nature', label: 'Nature Retreats' },
    { id: 'coastal', label: 'Coastal Sanctuaries' },
    { id: 'cultural', label: 'Cultural Gems' },
    { id: 'adventure', label: 'Affordable Getaways' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [destRes, stayRes] = await Promise.all([
          api.getDestinations(),
          api.getStays({ limit: 24 })
        ]);
        if (destRes?.destinations) setDestinations(destRes.destinations);

        const stays: Stay[] = stayRes?.stays || [];
        setAllStays(stays);

        // Pick specific stays matching the screenshot (Noida, Ghaziabad, Gurugram) or fallback top-rated
        const ncrStays = stays.filter(s =>
          ['noida', 'ghaziabad', 'gurugram'].includes((s.city || '').toLowerCase())
        );

        if (ncrStays.length >= 4) {
          setRecentlyViewedStays(ncrStays.slice(0, 6));
        } else {
          setRecentlyViewedStays(stays.slice(0, 6));
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectStay = (stay: Stay) => {
    const dest = stay.city || stay.country || 'all';
    navigate(`/stays?destination=${encodeURIComponent(dest)}&stay=${stay.id}`);
  };

  return (
    <div className="bg-white min-h-screen text-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

        {/* ========================================================
            SECTION 1: "Welcome back" CARDS (EXACT SCREENSHOT LAYOUT)
           ======================================================== */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[#222222] tracking-tight">
            Welcome back
          </h2>

          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
            
            {/* Card 1: View details of your Noida trip */}
            <div
              onClick={() => navigate('/stays?destination=Noida')}
              className="flex-1 min-w-[340px] sm:min-w-[420px] bg-white border border-[#DDDDDD] rounded-2xl p-3.5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#F2F2F2] flex-shrink-0 border border-[#DDDDDD]/50">
                <img
                  src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=300&q=80"
                  alt="Noida trip"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#222222] group-hover:text-[#FF385C] transition-colors truncate">
                  View details of your Noida trip
                </p>
                <p className="text-xs text-[#717171] mt-0.5">
                  24–25 Oct · 2 guests →
                </p>
              </div>
            </div>

            {/* Card 2: Continue searching for homes in Noida */}
            <div
              onClick={() => navigate('/stays?destination=Noida')}
              className="flex-1 min-w-[340px] sm:min-w-[420px] bg-white border border-[#DDDDDD] rounded-2xl p-3.5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#F2F2F2] flex-shrink-0 border border-[#DDDDDD]/50">
                <img
                  src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=300&q=80"
                  alt="Noida homes"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#222222] group-hover:text-[#FF385C] transition-colors truncate">
                  Continue searching for homes in Noida
                </p>
                <p className="text-xs text-[#717171] mt-0.5">
                  24–25 Oct · 2 guests →
                </p>
              </div>
            </div>

            {/* Card 3: Track Journey Expenses & Wallet */}
            <div
              onClick={() => navigate('/expenses')}
              className="flex-1 min-w-[340px] sm:min-w-[420px] bg-white border border-[#DDDDDD] rounded-2xl p-3.5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#FFF0F2] flex-shrink-0 border border-[#FFC5CC] flex items-center justify-center text-[#FF385C]">
                <WalletIcon className="w-8 h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#222222] group-hover:text-[#FF385C] transition-colors truncate">
                  Track journey expenses & Trip Wallet
                </p>
                <p className="text-xs text-[#717171] mt-0.5">
                  Overexpense alerts · 1-click settlement →
                </p>
              </div>
            </div>

            {/* Carousel Arrow Button */}
            <button
              onClick={() => navigate('/stays')}
              className="w-9 h-9 rounded-full border border-[#DDDDDD] bg-white hover:bg-[#F2F2F2] flex items-center justify-center text-[#222222] shadow-sm flex-shrink-0 transition-all hover:scale-105 active:scale-95 cursor-pointer ml-1"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>


        {/* ========================================================
            SECTION 2: "Recently viewed →" (EXACT SCREENSHOT LAYOUT)
           ======================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <Link
              to="/stays"
              className="inline-flex items-center gap-1.5 text-xl sm:text-2xl font-bold text-[#222222] hover:text-[#FF385C] transition-colors group"
            >
              <span>Recently viewed</span>
              <span className="text-lg text-[#222222] group-hover:translate-x-1 transition-transform">→</span>
            </Link>

            {/* Pagination Controls on top right */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/stays')}
                className="w-8 h-8 rounded-full border border-[#DDDDDD] hover:bg-[#F2F2F2] flex items-center justify-center text-[#717171] hover:text-[#222222] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/stays')}
                className="w-8 h-8 rounded-full border border-[#DDDDDD] hover:bg-[#F2F2F2] flex items-center justify-center text-[#717171] hover:text-[#222222] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grid of Stays (Noida, Ghaziabad, Ghaziabad, Ghaziabad, Gurugram, Gurugram) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
            {recentlyViewedStays.map((stay) => (
              <StayCard
                key={stay.id}
                stay={stay}
                isGuestFavorite={true}
                onSelect={handleSelectStay}
              />
            ))}
          </div>
        </section>


        {/* ========================================================
            SECTION 3: POPULAR DESTINATIONS & CURATED WORLDWIDE STAYS
           ======================================================== */}
        <section className="space-y-6 pt-4 border-t border-[#DDDDDD]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#222222]">
                Explore stays in popular destinations
              </h2>
              <p className="text-xs text-[#717171] mt-0.5">
                Verified portfolio with interactive Google Maps & date-specific weather forecasts
              </p>
            </div>

            <Link
              to="/stays"
              className="text-xs font-bold text-[#FF385C] hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View all 20+ stays</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#222222] text-white shadow-sm'
                    : 'bg-[#F7F7F7] text-[#717171] hover:text-[#222222] hover:bg-[#F2F2F2] border border-[#DDDDDD]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Worldwide Curated Stays Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {allStays
              .filter(s => !['noida', 'ghaziabad', 'gurugram'].includes((s.city || '').toLowerCase()))
              .slice(0, 8)
              .map((stay) => (
                <StayCard
                  key={stay.id}
                  stay={stay}
                  isGuestFavorite={stay.rating >= 4.9}
                  onSelect={handleSelectStay}
                />
              ))}
          </div>
        </section>


        {/* ========================================================
            SECTION 4: AI CONCIERGE & CHATBOT ASSISTANT
           ======================================================== */}
        <section className="pt-6 border-t border-[#DDDDDD]">
          <div className="flex flex-col lg:flex-row items-center gap-10 bg-gradient-to-br from-[#FFF0F2] via-white to-[#F7F7F7] p-8 sm:p-12 rounded-[32px] border border-[#DDDDDD] shadow-soft">
            <div className="flex-1 space-y-4">
              <span className="px-3.5 py-1 rounded-full bg-white border border-[#FFC5CC] text-[#FF385C] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#FF385C]" />
                <span>PlanMyTravel AI Assistant</span>
              </span>
              <h3 className="font-serif text-3xl font-medium text-[#222222]">
                Have questions about your journey? <br />
                <span className="italic font-light text-[#FF385C]">Ask our live AI Concierge.</span>
              </h3>
              <p className="text-xs text-[#717171] leading-relaxed max-w-lg">
                Get instant answers about planning day-by-day itineraries, using your Trip Wallet, registering as a local guide, or monitoring expenses with live overexpense alerts.
              </p>

              <div className="pt-2 flex flex-wrap gap-2 text-xs text-[#717171]">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#DDDDDD]">
                  <span className="w-2 h-2 rounded-full bg-[#008A05]"></span>
                  <span>AI Itineraries</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#DDDDDD]">
                  <span className="w-2 h-2 rounded-full bg-[#008A05]"></span>
                  <span>Trip Wallet</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#DDDDDD]">
                  <span className="w-2 h-2 rounded-full bg-[#008A05]"></span>
                  <span>Personal Guides</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#DDDDDD]">
                  <span className="w-2 h-2 rounded-full bg-[#008A05]"></span>
                  <span>Expense Tracker</span>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <Link
                  to="/concierge"
                  className="px-6 py-3 rounded-full bg-[#FF385C] hover:bg-[#E00B41] text-white text-xs font-semibold shadow-coral transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Launch AI Trip Planner →
                </Link>
                <Link
                  to="/expenses"
                  className="px-6 py-3 rounded-full bg-white hover:bg-[#F2F2F2] border border-[#DDDDDD] text-[#222222] text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
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

      </div>
    </div>
  );
};

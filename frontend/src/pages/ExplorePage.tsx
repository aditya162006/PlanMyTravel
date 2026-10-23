import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, RotateCcw, Compass, MapPin, Calendar, Sparkles, Bed, Users, ArrowUpRight, Clock, Star, ShieldCheck } from 'lucide-react';
import { Destination } from '../types';
import { api } from '../api/client';
import { DestinationCard } from '../components/DestinationCard';

export const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock Itineraries Blueprint Data
  const mockItineraries = [
    {
      id: 'mock_itin_santorini',
      title: '4-Day Aegean Caldera & Sunset Sail',
      destination: 'Santorini & Cyclades, Greece',
      category: 'Coastal Sanctuaries',
      duration: '4 Days / 3 Nights',
      budget: 85000,
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
      stayName: 'Canaves Oia Suites (Caldera View)',
      guideName: 'Eleni Vassiliou (Certified Cycladic Host)',
      rating: 4.98,
      reviewsCount: 182,
      highlights: ['Private Catamaran Sunset Sail', 'Oia Blue Dome Promenade', 'Assyrtiko Wine Tasting'],
    },
    {
      id: 'mock_itin_bali',
      title: '5-Day Sacred Jungle & Ocean Cliff Sanctuary',
      destination: 'Bali & Nusa Islands, Indonesia',
      category: 'Nature Retreats',
      duration: '5 Days / 4 Nights',
      budget: 45000,
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
      stayName: 'Viceroy Bali Valley of the Kings',
      guideName: 'Wayan Sudarsana (Certified Cultural Guide)',
      rating: 4.96,
      reviewsCount: 210,
      highlights: ['Tegallalang Terraces Trek', 'Tirta Empul Sacred Blessing', 'Nusa Penida T-Rex Cliff Excursion'],
    },
    {
      id: 'mock_itin_iceland',
      title: '4-Day Geothermal Wonder & Northern Lights',
      destination: 'Reykjavik & Golden Circle, Iceland',
      category: 'Affordable Adventures',
      duration: '4 Days / 3 Nights',
      budget: 95000,
      image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80',
      stayName: 'The Retreat at Blue Lagoon',
      guideName: 'Astrid Sigurdardottir (Arctic Glaciologist)',
      rating: 4.99,
      reviewsCount: 164,
      highlights: ['Blue Lagoon Mineral Soak', 'Gullfoss Glacial Waterfall', 'Aurora Borealis Wilderness Hunt'],
    },
  ];

  // Filters state
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [selectedStyle, setSelectedStyle] = useState(searchParams.get('style') || '');
  const [sortBy, setSortBy] = useState('rating_desc');
  const [maxBudget, setMaxBudget] = useState<number>(300000);

  const categories = [
    { id: 'all', label: 'All Destinations' },
    { id: 'weekend', label: 'Weekend Escapes' },
    { id: 'nature', label: 'Nature Retreats' },
    { id: 'coastal', label: 'Coastal Sanctuaries' },
    { id: 'cultural', label: 'Cultural Gems' },
    { id: 'adventure', label: 'Affordable Adventures' },
  ];

  const travelStyles = [
    'Cultural & Heritage', 'Nature & Wildlife', 'Relaxation & Wellness',
    'Culinary & Wine', 'Romantic', 'Architecture', 'Adventure'
  ];

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        sort: sortBy,
        max_budget: maxBudget,
      };
      if (query.trim()) params.q = query.trim();
      if (category !== 'all') params.category = category;
      if (selectedStyle) params.style = selectedStyle;

      const res = await api.getDestinations(params);
      if (res?.destinations) {
        setDestinations(res.destinations);
      }
    } catch (err) {
      console.error('Failed to fetch destinations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, [category, selectedStyle, sortBy, maxBudget]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDestinations();
  };

  const handleResetFilters = () => {
    setQuery('');
    setCategory('all');
    setSelectedStyle('');
    setSortBy('rating_desc');
    setMaxBudget(300000);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Page Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-forest-800 mb-1 block">Curated Exploration</span>
        <h1 className="font-serif text-3xl sm:text-5xl font-medium text-charcoal-900">
          Discover Places
        </h1>
        <p className="text-sm text-charcoal-500 mt-2 max-w-xl font-light">
          Search across verified destinations with realistic budget breakdowns and editorial photography.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-charcoal-100 shadow-soft-sm space-y-4">
        
        {/* Top row: Search input & Sort */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative w-full">
            <Search className="w-4 h-4 absolute left-4 top-3.5 text-charcoal-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by city, country, or vibe..."
              className="w-full pl-11 pr-4 py-2.5 text-sm rounded-full border border-charcoal-200 focus:border-forest-800 focus:ring-1 focus:ring-forest-800 outline-none transition-all placeholder:text-charcoal-300"
            />
          </form>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-charcoal-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-semibold text-charcoal-800 bg-ivory-100 px-3.5 py-2 rounded-full border border-charcoal-200 outline-none cursor-pointer"
              >
                <option value="rating_desc">Highest Rated</option>
                <option value="cost_asc">Budget: Low to High</option>
                <option value="cost_desc">Budget: High to Low</option>
                <option value="name_asc">Alphabetical (A-Z)</option>
              </select>
            </div>

            <button
              onClick={handleResetFilters}
              className="p-2 rounded-full text-charcoal-400 hover:text-charcoal-800 hover:bg-ivory-200 transition-colors"
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2 border-t border-charcoal-100/70">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                category === cat.id
                  ? 'bg-charcoal-900 text-ivory-50 shadow-soft-sm'
                  : 'bg-ivory-50 text-charcoal-600 hover:text-charcoal-900 border border-charcoal-100 hover:border-charcoal-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Style Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-charcoal-400 uppercase tracking-wider mr-2">Style:</span>
          {travelStyles.map((style) => (
            <button
              key={style}
              onClick={() => setSelectedStyle(selectedStyle === style ? '' : style)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                selectedStyle === style
                  ? 'bg-forest-800 text-white'
                  : 'bg-white text-charcoal-600 border border-charcoal-200 hover:border-charcoal-400'
              }`}
            >
              {style}
            </button>
          ))}
        </div>

      </div>

      {/* Destinations Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="aspect-[4/3] rounded-3xl bg-ivory-200 animate-pulse"></div>
          ))}
        </div>
      ) : destinations.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-charcoal-100 p-8 space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-ivory-100 text-charcoal-400 flex items-center justify-center mx-auto">
            <Compass className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="font-serif text-xl font-medium text-charcoal-900">No destinations found</h3>
          <p className="text-xs text-charcoal-500">
            We couldn't find any places matching your current search parameters. Try broadening your budget or resetting filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-full bg-forest-800 text-white text-xs font-medium hover:bg-forest-900 transition-colors shadow-soft"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((dest) => (
            <DestinationCard key={dest.id} destination={dest} />
          ))}
        </div>
      )}

    </div>
  );
};


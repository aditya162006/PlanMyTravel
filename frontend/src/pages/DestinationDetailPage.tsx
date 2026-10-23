import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, Calendar, Clock, Sparkles, CheckCircle2, Bed, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import { Destination, Stay } from '../types';
import { api } from '../api/client';
import { StayCard } from '../components/StayCard';

export const DestinationDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await api.getDestination(slug);
        setDestination(data);
      } catch (err: any) {
        setError(err.message || 'Destination not found');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-3 border-forest-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-charcoal-500 mt-4 font-light">Loading editorial destination dossier...</p>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl font-medium text-charcoal-900">Destination Not Found</h2>
        <p className="text-xs text-charcoal-500">{error || "The destination requested could not be retrieved."}</p>
        <Link to="/explore" className="inline-block px-5 py-2.5 rounded-full bg-forest-800 text-white text-xs font-medium">
          Return to Explore
        </Link>
      </div>
    );
  }

  const galleryImages = [
    destination.hero_image_url || destination.image_url,
    ...(destination.gallery?.map(g => g.image_url) || [])
  ].filter(Boolean) as string[];

  // Fallbacks if only 1 image
  const displayPhotos = [
    galleryImages[0] || 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80',
    galleryImages[1] || 'https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=800&q=80',
    galleryImages[2] || 'https://images.unsplash.com/photo-1506351421178-63b52a2d2562?auto=format&fit=crop&w=800&q=80',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

      {/* Title & Location Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-charcoal-400 font-medium">
          <Link to="/explore" className="hover:text-charcoal-900 transition-colors">Destinations</Link>
          <span>/</span>
          <span className="text-charcoal-800">{destination.name}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <h1 className="font-serif text-3xl sm:text-5xl font-medium text-charcoal-900">
            {destination.name}
          </h1>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1 text-charcoal-800">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{destination.rating ? destination.rating.toFixed(1) : '4.9'}</span>
            </span>
            <span className="text-charcoal-400">•</span>
            <span className="flex items-center gap-1 text-charcoal-600">
              <MapPin className="w-3.5 h-3.5 text-sage-600" />
              <span>{destination.country || destination.region}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Editorial Photo Gallery Grid (Airbnb-inspired) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-3xl overflow-hidden aspect-[16/9] md:aspect-[21/9] max-h-[500px] shadow-soft">
        <div className="md:col-span-2 h-full overflow-hidden bg-ivory-200">
          <img
            src={displayPhotos[0]}
            alt={destination.name}
            className="w-full h-full object-cover object-center hover:scale-102 transition-transform duration-500"
          />
        </div>
        <div className="hidden md:grid grid-rows-2 gap-3 h-full">
          <div className="overflow-hidden bg-ivory-200">
            <img
              src={displayPhotos[1]}
              alt={`${destination.name} 2`}
              className="w-full h-full object-cover object-center hover:scale-102 transition-transform duration-500"
            />
          </div>
          <div className="overflow-hidden bg-ivory-200">
            <img
              src={displayPhotos[2]}
              alt={`${destination.name} 3`}
              className="w-full h-full object-cover object-center hover:scale-102 transition-transform duration-500"
            />
          </div>
        </div>
      </div>

      {/* Main Content & Sticky Planning Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* Left Column: Dossier Information */}
        <div className="lg:col-span-2 space-y-10">

          {/* Tagline & Overview */}
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-forest-800 mb-2 block">
              Editorial Overview
            </span>
            <p className="font-serif text-2xl font-light text-charcoal-900 leading-snug italic">
              "{destination.tagline || destination.short_description}"
            </p>
            <p className="mt-4 text-sm text-charcoal-600 leading-relaxed font-light">
              {destination.description}
            </p>
          </div>

          {/* Quick Facts Pill Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-6 rounded-3xl bg-ivory-100/60 border border-charcoal-100 text-xs">
            <div>
              <span className="text-charcoal-400 font-medium block">Best Time to Visit</span>
              <span className="font-semibold text-charcoal-800 mt-0.5 block">{destination.best_season || 'Year-round'}</span>
            </div>
            <div>
              <span className="text-charcoal-400 font-medium block">Suggested Stay</span>
              <span className="font-semibold text-charcoal-800 mt-0.5 block">{destination.ideal_stay || '3-5 days'}</span>
            </div>
            <div>
              <span className="text-charcoal-400 font-medium block">Category</span>
              <span className="font-semibold text-charcoal-800 mt-0.5 block">{destination.category || 'Cultural & Nature'}</span>
            </div>
          </div>

          {/* Key Attractions */}
          {destination.attractions && destination.attractions.length > 0 && (
            <div>
              <h3 className="font-serif text-xl font-medium text-charcoal-900 mb-4">
                Celebrated Landmarks & Sights
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {destination.attractions.map((att, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white border border-charcoal-100 shadow-soft-sm flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-semibold text-charcoal-900">{att.name}</h4>
                      {att.category && <span className="text-[11px] text-charcoal-400">{att.category}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Local Activities & Experiences */}
          {destination.activities && destination.activities.length > 0 && (
            <div>
              <h3 className="font-serif text-xl font-medium text-charcoal-900 mb-4">
                Curated Experiences
              </h3>
              <div className="space-y-2.5">
                {destination.activities.map((act, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-ivory-50 border border-charcoal-100/80 text-xs text-charcoal-700 flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-forest-800"></span>
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weather & Practical Notes */}
          {destination.weather_info && (
            <div className="p-5 rounded-2xl bg-sage-50/70 border border-sage-200/50 text-xs space-y-1">
              <span className="font-semibold text-forest-900 block flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-forest-800" />
                <span>Weather & Practical Notes</span>
              </span>
              <p className="text-charcoal-600 font-light leading-relaxed">
                {destination.weather_info}
              </p>
            </div>
          )}

        </div>

        {/* Right Column: Sticky Action & Cost Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-white rounded-3xl border border-charcoal-100 p-6 shadow-float space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal-400 block mb-1">Indicative Budget</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-charcoal-900">
                  ₹{(destination.estimated_cost_min || 45000).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-charcoal-400 font-normal"> - ₹{(destination.estimated_cost_max || 120000).toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[11px] text-charcoal-400 mt-1">Based on {destination.ideal_stay || '3-4 days'} for 2 travelers.</p>
            </div>

            <div className="space-y-2 border-t border-charcoal-100 pt-4 text-xs">
              <div className="flex justify-between text-charcoal-600">
                <span>Indicative Flights (Return)</span>
                <span className="font-medium text-charcoal-900">~₹{Math.round((destination.estimated_cost_min || 50000) * 0.4).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-charcoal-600">
                <span>Stays (Boutique)</span>
                <span className="font-medium text-charcoal-900">~₹{Math.round((destination.estimated_cost_min || 50000) * 0.35).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-charcoal-600">
                <span>Activities & Dining</span>
                <span className="font-medium text-charcoal-900">~₹{Math.round((destination.estimated_cost_min || 50000) * 0.25).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => navigate(`/concierge?destination=${encodeURIComponent(destination.name)}`)}
              className="w-full py-3.5 px-4 rounded-full bg-forest-800 hover:bg-forest-900 text-ivory-50 text-xs font-semibold flex items-center justify-center gap-2 shadow-soft hover:shadow-soft-lg transition-all"
            >
              <Sparkles className="w-4 h-4 text-sage-300" />
              <span>Generate AI Plan for {destination.name}</span>
            </button>

            <p className="text-[10px] text-charcoal-400 text-center italic">
              Personalized flight, stay, and daily activity concierge schedule generated in ~10 seconds.
            </p>
          </div>
        </div>

      </div>

      {/* Related Accommodations Section */}
      {destination.related_stays && destination.related_stays.length > 0 && (
        <section className="pt-8 border-t border-charcoal-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-forest-800 block mb-1">Accommodations</span>
              <h3 className="font-serif text-2xl font-medium text-charcoal-900">
                Where to Stay in {destination.name}
              </h3>
            </div>
            <Link
              to={`/stays?destination=${encodeURIComponent(destination.name)}`}
              className="text-xs font-semibold text-charcoal-800 hover:text-forest-800 transition-colors"
            >
              View all stays in {destination.name} →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destination.related_stays.map(stay => (
              <StayCard
                key={stay.id}
                stay={stay}
                onSelect={() => navigate(`/stays?destination=${encodeURIComponent(destination.name)}&stay=${stay.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Certified Personal Local Guides Section */}
      {destination.local_guides && destination.local_guides.length > 0 && (
        <section className="pt-8 border-t border-charcoal-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-forest-800 block mb-1">Private Concierge</span>
              <h3 className="font-serif text-2xl font-medium text-charcoal-900">
                Certified Personal Guides in {destination.name}
              </h3>
            </div>
            <Link
              to={`/concierge?destination=${encodeURIComponent(destination.name)}`}
              className="text-xs font-semibold text-charcoal-800 hover:text-forest-800 transition-colors"
            >
              Generate Itinerary with Guide →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destination.local_guides.map(guide => (
              <div
                key={guide.id}
                className="bg-white rounded-3xl border border-charcoal-100 p-6 shadow-soft-sm hover:shadow-soft-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3.5">
                    <img
                      src={guide.photo_url || '/images/guides/guide_1.jpg'}
                      alt={guide.display_name}
                      className="w-14 h-14 rounded-2xl object-cover border border-charcoal-200"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-serif text-lg font-medium text-charcoal-900">{guide.display_name}</h4>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-sage-100 text-forest-800">Verified</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{guide.rating.toFixed(2)}</span>
                        <span className="text-charcoal-400 font-normal">({guide.review_count || 120} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-charcoal-600 line-clamp-3 font-light leading-relaxed">
                    {guide.bio}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex flex-wrap gap-1">
                      {guide.languages.map((l, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-ivory-100 text-[10px] text-charcoal-700 font-medium">
                          {l}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {guide.specialties.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-sage-50 text-[10px] text-forest-800 font-medium border border-sage-200/50">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-charcoal-100 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-charcoal-900">
                      ₹{guide.daily_rate.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-charcoal-500"> / day</span>
                  </div>

                  <Link
                    to={`/concierge?destination=${encodeURIComponent(destination.name)}`}
                    className="px-4 py-2 rounded-full bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold transition-colors"
                  >
                    Select Guide
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};


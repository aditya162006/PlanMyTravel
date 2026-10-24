import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Copy, Trash2, ArrowRight, Compass, Sparkles, Radio, ShieldAlert, Phone } from 'lucide-react';
import { Trip } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { SOSEmergencyModal } from '../components/SOSEmergencyModal';

export const MyTripsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  // SOS Emergency State
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [selectedSOSTrip, setSelectedSOSTrip] = useState<Trip | null>(null);

  const fetchTrips = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await api.getTrips();
      if (res?.trips) setTrips(res.trips);
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
    } else {
      fetchTrips();
    }
  }, [isAuthenticated]);

  const handleTriggerSOS = (trip?: Trip) => {
    setSelectedSOSTrip(trip || (trips.length > 0 ? trips[0] : null));
    setIsSOSOpen(true);
  };

  const handleDelete = async (tripId: string) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;
    try {
      await api.deleteTrip(tripId);
      setTrips(trips.filter(t => t.id !== tripId));
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleDuplicate = async (tripId: string) => {
    try {
      const res = await api.duplicateTrip(tripId);
      if (res?.trip) {
        setTrips([res.trip, ...trips]);
      }
    } catch (err: any) {
      alert(`Duplicate failed: ${err.message}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-ivory-100 text-charcoal-500 flex items-center justify-center mx-auto">
          <Compass className="w-6 h-6 stroke-[1.5]" />
        </div>
        <h2 className="font-serif text-2xl font-medium text-charcoal-900">Sign in to view your trips</h2>
        <p className="text-xs text-charcoal-500 leading-relaxed font-light">
          Your personalized travel plans and schedules are securely saved to your account.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 rounded-full bg-forest-800 text-ivory-50 text-xs font-semibold hover:bg-forest-900 transition-colors shadow-soft"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-forest-800 block mb-1">Your Portfolio</span>
          <h1 className="font-serif text-3xl sm:text-5xl font-medium text-charcoal-900">
            Saved Itineraries
          </h1>
          <p className="text-sm text-charcoal-500 mt-2 font-light">
            Review, refine, or duplicate your AI-architected travel journeys.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* High-Priority SOS Emergency Button */}
          <button
            onClick={() => handleTriggerSOS()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 hover:from-rose-800 hover:to-rose-800 text-white text-xs font-bold shadow-soft-lg transition-all border border-rose-400 animate-pulse"
            title="Emergency SOS Distress Alert to Local Authorities"
          >
            <Radio className="w-4 h-4 text-white animate-spin" />
            <span>SOS Emergency</span>
          </button>

          <Link
            to="/concierge"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-forest-800 hover:bg-forest-900 text-ivory-50 text-xs font-semibold shadow-soft transition-all"
          >
            <Sparkles className="w-4 h-4 text-sage-300" />
            <span>Plan New Trip</span>
          </Link>
        </div>
      </div>

      {/* Trips Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="aspect-[4/3] rounded-3xl bg-ivory-200 animate-pulse"></div>
          ))}
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-charcoal-100 p-8 space-y-4 max-w-lg mx-auto shadow-soft-sm">
          <div className="w-12 h-12 rounded-full bg-ivory-100 text-charcoal-400 flex items-center justify-center mx-auto">
            <Compass className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="font-serif text-xl font-medium text-charcoal-900">No saved itineraries yet</h3>
          <p className="text-xs text-charcoal-500 font-light">
            Use the AI Travel Concierge to generate your first custom travel plan. You can edit every day, customize activities, and save it here.
          </p>
          <Link
            to="/concierge"
            className="inline-block px-6 py-2.5 rounded-full bg-forest-800 text-white text-xs font-semibold hover:bg-forest-900 transition-colors shadow-soft"
          >
            Create Your First Itinerary
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map(trip => {
            const coverImage = trip.destination?.hero_image_url ||
              'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80';

            return (
              <div
                key={trip.id}
                className="bg-white rounded-3xl border border-charcoal-100 overflow-hidden shadow-soft-sm hover:shadow-soft-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-ivory-200">
                    <img
                      src={coverImage}
                      alt={trip.title}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-charcoal-800 shadow-soft-sm">
                        {trip.travel_style || 'Curated'}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-charcoal-400">
                      <MapPin className="w-3.5 h-3.5 text-sage-600" />
                      <span>{trip.destination?.name || trip.title}</span>
                    </div>

                    <h3 className="font-serif text-xl font-medium text-charcoal-900 line-clamp-1">
                      {trip.title}
                    </h3>

                    {trip.active_plan?.summary && (
                      <p className="text-xs text-charcoal-500 line-clamp-2 font-light leading-relaxed">
                        {trip.active_plan.summary}
                      </p>
                    )}

                    <div className="pt-2 flex items-center justify-between text-xs text-charcoal-500 border-t border-charcoal-100/70">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-charcoal-400" />
                        <span>{trip.travelers} Travelers</span>
                      </div>
                      <span className="font-semibold text-charcoal-900">
                        ₹{(trip.total_budget || 100000).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center justify-between gap-2 border-t border-charcoal-100/70 pt-4">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDuplicate(trip.id)}
                      className="p-2 rounded-xl text-charcoal-500 hover:text-charcoal-900 hover:bg-ivory-100 transition-colors"
                      title="Duplicate Trip"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(trip.id)}
                      className="p-2 rounded-xl text-terracotta-500 hover:text-terracotta-700 hover:bg-terracotta-50 transition-colors"
                      title="Delete Trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => navigate(`/concierge?destination=${encodeURIComponent(trip.destination?.name || trip.title)}`)}
                    className="px-4 py-2 rounded-full bg-charcoal-900 hover:bg-forest-800 text-ivory-50 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <span>Open Itinerary</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};


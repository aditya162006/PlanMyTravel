import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Sparkles, MapPin, Calendar, Users, DollarSign, Compass, ArrowRight, RotateCw, Save, CheckCircle2, Plane, Car, Bed, ShieldAlert, AlertCircle, RefreshCw, Star, PieChart } from 'lucide-react';
import { Itinerary, ItineraryDay, ItineraryActivity } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ItineraryDayCard } from '../components/ItineraryDayCard';

export const ConciergePlannerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuth();

  // Intake State
  const [destination, setDestination] = useState(searchParams.get('destination') || 'Singapore');
  const [origin, setOrigin] = useState('New Delhi');
  const [days, setDays] = useState(Number(searchParams.get('days')) || 4);
  const [travelers, setTravelers] = useState(Number(searchParams.get('travelers')) || 2);
  const [budget, setBudget] = useState(150000);
  const [currency, setCurrency] = useState('INR');
  const [travelStyle, setTravelStyle] = useState('Cultural & Relaxation');
  const [pace, setPace] = useState('balanced');
  const [requirements, setRequirements] = useState('');
  const [notes, setNotes] = useState('');

  // Execution State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');

  const travelStyles = [
    'Cultural & Relaxation', 'Romantic Getaway', 'Nature & Adventure',
    'Luxury & Wellness', 'Culinary & Nightlife', 'Family Friendly'
  ];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGenerating(true);
    setError('');
    setSaveSuccess('');
    setGenerationStep('Analyzing authentic flight schedules and routes...');

    try {
      setTimeout(() => setGenerationStep('Curating boutique accommodations from Hotelbeds...'), 1200);
      setTimeout(() => setGenerationStep('Sequencing morning, afternoon & evening local experiences...'), 2400);

      const res = await api.planTrip({
        destination,
        origin,
        days,
        travelers,
        budget,
        currency,
        travel_style: travelStyle,
        pace,
        requirements,
        notes,
      });

      if (res?.itinerary) {
        setItinerary(res.itinerary);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate itinerary. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleRegenerateDay = async (targetDay: ItineraryDay) => {
    if (!itinerary) return;
    try {
      const res = await api.regenerateDay({
        day: targetDay,
        destination,
        travel_style: travelStyle,
      });

      if (res?.day) {
        const updatedDays = itinerary.days.map(d =>
          d.day_number === targetDay.day_number ? res.day : d
        );
        setItinerary({ ...itinerary, days: updatedDays });
      }
    } catch (err: any) {
      alert(`Could not regenerate day: ${err.message}`);
    }
  };

  const handleReplaceActivity = async (dayNumber: number, slot: 'morning' | 'afternoon' | 'evening', currentAct: ItineraryActivity) => {
    if (!itinerary) return;
    try {
      const res = await api.replaceActivity({
        slot,
        current_activity: currentAct,
        destination,
      });

      if (res?.activity) {
        const updatedDays = itinerary.days.map(d => {
          if (d.day_number === dayNumber) {
            return { ...d, [slot]: res.activity };
          }
          return d;
        });
        setItinerary({ ...itinerary, days: updatedDays });
      }
    } catch (err: any) {
      alert(`Could not replace activity: ${err.message}`);
    }
  };

  const handleSaveTrip = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (!itinerary) return;

    setSaveLoading(true);
    try {
      await api.saveTrip({
        title: itinerary.title,
        itinerary,
        preferences: {
          destination,
          origin,
          days,
          travelers,
          budget,
          currency,
          travel_style: travelStyle,
        }
      });
      setSaveSuccess('Itinerary successfully saved to My Trips!');
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err: any) {
      alert(`Failed to save trip: ${err.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-800 text-ivory-100 text-xs font-semibold mb-2 shadow-soft-sm">
          <Sparkles className="w-3.5 h-3.5 text-sage-300" />
          <span>AI Travel Concierge</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-medium text-charcoal-900">
          Personalized Trip Architect
        </h1>
        <p className="text-sm text-charcoal-500 mt-2 max-w-2xl font-light">
          Specify your travel preferences to produce an end-to-end journey covering flights, transfers, stays, daily itineraries, and a clear budget.
        </p>
      </div>

      {/* Intake Form */}
      <div className="bg-white rounded-3xl border border-charcoal-100 p-6 sm:p-10 shadow-soft space-y-8">
        <form onSubmit={handleGenerate} className="space-y-6">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Origin */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-1.5">Departure City</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-charcoal-400" />
                <input
                  type="text"
                  required
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. New Delhi"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-charcoal-200 focus:border-forest-800 focus:ring-1 focus:ring-forest-800 outline-none transition-all"
                />
              </div>
            </div>

            {/* Destination */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-1.5">Destination</label>
              <div className="relative">
                <Compass className="w-4 h-4 absolute left-3.5 top-3.5 text-charcoal-400" />
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Singapore, Kyoto..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-charcoal-200 focus:border-forest-800 focus:ring-1 focus:ring-forest-800 outline-none transition-all"
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-1.5">Trip Length (Days)</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-3.5 text-charcoal-400" />
                <select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-charcoal-200 focus:border-forest-800 focus:ring-1 focus:ring-forest-800 outline-none bg-white cursor-pointer"
                >
                  <option value={2}>2 Days (Weekend Trip)</option>
                  <option value={3}>3 Days (Long Weekend)</option>
                  <option value={4}>4 Days (Balanced)</option>
                  <option value={5}>5 Days (Immersive)</option>
                  <option value={7}>7 Days (Full Week)</option>
                  <option value={10}>10 Days (Extended Voyage)</option>
                </select>
              </div>
            </div>

            {/* Travelers */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-1.5">Travelers</label>
              <div className="relative">
                <Users className="w-4 h-4 absolute left-3.5 top-3.5 text-charcoal-400" />
                <select
                  value={travelers}
                  onChange={(e) => setTravelers(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-charcoal-200 focus:border-forest-800 focus:ring-1 focus:ring-forest-800 outline-none bg-white cursor-pointer"
                >
                  <option value={1}>1 Traveler (Solo)</option>
                  <option value={2}>2 Travelers (Couple / Pair)</option>
                  <option value={3}>3 Travelers (Small Group)</option>
                  <option value={4}>4 Travelers (Family / Friends)</option>
                </select>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">

            {/* Total Budget */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-1.5">Approx. Budget ({currency})</label>
              <div className="relative">
                <span className="w-4 h-4 absolute left-3.5 top-2.5 text-charcoal-600 font-bold text-sm select-none">₹</span>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-charcoal-200 focus:border-forest-800 focus:ring-1 focus:ring-forest-800 outline-none transition-all"
                />
              </div>
            </div>

            {/* Travel Style */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-1.5">Travel Style</label>
              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-charcoal-200 focus:border-forest-800 focus:ring-1 focus:ring-forest-800 outline-none bg-white cursor-pointer"
              >
                {travelStyles.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Preferred Pace */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-1.5">Preferred Pace</label>
              <select
                value={pace}
                onChange={(e) => setPace(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-charcoal-200 focus:border-forest-800 focus:ring-1 focus:ring-forest-800 outline-none bg-white cursor-pointer"
              >
                <option value="relaxed">Relaxed (1-2 main highlights daily)</option>
                <option value="balanced">Balanced (2-3 sights with cafe breaks)</option>
                <option value="packed">Fast-paced (Maximize all landmarks)</option>
              </select>
            </div>

          </div>

          {/* Special Requirements */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-1.5">Dietary or Accessibility Needs (Optional)</label>
            <input
              type="text"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="e.g. Vegetarian, wheelchair accessible, near metro station..."
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-charcoal-200 focus:border-forest-800 focus:ring-1 focus:ring-forest-800 outline-none"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-4 flex items-center justify-between border-t border-charcoal-100">
            <span className="text-xs text-charcoal-400 italic">
              Powered by Google Gemini 3.5 & verified provider adapters
            </span>

            <button
              type="submit"
              disabled={isGenerating}
              className="px-8 py-3.5 rounded-full bg-forest-800 hover:bg-forest-900 text-ivory-50 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-soft hover:shadow-soft-lg transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-sage-300" />
                  <span>Synthesizing Itinerary...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-sage-300" />
                  <span>Build Full Itinerary</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* Live Loading Message */}
      {isGenerating && (
        <div className="p-8 text-center bg-white rounded-3xl border border-sage-200/80 shadow-soft max-w-lg mx-auto space-y-3">
          <div className="w-10 h-10 border-3 border-forest-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h3 className="font-serif text-lg font-medium text-charcoal-900">Crafting Your Journey</h3>
          <p className="text-xs text-forest-800 font-medium animate-pulse">{generationStep}</p>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-terracotta-50 border border-terracotta-200 text-terracotta-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-terracotta-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Generated Itinerary Display */}
      {itinerary && (
        <div className="space-y-10 animate-in fade-in duration-300">

          {/* Itinerary Header & Action Bar */}
          <div className="bg-white rounded-3xl border border-charcoal-100 p-8 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-forest-800 block">Complete Concierge Dossier</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal-900">
                {itinerary.title}
              </h2>
              <p className="text-xs text-charcoal-500 max-w-2xl font-light leading-relaxed">
                {itinerary.summary}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {saveSuccess && (
                <span className="text-xs font-semibold text-forest-800 bg-sage-50 px-3 py-1.5 rounded-full border border-sage-200">
                  {saveSuccess}
                </span>
              )}
              <button
                onClick={handleSaveTrip}
                disabled={saveLoading}
                className="px-5 py-2.5 rounded-full bg-forest-800 hover:bg-forest-900 text-ivory-50 text-xs font-semibold flex items-center gap-2 shadow-soft transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saveLoading ? 'Saving...' : 'Save to My Trips'}</span>
              </button>
            </div>
          </div>

          {/* Section 1: Flights Component */}
          {itinerary.flights && (
            <div className="bg-white rounded-3xl border border-charcoal-100 p-6 sm:p-8 shadow-soft space-y-6">
              <div className="flex items-center gap-2 border-b border-charcoal-100 pb-3">
                <Plane className="w-5 h-5 text-forest-800" />
                <h3 className="font-serif text-xl font-medium text-charcoal-900">
                  Recommended Flight Schedules
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Outbound */}
                {itinerary.flights.outbound && (
                  <div className="p-5 rounded-2xl bg-ivory-50/70 border border-charcoal-100 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-forest-800 block">Outbound Flight</span>
                    <div className="flex justify-between items-baseline">
                      <span className="font-serif text-lg font-semibold text-charcoal-900">{itinerary.flights.outbound.airline}</span>
                      <span className="text-xs text-charcoal-500 font-mono">{itinerary.flights.outbound.flight_number}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-charcoal-600">
                      <div>
                        <span className="block font-bold text-charcoal-900">{itinerary.flights.outbound.departure_time}</span>
                        <span className="text-[11px] text-charcoal-400">{itinerary.flights.outbound.departure_airport}</span>
                      </div>
                      <div className="text-center px-3 text-[10px] text-charcoal-400">
                        <span>{itinerary.flights.outbound.duration}</span>
                        <div className="w-16 h-px bg-charcoal-300 mx-auto my-0.5"></div>
                        <span>{itinerary.flights.outbound.layovers || 'Non-stop'}</span>
                      </div>
                      <div className="text-right">
                        <span className="block font-bold text-charcoal-900">{itinerary.flights.outbound.arrival_time}</span>
                        <span className="text-[11px] text-charcoal-400">{itinerary.flights.outbound.arrival_airport}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-charcoal-500 italic pt-1">{itinerary.flights.outbound.booking_advice}</p>
                  </div>
                )}

                {/* Return */}
                {itinerary.flights.return && (
                  <div className="p-5 rounded-2xl bg-ivory-50/70 border border-charcoal-100 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-forest-800 block">Return Flight</span>
                    <div className="flex justify-between items-baseline">
                      <span className="font-serif text-lg font-semibold text-charcoal-900">{itinerary.flights.return.airline}</span>
                      <span className="text-xs text-charcoal-500 font-mono">{itinerary.flights.return.flight_number}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-charcoal-600">
                      <div>
                        <span className="block font-bold text-charcoal-900">{itinerary.flights.return.departure_time}</span>
                        <span className="text-[11px] text-charcoal-400">{itinerary.flights.return.departure_airport}</span>
                      </div>
                      <div className="text-center px-3 text-[10px] text-charcoal-400">
                        <span>{itinerary.flights.return.duration}</span>
                        <div className="w-16 h-px bg-charcoal-300 mx-auto my-0.5"></div>
                        <span>{itinerary.flights.return.layovers || 'Non-stop'}</span>
                      </div>
                      <div className="text-right">
                        <span className="block font-bold text-charcoal-900">{itinerary.flights.return.arrival_time}</span>
                        <span className="text-[11px] text-charcoal-400">{itinerary.flights.return.arrival_airport}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-charcoal-500 italic pt-1">{itinerary.flights.return.booking_advice}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 2: Stays & Transfers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Transfers */}
            {itinerary.transfers && itinerary.transfers.length > 0 && (
              <div className="bg-white rounded-3xl border border-charcoal-100 p-6 shadow-soft space-y-4">
                <div className="flex items-center gap-2 border-b border-charcoal-100 pb-3">
                  <Car className="w-5 h-5 text-forest-800" />
                  <h3 className="font-serif text-lg font-medium text-charcoal-900">Airport & Transit Transfers</h3>
                </div>
                {itinerary.transfers.map((tr, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-ivory-50 text-xs space-y-1.5">
                    <div className="flex justify-between font-semibold text-charcoal-900">
                      <span>{tr.mode}</span>
                      <span>₹{tr.estimated_cost.toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-charcoal-600">Route: {tr.from} → {tr.to} ({tr.duration})</p>
                    {tr.tips && <p className="text-[11px] text-charcoal-400 italic">{tr.tips}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Accommodation */}
            {itinerary.accommodations && itinerary.accommodations.length > 0 && (
              <div className="bg-white rounded-3xl border border-charcoal-100 p-6 shadow-soft space-y-4">
                <div className="flex items-center justify-between border-b border-charcoal-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5 text-forest-800" />
                    <h3 className="font-serif text-lg font-medium text-charcoal-900">Recommended Boutique Stay</h3>
                  </div>
                  <Link
                    to={`/stays?destination=${encodeURIComponent(destination)}`}
                    className="text-xs font-semibold text-forest-800 hover:text-forest-900 transition-colors"
                  >
                    Browse all stays in {destination} →
                  </Link>
                </div>
                {itinerary.accommodations.map((acc: any, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => navigate(`/stays?destination=${encodeURIComponent(destination)}`)}
                    className="p-4 rounded-2xl bg-ivory-50 hover:bg-ivory-100/80 transition-colors cursor-pointer text-xs space-y-2.5 border border-transparent hover:border-charcoal-200"
                  >
                    <div className="flex justify-between font-semibold text-charcoal-900 text-sm">
                      <span>{acc.name}</span>
                      <span className="text-forest-800">₹{acc.nightly_rate?.toLocaleString('en-IN') || '12,000'} / nt</span>
                    </div>
                    <p className="text-charcoal-600">{acc.category} in {acc.city || acc.neighborhood || 'Prime Center'}</p>
                    
                    {/* Guest Reviews Snippet */}
                    <div className="pt-2 border-t border-charcoal-200/60 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 text-charcoal-700">
                        <div className="flex items-center text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-bold ml-1">{acc.rating ? Number(acc.rating).toFixed(1) : '4.9'}</span>
                        </div>
                        <span className="text-charcoal-300">•</span>
                        <span className="text-charcoal-600 italic line-clamp-1">
                          "{acc.review_snippet || 'Exquisite hospitality, serene atmosphere and attentive concierge.'}"
                        </span>
                      </div>
                      <span className="text-forest-800 font-semibold flex-shrink-0 ml-2">Read reviews →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Personal Certified Local Guide */}
            {itinerary.assigned_guide && (
              <div className="bg-white rounded-3xl border border-charcoal-100 p-6 shadow-soft space-y-4">
                <div className="flex items-center justify-between border-b border-charcoal-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-forest-800" />
                    <h3 className="font-serif text-lg font-medium text-charcoal-900">Personal Certified Local Guide</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-sage-100 text-forest-800 border border-sage-200">
                    Verified Guide
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-ivory-50">
                  <img
                    src={itinerary.assigned_guide.photo_url || '/images/guides/guide_1.jpg'}
                    alt={itinerary.assigned_guide.display_name}
                    className="w-16 h-16 rounded-2xl object-cover border border-charcoal-200"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-base font-medium text-charcoal-900">
                        {itinerary.assigned_guide.display_name}
                      </h4>
                      <span className="text-xs font-semibold text-forest-800">
                        ₹{itinerary.assigned_guide.daily_rate.toLocaleString('en-IN')} / day
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-600 line-clamp-2">
                      {itinerary.assigned_guide.bio}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {itinerary.assigned_guide.languages.map((l: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-white text-[10px] font-medium text-charcoal-600 border border-charcoal-200">
                          {l}
                        </span>
                      ))}
                      {itinerary.assigned_guide.specialties.map((s: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-sage-50 text-[10px] font-medium text-forest-800 border border-sage-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Section 3: Day-by-Day Itinerary */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-forest-800 block mb-1">Interactive Schedule</span>
                <h3 className="font-serif text-2xl font-medium text-charcoal-900">Day-by-Day Experiences</h3>
              </div>
              <p className="text-xs text-charcoal-400 italic">Each day can be regenerated independently.</p>
            </div>

            <div className="space-y-4">
              {itinerary.days.map((day) => (
                <ItineraryDayCard
                  key={day.day_number}
                  day={day}
                  destination={destination}
                  travelStyle={travelStyle}
                  onRegenerateDay={handleRegenerateDay}
                  onReplaceActivity={(slot, act) => handleReplaceActivity(day.day_number, slot, act)}
                />
              ))}
            </div>
          </div>

          {/* Section 4: Transparent Budget Breakdown */}
          {itinerary.budget_breakdown && (
            <div className="bg-forest-900 text-ivory-100 rounded-3xl p-8 sm:p-10 shadow-soft-lg space-y-6">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-sage-300 font-bold block mb-1">Financial Transparency</span>
                <h3 className="font-serif text-2xl font-normal text-white">Estimated Comprehensive Budget</h3>
                <p className="text-xs text-ivory-300 font-light mt-1">
                  Transparent breakdown for {travelers} travelers over {days} days in {currency}. No hidden charges.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 border-t border-white/10 text-xs">
                <div>
                  <span className="text-ivory-400 block text-[11px]">Flights</span>
                  <span className="text-base font-semibold text-white mt-1 block">
                    ₹{itinerary.budget_breakdown.flights_total?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-ivory-400 block text-[11px]">Accommodations</span>
                  <span className="text-base font-semibold text-white mt-1 block">
                    ₹{itinerary.budget_breakdown.accommodation_total?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-ivory-400 block text-[11px]">Transit / Transfers</span>
                  <span className="text-base font-semibold text-white mt-1 block">
                    ₹{itinerary.budget_breakdown.transfers_and_transit?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-ivory-400 block text-[11px]">Activities & Tickets</span>
                  <span className="text-base font-semibold text-white mt-1 block">
                    ₹{itinerary.budget_breakdown.activities_and_tickets?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-ivory-400 block text-[11px]">Food & Dining</span>
                  <span className="text-base font-semibold text-white mt-1 block">
                    ₹{itinerary.budget_breakdown.food_and_dining?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-ivory-400 block text-[11px]">Contingency Fund</span>
                  <span className="text-base font-semibold text-white mt-1 block">
                    ₹{itinerary.budget_breakdown.contingency_fund?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-sage-300 block">Grand Total Estimated</span>
                  <span className="text-3xl font-serif font-bold text-white">
                    ₹{itinerary.budget_breakdown.estimated_grand_total?.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSaveTrip}
                    className="px-6 py-3 rounded-full bg-sage-500 hover:bg-sage-600 text-forest-950 font-semibold text-xs shadow-soft transition-all"
                  >
                    Save Itinerary
                  </button>
                  <Link
                    to="/expenses"
                    className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/20 transition-all flex items-center gap-1.5"
                  >
                    <PieChart className="w-3.5 h-3.5 text-sage-300" />
                    <span>Track Expenses</span>
                  </Link>
                  <Link
                    to="/wallet"
                    className="px-5 py-3 rounded-full bg-forest-800 hover:bg-forest-700 text-white font-medium text-xs border border-sage-500/30 transition-all"
                  >
                    Checkout with Wallet
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};


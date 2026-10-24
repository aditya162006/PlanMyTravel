import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Car, Bike, Compass, Search, MapPin, Calendar, Clock, ShieldCheck,
  CheckCircle2, Sparkles, Filter, ChevronRight, X, AlertCircle, Fuel,
  Users, Briefcase, Award, Star, Wallet, ArrowRight, Shield
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { RentalVehicle } from '../types';

export const VehicleRentalsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated, walletBalance, refreshWallet, openAuthModal } = useAuth();

  const [locationInput, setLocationInput] = useState(searchParams.get('location') || 'Bali');
  const [activeCategory, setActiveCategory] = useState<'all' | 'cab' | 'motorbike' | 'scooter'>('all');
  const [sortBy, setSortBy] = useState('rating_desc');
  const [vehicles, setVehicles] = useState<RentalVehicle[]>([]);
  const [popularLocations, setPopularLocations] = useState<Array<{ name: string; country: string; tag: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [selectedVehicle, setSelectedVehicle] = useState<RentalVehicle | null>(null);
  const [rentalDays, setRentalDays] = useState(3);
  const [pickupDate, setPickupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [pickupPoint, setPickupPoint] = useState('');
  const [driverName, setDriverName] = useState(user?.name || '');
  const [driverPhone, setDriverPhone] = useState(user?.phone || '');
  const [payWithWallet, setPayWithWallet] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState<any | null>(null);
  const [bookingError, setBookingError] = useState('');

  const fetchVehicles = async (loc = locationInput, cat = activeCategory, sort = sortBy) => {
    setLoading(true);
    try {
      const res = await api.getRentals({
        location: loc,
        category: cat !== 'all' ? cat : undefined,
        sort,
      });
      if (res?.vehicles) {
        setVehicles(res.vehicles);
      }
    } catch (err) {
      console.error('Failed to load rental vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularLocations = async () => {
    try {
      const res = await api.getRentalLocations();
      if (res?.locations) {
        setPopularLocations(res.locations);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchPopularLocations();
  }, []);

  useEffect(() => {
    fetchVehicles(locationInput, activeCategory, sortBy);
  }, [activeCategory, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ location: locationInput });
    fetchVehicles(locationInput, activeCategory, sortBy);
  };

  const handleQuickLocation = (locName: string) => {
    setLocationInput(locName);
    setSearchParams({ location: locName });
    fetchVehicles(locName, activeCategory, sortBy);
  };

  const handleOpenBooking = (vehicle: RentalVehicle) => {
    setSelectedVehicle(vehicle);
    setPickupPoint(vehicle.pickup_locations[0] || 'Airport Terminal');
    setDriverName(user?.name || '');
    setDriverPhone(user?.phone || '');
    setBookingConfirmation(null);
    setBookingError('');
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;

    setBookingLoading(true);
    setBookingError('');

    try {
      const res = await api.bookRental({
        vehicle_id: selectedVehicle.id,
        days: rentalDays,
        pickup_date: pickupDate,
        pickup_point: pickupPoint,
        driver_name: driverName.trim() || 'Traveler',
        driver_phone: driverPhone.trim(),
        pay_with_wallet: payWithWallet,
      });

      if (res?.confirmation) {
        setBookingConfirmation(res.confirmation);
        if (payWithWallet) {
          await refreshWallet();
        }
      }
    } catch (err: any) {
      setBookingError(err.message || 'Failed to complete vehicle reservation');
    } finally {
      setBookingLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cab':
        return <Car className="w-4 h-4" />;
      case 'motorbike':
        return <Bike className="w-4 h-4" />;
      case 'scooter':
        return <Compass className="w-4 h-4" />;
      default:
        return <Car className="w-4 h-4" />;
    }
  };

  const totalCalculatedRate = selectedVehicle ? selectedVehicle.daily_rate * rentalDays : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* Hero / Header Section */}
      <div className="bg-gradient-to-br from-forest-900 to-forest-950 text-white rounded-3xl p-8 sm:p-12 shadow-soft-lg relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-800 text-sage-300 text-xs font-semibold border border-sage-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Verified Ground Mobility</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-medium text-white leading-tight">
            Cabs, Bikes & Scooter Rentals
          </h1>
          <p className="text-xs sm:text-sm text-ivory-300 font-light leading-relaxed">
            Input your destination to discover transparent daily & hourly rental rates, vehicle specifications, insurance terms, and instant 1-click booking via your Trip Wallet.
          </p>
        </div>

        {/* Search Bar inside Hero */}
        <div className="mt-8 relative z-10 max-w-3xl">
          <form
            onSubmit={handleSearchSubmit}
            className="p-2.5 bg-white rounded-2xl sm:rounded-full shadow-float border border-charcoal-200/80 flex flex-col sm:flex-row items-center gap-2 text-charcoal-900"
          >
            <div className="flex-1 flex items-center gap-3 px-4 py-2 w-full">
              <MapPin className="w-5 h-5 text-forest-800 flex-shrink-0" />
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="Enter city or region (e.g. Bali, Kyoto, Santorini, Swiss Alps, Udaipur, Singapore)..."
                className="w-full text-xs sm:text-sm font-medium text-charcoal-900 placeholder:text-charcoal-400 outline-none bg-transparent"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 rounded-xl sm:rounded-full bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold shadow-soft flex items-center justify-center gap-2 transition-all flex-shrink-0"
            >
              <Search className="w-4 h-4 text-sage-300" />
              <span>Find Rates</span>
            </button>
          </form>

          {/* Quick Location Chips */}
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] text-ivory-300">
            <span className="font-semibold text-sage-300 flex-shrink-0">Popular:</span>
            {popularLocations.map((loc) => (
              <button
                key={loc.name}
                type="button"
                onClick={() => handleQuickLocation(loc.name)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-all border ${
                  locationInput.toLowerCase() === loc.name.toLowerCase()
                    ? 'bg-sage-400 text-forest-950 font-bold border-sage-300'
                    : 'bg-white/10 text-white hover:bg-white/20 border-white/15'
                }`}
              >
                {loc.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter and Category Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-charcoal-100 shadow-soft-sm">
        
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Mobility', icon: <Compass className="w-3.5 h-3.5" /> },
            { id: 'cab', label: 'Cabs & Chauffeur Cars', icon: <Car className="w-3.5 h-3.5" /> },
            { id: 'motorbike', label: 'Motorbikes', icon: <Bike className="w-3.5 h-3.5" /> },
            { id: 'scooter', label: 'Scooters & E-Bikes', icon: <Compass className="w-3.5 h-3.5" /> },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-charcoal-900 text-white shadow-soft-sm'
                  : 'bg-ivory-100 text-charcoal-700 hover:text-charcoal-900 hover:bg-ivory-200/80 border border-charcoal-200/50'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-charcoal-400 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-ivory-50 border border-charcoal-200 text-charcoal-800 outline-none cursor-pointer"
          >
            <option value="rating_desc">Highest Rated</option>
            <option value="price_asc">Rate: Low to High</option>
            <option value="price_desc">Rate: High to Low</option>
            <option value="name_asc">Alphabetical</option>
          </select>
        </div>

      </div>

      {/* Vehicle Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[4/3] rounded-3xl bg-ivory-200 animate-pulse"></div>
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-charcoal-100 p-8 space-y-4 max-w-lg mx-auto shadow-soft-sm">
          <div className="w-12 h-12 rounded-full bg-ivory-100 text-charcoal-400 flex items-center justify-center mx-auto">
            <Car className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="font-serif text-xl font-medium text-charcoal-900">
            No rental vehicles found in "{locationInput}"
          </h3>
          <p className="text-xs text-charcoal-500 font-light">
            Try searching for another destination like Bali, Kyoto, Santorini, Swiss Alps, or Udaipur.
          </p>
          <button
            onClick={() => handleQuickLocation('Bali')}
            className="px-5 py-2.5 rounded-full bg-forest-800 text-white text-xs font-medium hover:bg-forest-900 transition-colors shadow-soft"
          >
            Browse Bali Rentals
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="group bg-white rounded-3xl border border-charcoal-100 overflow-hidden shadow-soft-sm hover:shadow-soft-lg hover:border-sage-200 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Photo & Category Pill */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-ivory-200">
                  <img
                    src={v.image_url}
                    alt={v.name}
                    loading="lazy"
                    className="w-full h-full object-cover transform transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 backdrop-blur-md text-charcoal-900 shadow-soft-sm">
                      {getCategoryIcon(v.category)}
                      <span>{v.category === 'cab' ? (v.has_chauffeur ? 'Chauffeur Cab' : 'Rental Car') : v.category}</span>
                    </span>
                  </div>

                  <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-xs font-semibold text-charcoal-900 shadow-soft-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{v.rating.toFixed(2)}</span>
                    <span className="text-[10px] text-charcoal-400 font-normal">({v.review_count})</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-charcoal-400 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-sage-600" />
                      <span>{v.city}, {v.country}</span>
                    </div>
                    <h3 className="font-serif text-xl font-medium text-charcoal-900 group-hover:text-forest-800 transition-colors">
                      {v.name}
                    </h3>
                    <p className="text-[11px] text-charcoal-500 font-light mt-0.5">
                      Provided by <span className="font-semibold text-charcoal-700">{v.supplier}</span>
                    </p>
                  </div>

                  {/* Rates Breakdown */}
                  <div className="p-3.5 rounded-2xl bg-ivory-50 border border-charcoal-100/80 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-charcoal-400 block font-medium">Daily</span>
                      <span className="text-sm font-bold text-forest-800">
                        ₹{v.daily_rate.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="border-x border-charcoal-200/60">
                      <span className="text-[10px] uppercase tracking-wider text-charcoal-400 block font-medium">Hourly</span>
                      <span className="text-sm font-semibold text-charcoal-800">
                        ₹{v.hourly_rate.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-charcoal-400 block font-medium">Deposit</span>
                      <span className="text-sm font-semibold text-charcoal-800">
                        {v.security_deposit > 0 ? `₹${v.security_deposit.toLocaleString('en-IN')}` : '₹0 Free'}
                      </span>
                    </div>
                  </div>

                  {/* Vehicle Specs Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-charcoal-600">
                    <div className="flex items-center gap-2">
                      <Fuel className="w-3.5 h-3.5 text-sage-600 flex-shrink-0" />
                      <span className="truncate">{v.engine_capacity} • {v.fuel_type.split(' ')[0]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-sage-600 flex-shrink-0" />
                      <span>{v.seats} Passenger{v.seats > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-sage-600 flex-shrink-0" />
                      <span>{v.transmission}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-sage-600 flex-shrink-0" />
                      <span className="truncate">{v.mileage}</span>
                    </div>
                  </div>

                  {/* Inclusions Highlights */}
                  <div className="space-y-1.5 pt-2 border-t border-charcoal-100/70">
                    <span className="text-[10px] uppercase tracking-widest text-charcoal-400 font-bold block">
                      Included with Rental
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {v.inclusions.slice(0, 3).map((inc, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sage-50 text-[10px] text-forest-900 font-medium border border-sage-200/50"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 flex-shrink-0" />
                          <span>{inc}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Requirements & License */}
                  <div className="p-2.5 rounded-xl bg-ivory-100/70 text-[11px] text-charcoal-600 space-y-0.5">
                    <span className="font-semibold text-charcoal-800">Requirements:</span> {v.requirements.license} (Min age: {v.requirements.min_age} yrs).
                  </div>

                </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 pt-0 border-t border-charcoal-100/70 pt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-charcoal-400 block font-medium">Starting from</span>
                  <span className="text-lg font-bold text-charcoal-900">
                    ₹{v.daily_rate.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-charcoal-400"> / day</span>
                </div>

                <button
                  onClick={() => handleOpenBooking(v)}
                  className="px-5 py-2.5 rounded-full bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold shadow-soft transition-all flex items-center gap-1.5"
                >
                  <span>Rent Now</span>
                  <ArrowRight className="w-3.5 h-3.5 text-sage-300" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Booking / Reservation Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-float border border-charcoal-100 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedVehicle(null)}
              className="absolute top-6 right-6 p-2 rounded-full text-charcoal-400 hover:text-charcoal-800 hover:bg-ivory-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {!bookingConfirmation ? (
              <>
                {/* Modal Title */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-forest-800 mb-1 block">
                    Mobility Reservation
                  </span>
                  <h2 className="font-serif text-2xl font-medium text-charcoal-900">
                    Reserve {selectedVehicle.name}
                  </h2>
                  <p className="text-xs text-charcoal-500 mt-1 font-light">
                    {selectedVehicle.category.toUpperCase()} • {selectedVehicle.location}, {selectedVehicle.country}
                  </p>
                </div>

                {/* Selected Vehicle Snippet */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-ivory-50 border border-charcoal-100">
                  <img
                    src={selectedVehicle.image_url}
                    alt={selectedVehicle.name}
                    className="w-16 h-12 rounded-xl object-cover"
                  />
                  <div className="flex-1 text-xs">
                    <span className="font-semibold text-charcoal-900 block">{selectedVehicle.name}</span>
                    <span className="text-charcoal-500">{selectedVehicle.transmission} • {selectedVehicle.fuel_type}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-forest-800 block text-sm">₹{selectedVehicle.daily_rate.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-charcoal-400">/ day</span>
                  </div>
                </div>

                {bookingError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                {/* Form Inputs */}
                <form onSubmit={handleConfirmBooking} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600 mb-1">
                        Rental Days
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={rentalDays}
                        onChange={(e) => setRentalDays(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-charcoal-200 outline-none focus:border-forest-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600 mb-1">
                        Pickup Date
                      </label>
                      <input
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-charcoal-200 outline-none focus:border-forest-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600 mb-1">
                      Pickup & Return Location
                    </label>
                    <select
                      value={pickupPoint}
                      onChange={(e) => setPickupPoint(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 outline-none focus:border-forest-800 bg-white"
                    >
                      {selectedVehicle.pickup_locations.map((p, i) => (
                        <option key={i} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600 mb-1">
                        Driver Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Driver Name"
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 outline-none focus:border-forest-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={driverPhone}
                        onChange={(e) => setDriverPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 outline-none focus:border-forest-800"
                      />
                    </div>
                  </div>

                  {/* Total Quote & Settlement Method */}
                  <div className="p-4 rounded-2xl bg-forest-900 text-white space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-sage-300">Total Rental Quote ({rentalDays} Days)</span>
                      <span className="text-xl font-bold font-serif text-white">
                        ₹{totalCalculatedRate.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {selectedVehicle.security_deposit > 0 && (
                      <div className="flex justify-between text-[11px] text-sage-300/90 pt-1 border-t border-forest-800">
                        <span>Refundable Security Deposit</span>
                        <span>₹{selectedVehicle.security_deposit.toLocaleString('en-IN')} (Card hold on pickup)</span>
                      </div>
                    )}

                    {/* Pay with Trip Wallet Option */}
                    <div className="pt-2 border-t border-forest-800">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-sage-300" />
                          <div>
                            <span className="text-xs font-semibold block">Pay with Trip Wallet</span>
                            <span className="text-[10px] text-sage-300">
                              Available Balance: ₹{(walletBalance || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={payWithWallet}
                          onChange={(e) => setPayWithWallet(e.target.checked)}
                          className="w-4 h-4 accent-forest-700 cursor-pointer"
                        />
                      </label>

                      {payWithWallet && totalCalculatedRate > (walletBalance || 0) && (
                        <p className="text-[11px] text-amber-300 pt-1">
                          ⚠️ Wallet balance is less than total amount. Top up or uncheck to reserve and pay upon pickup.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedVehicle(null)}
                      className="flex-1 py-3 rounded-xl border border-charcoal-200 text-charcoal-700 text-xs font-medium hover:bg-ivory-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="flex-1 py-3 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold shadow-soft transition-all"
                    >
                      {bookingLoading ? 'Reserving...' : payWithWallet ? 'Pay & Confirm Booking' : 'Reserve (Pay on Pickup)'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Booking Success Confirmation Voucher */
              <div className="space-y-5 text-center py-2">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-soft">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800 block">
                    Confirmed Reservation
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-charcoal-900">
                    Rental Voucher Issued
                  </h3>
                  <p className="text-xs text-charcoal-500 font-light mt-1">
                    Your vehicle has been secured with the fleet operator.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-ivory-50 border border-charcoal-200 text-left space-y-2 text-xs">
                  <div className="flex justify-between border-b border-charcoal-200/60 pb-2">
                    <span className="text-charcoal-500">Booking Reference</span>
                    <span className="font-mono font-bold text-forest-900 text-sm">{bookingConfirmation.booking_reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Vehicle</span>
                    <span className="font-semibold text-charcoal-900">{bookingConfirmation.vehicle.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Duration</span>
                    <span>{bookingConfirmation.days} Days (Starts {bookingConfirmation.pickup_date})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Pickup Point</span>
                    <span className="font-medium text-charcoal-800">{bookingConfirmation.pickup_point}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Total Charged</span>
                    <span className="font-bold text-forest-800">
                      ₹{bookingConfirmation.total_amount.toLocaleString('en-IN')} {bookingConfirmation.paid_with_wallet ? '(Paid via Wallet)' : '(Pay on Pickup)'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-sage-50 text-[11px] text-forest-900 border border-sage-200 text-left">
                  {bookingConfirmation.instructions}
                </div>

                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="w-full py-3 rounded-full bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold shadow-soft transition-all"
                >
                  Close & Done
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

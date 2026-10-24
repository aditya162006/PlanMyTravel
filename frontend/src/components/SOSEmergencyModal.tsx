import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, Radio, Phone, ShieldAlert, CheckCircle2,
  X, MapPin, Navigation, Clock, User, HeartPulse, Flame, Car,
  Shield, ExternalLink, RefreshCw
} from 'lucide-react';
import { api } from '../api/client';
import { Trip, SOSAuthority, SOSIncident } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  trips?: Trip[];
  defaultTrip?: Trip | null;
}

export const SOSEmergencyModal: React.FC<Props> = ({
  isOpen,
  onClose,
  trips = [],
  defaultTrip = null,
}) => {
  const [selectedDestination, setSelectedDestination] = useState<string>(
    defaultTrip?.destination?.name || defaultTrip?.title || 'Singapore'
  );
  const [emergencyType, setEmergencyType] = useState('Medical & Ambulance');
  const [locationText, setLocationText] = useState(
    defaultTrip?.destination?.name ? `Near ${defaultTrip.destination.name} central area` : 'Current Itinerary Hotel / Location'
  );
  const [notes, setNotes] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');

  const [authority, setAuthority] = useState<SOSAuthority | null>(null);
  const [loadingAuthority, setLoadingAuthority] = useState(false);

  const [sending, setSending] = useState(false);
  const [activeIncident, setActiveIncident] = useState<SOSIncident | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [sosError, setSosError] = useState('');

  // Update destination if defaultTrip changes
  useEffect(() => {
    if (defaultTrip) {
      const dest = defaultTrip.destination?.name || defaultTrip.title || 'Singapore';
      setSelectedDestination(dest);
      setLocationText(`Near ${dest} itinerary destination`);
    }
  }, [defaultTrip]);

  // Fetch local authority contacts whenever destination changes
  useEffect(() => {
    if (!isOpen) return;

    const fetchContacts = async () => {
      setLoadingAuthority(true);
      try {
        const res = await api.getSOSContacts(selectedDestination);
        if (res?.authority) {
          setAuthority(res.authority);
        }
      } catch (err) {
        console.error('Failed to load emergency contacts:', err);
      } finally {
        setLoadingAuthority(false);
      }
    };

    fetchContacts();
  }, [isOpen, selectedDestination]);

  // Attempt to grab GPS coordinates if browser allows
  useEffect(() => {
    if (isOpen && navigator.geolocation && !locationText.includes('°')) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = `${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`;
          setLocationText((prev) => `${prev} (${coords})`);
        },
        () => {
          // Geolocation denied or unavailable - keep fallback
        },
        { timeout: 5000 }
      );
    }
  }, [isOpen]);

  const handleSendSOS = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSosError('');

    try {
      const res = await api.triggerSOS({
        destination: selectedDestination,
        trip_id: defaultTrip?.id,
        emergency_type: emergencyType,
        location_text: locationText,
        notes: notes.trim(),
        user_name: userName.trim() || undefined,
        user_phone: userPhone.trim() || undefined,
      });

      if (res?.incident) {
        setActiveIncident(res.incident);
      }
    } catch (err: any) {
      setSosError(err.message || 'Failed to broadcast SOS. Please call emergency services directly.');
    } finally {
      setSending(false);
    }
  };

  const handleStandDown = async () => {
    if (!activeIncident) return;
    if (!window.confirm('Are you sure you want to stand down this SOS alert? Only confirm if you are completely safe.')) return;

    setCancelling(true);
    try {
      const res = await api.cancelSOS(activeIncident.incident_id, 'Traveler confirmed safe.');
      if (res?.incident) {
        setActiveIncident(null);
        onClose();
      }
    } catch (err: any) {
      alert(`Stand down notice: ${err.message}`);
    } finally {
      setCancelling(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-charcoal-900/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-float border-2 border-rose-600/30 overflow-hidden flex flex-col max-h-[92vh]">

        {/* Emergency Beacon Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white text-rose-700 flex items-center justify-center flex-shrink-0 shadow-soft animate-pulse">
              <Radio className="w-5 h-5 text-rose-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold tracking-tight">Emergency SOS Dispatch</h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-rose-900 text-white tracking-widest animate-pulse">
                  PRIORITY 1
                </span>
              </div>
              <p className="text-[11px] text-rose-100 font-light">
                Direct alert broadcast to destination first responders & local authorities
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-rose-100 hover:text-white hover:bg-rose-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-[#FAF9F6]">

          {!activeIncident ? (
            <>
              {/* Destination & Quick Emergency Numbers Bar */}
              <div className="p-4 rounded-2xl bg-white border border-charcoal-200/80 shadow-soft-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-charcoal-100 pb-2">
                  <div className="flex items-center gap-1.5 text-xs text-charcoal-600 font-semibold">
                    <MapPin className="w-4 h-4 text-rose-600" />
                    <span>Emergency Location:</span>
                  </div>

                  {/* Destination dropdown */}
                  <select
                    value={selectedDestination}
                    onChange={(e) => setSelectedDestination(e.target.value)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-charcoal-200 outline-none focus:border-rose-600 bg-ivory-50 text-charcoal-900 cursor-pointer"
                  >
                    {trips.length > 0 ? (
                      trips.map((t) => (
                        <option key={t.id} value={t.destination?.name || t.title}>
                          {t.title} ({t.destination?.name || 'Itinerary'})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Singapore">Singapore</option>
                        <option value="Bali">Bali, Indonesia</option>
                        <option value="Kyoto">Kyoto, Japan</option>
                        <option value="Santorini">Santorini, Greece</option>
                        <option value="Amalfi Coast">Amalfi Coast, Italy</option>
                        <option value="Swiss Alps">Swiss Alps, Switzerland</option>
                        <option value="Reykjavik">Reykjavik, Iceland</option>
                        <option value="Udaipur & Rajasthan">Udaipur, India</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Local Authority Info */}
                {authority && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-charcoal-900">{authority.authority_name}</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                        Avg Arrival: {authority.response_time_sla}
                      </span>
                    </div>

                    {/* Direct Dial Helplines */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-center">
                      <a
                        href={`tel:${authority.police}`}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-soft-sm"
                      >
                        <Phone className="w-3.5 h-3.5 text-rose-600" />
                        <span>Police ({authority.police})</span>
                      </a>
                      <a
                        href={`tel:${authority.ambulance}`}
                        className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-soft-sm"
                      >
                        <HeartPulse className="w-3.5 h-3.5 text-amber-600" />
                        <span>Medical ({authority.ambulance})</span>
                      </a>
                      <a
                        href={`tel:${authority.tourist_police}`}
                        className="col-span-2 sm:col-span-1 p-2 rounded-xl bg-sage-50 hover:bg-sage-100 text-forest-900 border border-sage-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-soft-sm truncate"
                      >
                        <Shield className="w-3.5 h-3.5 text-forest-700" />
                        <span>Tourist Police</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {sosError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{sosError}</span>
                </div>
              )}

              {/* SOS Alert Form */}
              <form onSubmit={handleSendSOS} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                    Emergency Category
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { id: 'Medical & Ambulance', label: '🚑 Medical / Injury', color: 'border-rose-400 bg-rose-50/50' },
                      { id: 'Police & Security', label: '🚨 Threat / Security', color: 'border-rose-400 bg-rose-50/50' },
                      { id: 'Accident & Vehicle', label: '💥 Road Accident', color: 'border-amber-400 bg-amber-50/50' },
                      { id: 'Lost / Evacuation', label: '🧭 Lost / Evacuate', color: 'border-sage-400 bg-sage-50/50' },
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setEmergencyType(type.id)}
                        className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                          emergencyType === type.id
                            ? 'border-rose-600 bg-rose-600 text-white shadow-soft'
                            : 'border-charcoal-200 bg-white text-charcoal-700 hover:border-charcoal-400'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1">
                    Your Location / Landmark Details
                  </label>
                  <div className="relative">
                    <Navigation className="w-4 h-4 absolute left-3.5 top-3 text-rose-600" />
                    <input
                      type="text"
                      required
                      value={locationText}
                      onChange={(e) => setLocationText(e.target.value)}
                      placeholder="e.g. Hotel Lobby, Street Corner, Beach Pier..."
                      className="w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-xl border border-charcoal-200 outline-none focus:border-rose-600 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-600 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 outline-none focus:border-rose-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-600 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 / International"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 outline-none focus:border-rose-600 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-600 mb-1">
                    Situation Details / Distress Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Briefly describe what happened (e.g. need ambulance for broken ankle on hiking path)..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 outline-none focus:border-rose-600 bg-white"
                  />
                </div>

                {/* Big Red SOS Action Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 hover:from-rose-800 hover:to-rose-800 text-white font-serif font-bold text-base shadow-soft-lg transition-all flex items-center justify-center gap-3 border border-rose-500 animate-pulse"
                  >
                    <Radio className="w-5 h-5 text-white animate-spin" />
                    <span>{sending ? 'BROADCASTING SOS ALERT...' : 'TRANSMIT SOS ALERT TO LOCAL AUTHORITIES'}</span>
                  </button>
                  <p className="text-[10px] text-charcoal-400 text-center mt-2 italic">
                    Pressing this button logs an active distress incident and notifies local emergency dispatchers.
                  </p>
                </div>
              </form>
            </>
          ) : (
            /* ACTIVE ALERT BROADCAST STATE */
            <div className="space-y-5 text-center py-2 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-rose-600 text-white flex items-center justify-center mx-auto shadow-soft-lg animate-pulse">
                <Radio className="w-9 h-9" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 tracking-wider">
                  DISPATCH ACTIVE — RESPONDERS NOTIFIED
                </span>
                <h3 className="font-serif text-2xl font-bold text-charcoal-900 mt-2">
                  SOS Alert Broadcasted
                </h3>
                <p className="text-xs text-charcoal-500 font-light mt-1">
                  Incident ID: <span className="font-mono font-bold text-rose-700">{activeIncident.incident_id}</span>
                </p>
              </div>

              {/* Authority & Response Details */}
              <div className="p-4 rounded-2xl bg-white border-2 border-rose-500/40 text-left space-y-3 shadow-soft-sm text-xs">
                <div className="flex items-center justify-between border-b border-charcoal-100 pb-2">
                  <span className="text-charcoal-500">Responding Agency:</span>
                  <span className="font-bold text-charcoal-900">{activeIncident.authority.authority_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-500">Destination Command:</span>
                  <span>{activeIncident.authority.dispatch_center}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-500">Estimated Response Window:</span>
                  <span className="font-bold text-rose-700">{activeIncident.estimated_arrival}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-500">Broadcasted Coordinates:</span>
                  <span className="font-mono text-charcoal-700">{activeIncident.user_location}</span>
                </div>
              </div>

              {/* Direct Call Helplines */}
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-left space-y-2">
                <span className="text-xs font-bold text-rose-900 block">
                  Direct Immediate Emergency Hotlines:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <a
                    href={`tel:${activeIncident.authority.police}`}
                    className="p-2.5 rounded-xl bg-white hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold flex items-center justify-center gap-1.5 shadow-soft-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Police: {activeIncident.authority.police}</span>
                  </a>
                  <a
                    href={`tel:${activeIncident.authority.ambulance}`}
                    className="p-2.5 rounded-xl bg-white hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold flex items-center justify-center gap-1.5 shadow-soft-sm"
                  >
                    <HeartPulse className="w-3.5 h-3.5" />
                    <span>Medical: {activeIncident.authority.ambulance}</span>
                  </a>
                </div>
              </div>

              {/* Safety Instructions */}
              <div className="p-4 rounded-2xl bg-white border border-charcoal-200 text-left space-y-2 text-xs">
                <span className="font-semibold text-charcoal-800 block">Immediate Safety Protocol:</span>
                <ul className="list-disc pl-4 space-y-1 text-charcoal-600 font-light">
                  {activeIncident.authority.safety_instructions.map((ins, i) => (
                    <li key={i}>{ins}</li>
                  ))}
                </ul>
              </div>

              {/* Stand Down / Cancel Action */}
              <div className="pt-2">
                <button
                  onClick={handleStandDown}
                  disabled={cancelling}
                  className="w-full py-3 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs font-semibold shadow-soft transition-all"
                >
                  {cancelling ? 'Updating Authorities...' : 'I Am Safe — Stand Down SOS Alert'}
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};


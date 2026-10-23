import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-ivory-100 border-t border-charcoal-100/80 pt-16 pb-12 mt-20 text-charcoal-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-charcoal-100/80">

          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-forest-800 text-ivory-100 flex items-center justify-center">
                <Compass className="w-4 h-4 text-sage-300 stroke-[1.8]" />
              </div>
              <span className="font-serif text-lg tracking-tight font-medium text-charcoal-900">
                PlanMyTravel
              </span>
            </Link>
            <p className="text-xs text-charcoal-500 leading-relaxed max-w-sm">
              An intelligent, minimalist travel discovery platform turning wanderlust into structured, visual journeys powered by AI.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage-50 text-[11px] font-medium text-forest-800 border border-sage-200/40">
              <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse"></span>
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Col 2: Discovery */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-charcoal-900 uppercase tracking-widest">Discovery</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/explore?category=weekend" className="text-charcoal-600 hover:text-charcoal-900 transition-colors">
                  Weekend Escapes
                </Link>
              </li>
              <li>
                <Link to="/explore?category=nature" className="text-charcoal-600 hover:text-charcoal-900 transition-colors">
                  Nature & Glacial Retreats
                </Link>
              </li>
              <li>
                <Link to="/explore?category=coastal" className="text-charcoal-600 hover:text-charcoal-900 transition-colors">
                  Coastal Sanctuaries
                </Link>
              </li>
              <li>
                <Link to="/explore?category=cultural" className="text-charcoal-600 hover:text-charcoal-900 transition-colors">
                  Cultural Heritage Gems
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Concierge & Stays */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-charcoal-900 uppercase tracking-widest">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/concierge" className="text-charcoal-600 hover:text-charcoal-900 transition-colors">
                  AI Travel Concierge
                </Link>
              </li>
              <li>
                <Link to="/stays" className="text-charcoal-600 hover:text-charcoal-900 transition-colors">
                  Boutique Accommodations
                </Link>
              </li>
              <li>
                <Link to="/wallet" className="text-charcoal-600 hover:text-charcoal-900 transition-colors">
                  Trip Wallet & Payments
                </Link>
              </li>
              <li>
                <Link to="/expenses" className="text-charcoal-600 hover:text-charcoal-900 transition-colors">
                  Journey Expense Tracker
                </Link>
              </li>
              <li>
                <Link to="/become-a-guide" className="text-charcoal-600 hover:text-charcoal-900 transition-colors">
                  Become a Local Guide
                </Link>
              </li>
              <li>
                <Link to="/trips" className="text-charcoal-600 hover:text-charcoal-900 transition-colors">
                  Saved Itineraries
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Transparency */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-charcoal-900 uppercase tracking-widest">Integrity</h4>
            <div className="text-xs text-charcoal-500 space-y-2">
              <p className="flex items-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
                <span>Verified Hotelbeds provider test environment integration & authentic live route estimates.</span>
              </p>
              <p>
                Trip Wallet utilizes Razorpay test sandbox checkout. Prices indicated include applicable currency estimates.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-charcoal-400 gap-4">
          <p>© {new Date().getFullYear()} PlanMyTravel Inc. All rights reserved. Original identity.</p>
          <div className="flex items-center gap-6">
            <span>Designed for thoughtful travelers</span>
            <span>•</span>
            <Link to="/admin" className="hover:text-charcoal-700 transition-colors">
              Staff Portal
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};


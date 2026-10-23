import React from 'react';
import { Star, ShieldCheck, Check } from 'lucide-react';
import { Stay } from '../types';

interface Props {
  stay: Stay;
  onSelect?: (stay: Stay) => void;
}

export const StayCard: React.FC<Props> = ({ stay, onSelect }) => {
  return (
    <div className="group bg-white rounded-3xl border border-charcoal-100/90 overflow-hidden shadow-soft-sm hover:shadow-soft-lg hover:border-sage-200 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Photo Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-ivory-200">
          <img
            src={stay.cover_image_url}
            alt={stay.name}
            loading="lazy"
            className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Source/Environment badge */}
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/90 backdrop-blur-md text-charcoal-800 shadow-soft-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-sage-600" />
              <span>{stay.source.includes('Hotelbeds') ? 'Hotelbeds Verified' : 'Curated Stay'}</span>
            </span>
          </div>

          {/* Rating */}
          <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-semibold text-charcoal-900 shadow-soft-sm">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{stay.rating ? stay.rating.toFixed(1) : '4.9'}</span>
            <span className="text-[10px] text-charcoal-400 font-normal">({stay.review_count || 48})</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-center justify-between text-xs text-charcoal-400 font-medium mb-1">
            <span>{stay.category}</span>
            <span>{stay.city}</span>
          </div>

          <h3 className="font-serif text-lg font-medium text-charcoal-900 group-hover:text-forest-800 transition-colors line-clamp-1">
            {stay.name}
          </h3>

          <p className="mt-1 text-xs text-charcoal-500 line-clamp-2 leading-relaxed">
            {stay.description}
          </p>

          {/* Amenities Pills */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {stay.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-ivory-100 text-[10px] text-charcoal-600 font-medium"
              >
                <Check className="w-2.5 h-2.5 text-sage-600" />
                <span>{amenity}</span>
              </span>
            ))}
          </div>

          {/* Traveler Review Highlight */}
          <div className="mt-3 pt-2.5 border-t border-charcoal-100 flex items-center gap-1.5 text-[11px] text-charcoal-600">
            <span className="font-semibold text-forest-800">"Exceptional stay"</span>
            <span className="text-charcoal-300">•</span>
            <span className="text-charcoal-500 italic truncate">Clean suites & stunning views</span>
          </div>
        </div>
      </div>

      {/* Pricing & CTA */}
      <div className="p-5 pt-0 mt-2 flex items-center justify-between border-t border-charcoal-100/70 pt-4">
        <div>
          <span className="text-base font-bold text-charcoal-900">
            ₹{stay.nightly_rate.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-charcoal-400 font-normal"> / night</span>
        </div>

        <button
          onClick={() => onSelect && onSelect(stay)}
          className="px-4 py-2 rounded-xl bg-charcoal-900 hover:bg-forest-800 text-ivory-50 text-xs font-medium transition-colors shadow-soft-sm"
        >
          View Details & Reviews
        </button>
      </div>
    </div>
  );
};


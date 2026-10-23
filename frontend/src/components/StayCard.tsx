import React, { useState } from 'react';
import { Star, Heart } from 'lucide-react';
import { Stay } from '../types';

interface Props {
  stay: Stay;
  onSelect?: (stay: Stay) => void;
  isGuestFavorite?: boolean;
}

export const StayCard: React.FC<Props> = ({ stay, onSelect, isGuestFavorite = true }) => {
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <div
      onClick={() => onSelect && onSelect(stay)}
      className="group cursor-pointer flex flex-col transition-all duration-200"
    >
      {/* Photo Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#F2F2F2] shadow-sm group-hover:shadow-md transition-shadow">
        <img
          src={stay.cover_image_url}
          alt={stay.name}
          loading="lazy"
          className="w-full h-full object-cover object-center transform transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* "Guest favourite" badge on top left */}
        {(isGuestFavorite || stay.rating >= 4.8) && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-white/95 backdrop-blur-sm text-[#222222] shadow-sm border border-[#DDDDDD]/40">
              Guest favourite
            </span>
          </div>
        )}

        {/* Heart Favorite Button on top right */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorited(!isFavorited);
          }}
          className="absolute top-3 right-3 p-2 rounded-full hover:scale-110 active:scale-90 transition-transform cursor-pointer"
          title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart
            className={`w-5 h-5 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] ${
              isFavorited
                ? 'fill-[#FF385C] text-[#FF385C]'
                : 'fill-black/30 text-white stroke-[2]'
            }`}
          />
        </button>
      </div>

      {/* Property Details underneath image */}
      <div className="pt-3 text-left">
        {/* Line 1: Location & Star Rating */}
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-[#222222] truncate max-w-[200px]">
            {stay.city || stay.country}
          </h4>
          <div className="flex items-center gap-1 text-xs font-semibold text-[#222222]">
            <Star className="w-3.5 h-3.5 fill-[#222222] text-[#222222]" />
            <span>{stay.rating ? stay.rating.toFixed(2) : '4.92'}</span>
          </div>
        </div>

        {/* Line 2: Name & Category */}
        <p className="text-xs text-[#717171] truncate mt-0.5 font-light">
          {stay.name}
        </p>

        {/* Line 3: Dates / Category */}
        <p className="text-xs text-[#717171] mt-0.5 font-light">
          {stay.category || 'Curated luxury stay'}
        </p>

        {/* Line 4: Price per night */}
        <div className="mt-1 flex items-baseline gap-1">
          <span className="font-bold text-sm text-[#222222]">
            ₹{stay.nightly_rate.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-[#222222] font-normal">night</span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Star } from 'lucide-react';
import { formatRating } from '../../utils/formatters';

export interface RatingBadgeProps {
  rating: number;
  reviewCount?: number;
  showCount?: boolean;
}

export function RatingBadge({
  rating,
  reviewCount,
  showCount = true,
}: RatingBadgeProps) {
  const isExcellent = rating >= 4.5;
  const color = isExcellent ? '#22C55E' : '#94A3B8';

  return (
    <div className="inline-flex items-center gap-1">
      <Star size={16} fill={color} stroke={color} />
      <span className="text-sm" style={{ color }}>
        {formatRating(rating)}
      </span>
      {showCount && reviewCount !== undefined && (
        <span className="text-sm text-[#64748B]">({reviewCount})</span>
      )}
    </div>
  );
}

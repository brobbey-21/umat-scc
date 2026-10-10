import React, { useState } from 'react';
import { Denomination } from '../types';

interface FellowshipLogoProps {
  denomination: Denomination;
  size?: 'sm' | 'md' | 'lg';
  showRing?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { container: 'w-8 h-8', text: 'text-[10px]', ring: 'ring-1' },
  md: { container: 'w-12 h-12', text: 'text-sm', ring: 'ring-2' },
  lg: { container: 'w-16 h-16', text: 'text-lg', ring: 'ring-2' },
};

export const FellowshipLogo: React.FC<FellowshipLogoProps> = ({
  denomination,
  size = 'md',
  showRing = true,
  className = ''
}) => {
  const s = sizeMap[size];
  const { color, accent, logoText, shortCode, logoImage } = denomination;
  const [imgError, setImgError] = useState(false);

  // If there's a logo image and it hasn't failed, show the image
  if (logoImage && !imgError) {
    return (
      <div
        className={`${s.container} rounded-full overflow-hidden flex items-center justify-center shrink-0 shadow-sm select-none bg-white ${showRing ? `${s.ring} ring-white/40` : ''} ${className}`}
        title={shortCode}
        style={{ border: `2px solid ${color}` }}
      >
        <img
          src={logoImage}
          alt={shortCode}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Fallback: gradient letter badge
  return (
    <div
      className={`${s.container} rounded-full flex items-center justify-center shrink-0 shadow-sm select-none ${showRing ? `${s.ring} ring-white/40` : ''} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${color} 0%, ${accent} 100%)`,
      }}
      title={shortCode}
    >
      <span
        className={`${s.text} font-bold text-white tracking-tight leading-none`}
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.25)' }}
      >
        {logoText}
      </span>
    </div>
  );
};

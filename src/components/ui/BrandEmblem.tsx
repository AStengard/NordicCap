import React from 'react';

export function BrandEmblem({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-label="NordicCap Emblem">
      <rect x="2" y="2" width="60" height="60" rx="14" fill="#15233E" />
      <rect x="2.75" y="2.75" width="58.5" height="58.5" rx="13.25" stroke="#8C6D46" strokeOpacity="0.45" strokeWidth="1.5" />
      <rect x="15" y="37" width="8" height="14" rx="1.5" fill="#F6F4EF" fillOpacity="0.45" />
      <rect x="28" y="26" width="8" height="25" rx="1.5" fill="#F6F4EF" fillOpacity="0.82" />
      <rect x="41" y="14" width="8" height="37" rx="1.5" fill="#8C6D46" />
      <line x1="13" y1="53" x2="51" y2="53" stroke="#F6F4EF" strokeOpacity="0.35" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

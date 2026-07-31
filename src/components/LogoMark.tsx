import React from 'react';

export const LogoMark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
    {/* dependency graph rising from the book */}
    <g stroke="#3B7CB8" strokeWidth="1.6" opacity="0.9">
      <line x1="24" y1="20" x2="15" y2="9" />
      <line x1="24" y1="20" x2="33" y2="8" />
      <line x1="15" y1="9" x2="33" y2="8" />
      <line x1="15" y1="9" x2="24" y2="4" />
      <line x1="33" y1="8" x2="24" y2="4" />
    </g>
    <circle cx="24" cy="4" r="2.4" fill="#3B7CB8" />
    <circle cx="15" cy="9" r="2.4" fill="#3B7CB8" />
    <circle cx="33" cy="8" r="2.4" fill="#3B7CB8" />
    <circle cx="24" cy="20" r="2.8" fill="#0B2D4D" />
    {/* open book */}
    <path
      d="M6 30c6-2.6 12-2.6 18 0 6-2.6 12-2.6 18 0v12c-6-2.6-12-2.6-18 0-6 2.6-12 2.6-18 0V30z"
      fill="#0B2D4D"
    />
    <path
      d="M24 30v12"
      stroke="#ffffff"
      strokeWidth="1.6"
      opacity="0.85"
    />
    <path
      d="M10 33.5c4-1.4 8-1.5 11 0M10 37.5c4-1.4 8-1.5 11 0M27 33.5c3-1.5 7-1.4 11 0M27 37.5c3-1.5 7-1.4 11 0"
      stroke="#7FB2DE"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

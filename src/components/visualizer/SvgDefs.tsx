import React from 'react';

export const SvgDefs = () => (
  <defs>
    <linearGradient id="metal-sheen-vert" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#18181b" stopOpacity="0.8"/>
        <stop offset="30%" stopColor="#71717a" stopOpacity="0.5"/>
        <stop offset="50%" stopColor="#e4e4e7" stopOpacity="0.3"/>
        <stop offset="70%" stopColor="#18181b" stopOpacity="0.7"/>
        <stop offset="100%" stopColor="#09090b" stopOpacity="0.9"/>
    </linearGradient>
    <linearGradient id="metal-sheen-iso" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#18181b" stopOpacity="0.6"/>
        <stop offset="40%" stopColor="#d4d4d8" stopOpacity="0.7"/>
        <stop offset="100%" stopColor="#09090b" stopOpacity="0.9"/>
    </linearGradient>
    <pattern id="bearing-pattern" width="4" height="4" patternUnits="userSpaceOnUse">
         <line x1="0" y1="4" x2="4" y2="0" stroke="#fbbf24" strokeWidth="1" opacity="0.5" />
    </pattern>
  </defs>
);

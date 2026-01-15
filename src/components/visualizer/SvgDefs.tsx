import React from 'react';

export const SvgDefs = () => (
  <defs>
    <linearGradient id="metal-sheen-vert" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="black" stopOpacity="0.5"/>
        <stop offset="30%" stopColor="white" stopOpacity="0.3"/>
        <stop offset="50%" stopColor="white" stopOpacity="0.1"/>
        <stop offset="70%" stopColor="black" stopOpacity="0.4"/>
        <stop offset="100%" stopColor="black" stopOpacity="0.6"/>
    </linearGradient>
    <linearGradient id="metal-sheen-iso" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="black" stopOpacity="0.4"/>
        <stop offset="40%" stopColor="white" stopOpacity="0.5"/>
        <stop offset="100%" stopColor="black" stopOpacity="0.7"/>
    </linearGradient>
    <pattern id="bearing-pattern" width="4" height="4" patternUnits="userSpaceOnUse">
         <line x1="0" y1="4" x2="4" y2="0" stroke="#fbbf24" strokeWidth="1" opacity="0.5" />
    </pattern>
  </defs>
);

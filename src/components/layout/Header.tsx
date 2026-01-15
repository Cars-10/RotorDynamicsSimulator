import React from 'react';

interface HeaderProps {
  children?: React.ReactNode; // Actions
}

export const Header: React.FC<HeaderProps> = ({ children }) => {
  return (
    <header className="h-14 bg-panel/90 backdrop-blur-md border-b border-border flex items-center justify-between px-4">
      <div className="flex items-center gap-3 select-none">
         {/* Branding SVG */}
         <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20 relative overflow-hidden shrink-0">
             <svg viewBox="0 0 100 100" className="w-full h-full p-[2px]">
                <path d="M15 25 L35 75 L50 35 L65 75 L85 25" fill="none" stroke="black" strokeWidth="6" strokeLinecap="square" strokeLinejoin="miter" />
                <circle cx="15" cy="25" r="5" fill="black" />
                <circle cx="50" cy="35" r="5" fill="black" />
                <circle cx="85" cy="25" r="5" fill="black" />
                <rect x="25" y="82" width="50" height="6" fill="black" rx="2" />
             </svg>
         </div>
         <div className="leading-tight">
            <h1 className="text-text-primary font-bold text-sm tracking-tight">RotorDynamics <span className="text-primary font-light">Sim</span></h1>
         </div>
      </div>
      
      <div className="flex items-center gap-2">
        {children}
      </div>
    </header>
  );
};

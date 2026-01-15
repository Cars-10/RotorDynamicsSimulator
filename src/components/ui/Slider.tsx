import React from 'react';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  valueDisplay?: React.ReactNode;
}

export const Slider: React.FC<SliderProps> = ({ label, valueDisplay, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-2">
      {(label || valueDisplay) && (
        <div className="flex justify-between items-center">
          {label && <label className="text-xs font-medium text-text-secondary">{label}</label>}
          {valueDisplay && <span className="text-xs font-mono text-primary">{valueDisplay}</span>}
        </div>
      )}
      <input 
        type="range"
        className={`w-full h-1.5 bg-surface rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary/30 ${className}`}
        {...props}
      />
    </div>
  );
};

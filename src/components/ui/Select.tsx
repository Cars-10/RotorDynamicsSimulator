import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select: React.FC<SelectProps> = ({ label, className = '', children, ...props }) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-text-secondary">{label}</label>}
      <div className="relative">
        <select 
          className={`appearance-none w-full bg-surface border border-border rounded px-3 py-2 pr-8 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-text-muted pointer-events-none" />
      </div>
    </div>
  );
};

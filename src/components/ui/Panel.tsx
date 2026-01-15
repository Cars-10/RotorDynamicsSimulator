import React from 'react';

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  actions?: React.ReactNode;
}

export const Panel: React.FC<PanelProps> = ({ title, actions, children, className = '', ...props }) => {
  return (
    <div className={`bg-panel border border-border rounded-lg shadow-sm flex flex-col ${className}`} {...props}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          {title && <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">{title}</h3>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-4 flex-1">
        {children}
      </div>
    </div>
  );
};

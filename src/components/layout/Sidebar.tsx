import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';

interface SidebarProps {
  title?: string;
  onClose?: () => void;
  children: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ title, onClose, children }) => {
  return (
    <div className="h-full flex flex-col bg-panel">
      {(title || onClose) && (
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          {title && <h2 className="font-semibold text-sm uppercase tracking-wider text-text-primary">{title}</h2>}
          {onClose && (
            <Button variant="icon" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4">
        {children}
      </div>
    </div>
  );
};

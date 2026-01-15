import React from 'react';

interface MainLayoutProps {
  header: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  showSidebar?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  header, 
  sidebar, 
  children, 
  showSidebar = false 
}) => {
  return (
    <div className="flex flex-col h-screen bg-canvas text-text-primary overflow-hidden">
      <div className="shrink-0 z-30">
        {header}
      </div>
      <div className="flex flex-1 overflow-hidden relative">
        {showSidebar && sidebar && (
          <aside className="w-80 shrink-0 border-r border-border bg-panel overflow-y-auto transition-all duration-300">
            {sidebar}
          </aside>
        )}
        <main className="flex-1 relative overflow-hidden bg-canvas">
          {children}
        </main>
      </div>
    </div>
  );
};

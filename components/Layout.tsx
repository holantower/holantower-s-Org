import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { AppView } from '../types';

interface LayoutProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, onChangeView, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-tower-900 overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        onChangeView={onChangeView}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <main className="flex-1 flex flex-col lg:ml-64 relative min-w-0 transition-all duration-300">
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
           {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

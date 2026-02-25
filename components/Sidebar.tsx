import React from 'react';
import { AppView } from '../types';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Mic, 
  Eye, 
  Palette, 
  Settings, 
  Menu,
  X,
  Zap
} from 'lucide-react';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, setIsOpen }) => {
  const menuItems = [
    { view: AppView.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { view: AppView.CHAT, label: 'Concierge Chat', icon: MessageSquare },
    { view: AppView.LIVE, label: 'Live Voice', icon: Mic },
    { view: AppView.VISION, label: 'Observatory', icon: Eye },
    { view: AppView.STUDIO, label: 'Creative Studio', icon: Palette },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-tower-800 rounded-lg border border-tower-700 text-white shadow-lg"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-tower-900 border-r border-tower-800 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-16 flex items-center px-6 border-b border-tower-800 bg-tower-900">
            <Zap className="text-tower-accent mr-3" size={24} />
            <span className="text-xl font-bold tracking-tight text-white">HolanTower</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <div className="text-xs font-semibold text-tower-500 uppercase tracking-wider mb-4 px-2">
              Applications
            </div>
            {menuItems.map((item) => (
              <button
                key={item.view}
                onClick={() => {
                  onChangeView(item.view);
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={`
                  w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 group
                  ${currentView === item.view 
                    ? 'bg-tower-accent text-white shadow-lg shadow-blue-900/20' 
                    : 'text-tower-400 hover:bg-tower-800 hover:text-white'}
                `}
              >
                <item.icon size={20} className={`mr-3 ${currentView === item.view ? 'text-white' : 'text-tower-500 group-hover:text-white'}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-tower-800">
            <button 
               onClick={() => onChangeView(AppView.SETTINGS)}
               className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${currentView === AppView.SETTINGS ? 'bg-tower-800 text-white' : 'text-tower-500 hover:text-white hover:bg-tower-800'}`}
            >
              <Settings size={20} className="mr-3" />
              <span>System</span>
            </button>
            <div className="mt-4 px-4 text-xs text-tower-600 text-center">
              v2.5.0 • HolanTower Suite
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;

import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ChatApp from './pages/ChatApp';
import VisionApp from './pages/VisionApp';
import LiveApp from './pages/LiveApp';
import StudioApp from './pages/StudioApp';
import { AppView } from './types';
import { Settings } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard onChangeView={setCurrentView} />;
      case AppView.CHAT:
        return <ChatApp />;
      case AppView.VISION:
        return <VisionApp />;
      case AppView.LIVE:
        return <LiveApp />;
      case AppView.STUDIO:
        return <StudioApp />;
      case AppView.SETTINGS:
        return (
          <div className="p-8 text-white max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Settings className="mr-3" /> System Settings
            </h2>
            <div className="bg-tower-800 rounded-xl p-6 border border-tower-700">
              <div className="mb-4">
                <label className="block text-sm font-medium text-tower-400 mb-2">API Configuration</label>
                <div className="p-3 bg-tower-900 rounded border border-tower-700 text-sm text-tower-300 font-mono">
                  Environment Variable: API_KEY (Loaded)
                </div>
              </div>
              <div className="pt-4 border-t border-tower-700">
                 <p className="text-xs text-tower-500">HolanTower v2.5.0 Build 2025.10.27</p>
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard onChangeView={setCurrentView} />;
    }
  };

  return (
    <Layout currentView={currentView} onChangeView={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default App;

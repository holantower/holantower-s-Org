import React from 'react';
import { Palette, PenTool } from 'lucide-react';

const StudioApp: React.FC = () => {
  return (
    <div className="flex flex-col h-full items-center justify-center bg-tower-900 p-8 text-white">
      <div className="bg-tower-800/50 p-12 rounded-2xl border border-tower-700 text-center max-w-lg">
        <div className="mx-auto w-16 h-16 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 mb-6">
          <Palette size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-4">Creative Studio</h2>
        <p className="text-tower-400 mb-8">
          The image generation module is currently undergoing maintenance for the Gemini 2.5 upgrade. 
          Please use the Observatory or Concierge modules in the meantime.
        </p>
        <button className="px-6 py-2 bg-tower-700 text-tower-300 rounded-lg text-sm cursor-not-allowed opacity-50">
          Module Offline
        </button>
      </div>
    </div>
  );
};

export default StudioApp;

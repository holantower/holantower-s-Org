import React from 'react';
import { AppView } from '../types';
import { MessageSquare, Mic, Eye, Palette, ArrowRight, Zap, Shield, Cpu } from 'lucide-react';

interface DashboardProps {
  onChangeView: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onChangeView }) => {
  const features = [
    {
      title: "Concierge Chat",
      description: "Advanced conversational AI for reasoning, coding, and creative writing.",
      icon: MessageSquare,
      view: AppView.CHAT,
      color: "text-blue-400",
      bg: "bg-blue-400/10"
    },
    {
      title: "Live Voice",
      description: "Real-time, low-latency voice interaction with multimodal capabilities.",
      icon: Mic,
      view: AppView.LIVE,
      color: "text-red-400",
      bg: "bg-red-400/10"
    },
    {
      title: "Observatory",
      description: "Visual analysis and object recognition powered by Gemini Vision.",
      icon: Eye,
      view: AppView.VISION,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10"
    },
    {
      title: "Creative Studio",
      description: "Generate and edit images using natural language prompts.",
      icon: Palette,
      view: AppView.STUDIO,
      color: "text-purple-400",
      bg: "bg-purple-400/10"
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="mb-12 relative overflow-hidden rounded-2xl bg-gradient-to-r from-tower-800 to-tower-900 border border-tower-700 p-8 md:p-12">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-tower-700/50 border border-tower-600 text-xs font-medium text-tower-300 mb-6">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tower-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-tower-accent"></span>
            </span>
            <span>System Operational</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome to <span className="text-tower-accent">HolanTower</span>
          </h1>
          <p className="text-lg text-tower-400 max-w-2xl mb-8 leading-relaxed">
            Your centralized command center for advanced artificial intelligence operations. 
            Access next-generation tools for communication, analysis, and creation.
          </p>
          <button 
            onClick={() => onChangeView(AppView.CHAT)}
            className="inline-flex items-center px-6 py-3 rounded-lg bg-tower-accent hover:bg-tower-accentHover text-white font-medium transition-colors shadow-lg shadow-blue-900/20"
          >
            Start Interaction <ArrowRight size={18} className="ml-2" />
          </button>
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
            <path fill="#3B82F6" d="M42.7,-62.9C50.9,-52.8,50.1,-34.4,51.7,-19.2C53.4,-4,57.4,8,54.9,19.3C52.4,30.6,43.3,41.2,32.3,48.2C21.3,55.3,8.3,58.7,-4.4,64.8C-17.1,70.9,-29.6,79.6,-40.3,74.7C-51,69.8,-59.9,51.3,-64.5,34.7C-69.1,18.1,-69.3,3.4,-64.5,-9.3C-59.7,-22,-49.8,-32.7,-39.2,-42.2C-28.5,-51.7,-17.1,-60.1,-3.5,-55.2C10.1,-50.4,20.2,-32.3,34.5,-23" transform="translate(100 100)" />
          </svg>
        </div>
      </div>

      {/* Stats / Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-tower-800/50 border border-tower-700 p-4 rounded-xl flex items-center">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 mr-4">
            <Cpu size={24} />
          </div>
          <div>
            <div className="text-sm text-tower-400">Processing Power</div>
            <div className="text-xl font-bold text-white">Gemini 3 Pro</div>
          </div>
        </div>
        <div className="bg-tower-800/50 border border-tower-700 p-4 rounded-xl flex items-center">
          <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400 mr-4">
            <Zap size={24} />
          </div>
          <div>
            <div className="text-sm text-tower-400">Latency</div>
            <div className="text-xl font-bold text-white">~45ms</div>
          </div>
        </div>
        <div className="bg-tower-800/50 border border-tower-700 p-4 rounded-xl flex items-center">
          <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400 mr-4">
            <Shield size={24} />
          </div>
          <div>
            <div className="text-sm text-tower-400">Security Level</div>
            <div className="text-xl font-bold text-white">Enterprise</div>
          </div>
        </div>
      </div>

      {/* Applications Grid */}
      <h2 className="text-xl font-bold text-white mb-6 flex items-center">
        <span className="w-1 h-6 bg-tower-accent rounded-full mr-3"></span>
        Available Modules
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {features.map((feature, idx) => (
          <button
            key={idx}
            onClick={() => onChangeView(feature.view)}
            className="group relative overflow-hidden bg-tower-800 hover:bg-tower-700 border border-tower-700 hover:border-tower-600 transition-all duration-300 rounded-xl p-6 text-left"
          >
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${feature.color}`}>
              <feature.icon size={100} />
            </div>
            
            <div className={`inline-flex p-3 rounded-lg ${feature.bg} ${feature.color} mb-4`}>
              <feature.icon size={24} />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-tower-accent transition-colors">
              {feature.title}
            </h3>
            <p className="text-tower-400 mb-6 text-sm leading-relaxed pr-12">
              {feature.description}
            </p>
            
            <div className="flex items-center text-sm font-medium text-tower-500 group-hover:text-white transition-colors">
              Launch Module <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

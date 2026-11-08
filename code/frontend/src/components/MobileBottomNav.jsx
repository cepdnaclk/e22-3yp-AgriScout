import React from 'react';
import { LayoutGrid, AlertTriangle, Bot, Globe } from 'lucide-react';
import { translations } from '../data/mockData';

export default function MobileBottomNav({
  activeTab,
  setActiveTab,
  criticalCount,
  onOpenDiagnostics,
  lang,
  setLang
}) {
  const t = translations[lang];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        
        {/* Furrow Map Tab */}
        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'map' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <LayoutGrid className="w-5 h-5 mb-0.5" />
          <span>{lang === 'si' ? 'පාත්ති' : 'Furrows'}</span>
        </button>

        {/* Alerts Tab */}
        <button
          onClick={() => setActiveTab('alerts')}
          className={`relative flex flex-col items-center py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'alerts' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-5 h-5 mb-0.5" />
          <span>{lang === 'si' ? 'අනතුරු' : 'Alerts'}</span>
          {criticalCount > 0 && (
            <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-rose-600 text-white text-2xs flex items-center justify-center font-bold">
              {criticalCount}
            </span>
          )}
        </button>

        {/* Rover Tab */}
        <button
          onClick={onOpenDiagnostics}
          className="flex flex-col items-center py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Bot className="w-5 h-5 mb-0.5" />
          <span>{lang === 'si' ? 'රෝවරය' : 'Rover'}</span>
        </button>

        {/* Language switch */}
        <button
          onClick={() => setLang(lang === 'en' ? 'si' : 'en')}
          className="flex flex-col items-center py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Globe className="w-5 h-5 mb-0.5 text-emerald-700" />
          <span>{lang === 'en' ? 'සිංහල' : 'EN'}</span>
        </button>

      </div>
    </nav>
  );
}

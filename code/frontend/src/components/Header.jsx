import React from 'react';
import { 
  Droplet, 
  Battery, 
  Globe, 
  Bot, 
  LogOut, 
  User, 
  ChevronDown,
  Sprout,
  Briefcase,
  Microscope,
  Wrench
} from 'lucide-react';
import { translations } from '../data/mockData';

export default function Header({ 
  lang, 
  setLang, 
  rover, 
  criticalCount, 
  user,
  onLogout,
  currentRole,
  onSwitchRole,
  onOpenDiagnostics 
}) {
  const t = translations[lang];

  const roles = [
    { id: 'worker', name: lang === 'si' ? 'ගොවියා (Grower)' : 'Field Worker', icon: Sprout },
    { id: 'manager', name: lang === 'si' ? 'කළමනාකරු' : 'Farm Manager', icon: Briefcase },
    { id: 'agronomist', name: lang === 'si' ? 'කෘෂි විද්‍යාඥයා' : 'Agronomist', icon: Microscope },
    { id: 'technician', name: lang === 'si' ? 'තාක්ෂණ ශිල්පියා' : 'Technician', icon: Wrench },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
              <Bot className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight">
                  Agri<span className="text-emerald-600">Scout</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  PoC v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* User Role Switcher & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Role Switcher Dropdown */}
            <div className="relative">
              <select
                value={currentRole}
                onChange={(e) => onSwitchRole(e.target.value)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold py-1.5 pl-3 pr-7 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 cursor-pointer appearance-none"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-2.5 pointer-events-none" />
            </div>

            {/* Rover Quick Diagnostic Pill */}
            <button 
              onClick={onOpenDiagnostics}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors text-slate-700 text-xs sm:text-sm font-medium"
              title="Click to view Rover Diagnostics"
            >
              <Battery className={`w-4 h-4 ${rover.batteryPercentage > 30 ? 'text-emerald-600' : 'text-amber-500'}`} />
              <span>{rover.batteryPercentage}%</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </button>

            {/* Language Toggle Button */}
            <button
              onClick={() => setLang(lang === 'en' ? 'si' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold transition-all border border-slate-200"
              aria-label="Toggle Language"
            >
              <Globe className="w-4 h-4 text-emerald-700" />
              <span>{lang === 'en' ? 'සිංහල' : 'English'}</span>
            </button>

            {/* Sign Out Button */}
            <button
              onClick={onLogout}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-500 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === 'si' ? 'පිටවීම' : 'Sign Out'}</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
}

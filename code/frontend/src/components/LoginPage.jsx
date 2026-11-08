import React, { useState } from 'react';
import { 
  Bot, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  User, 
  Sprout, 
  Briefcase, 
  Microscope, 
  Wrench,
  Globe
} from 'lucide-react';
import { translations } from '../data/mockData';

export default function LoginPage({ onLogin, lang, setLang }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('worker');

  const t = translations[lang];

  const rolePresets = [
    {
      id: 'worker',
      title: lang === 'si' ? 'ක්ෂේත්‍ර සේවකයා / ගොවියා' : 'Field Worker / Grower',
      role: 'Field Worker',
      badge: 'Mobile View',
      email: 'worker@agriscout.lk',
      icon: Sprout,
      desc: lang === 'si' ? 'පාත්තිවල තෙතමනය පරීක්ෂාව සහ ජලය සැපයීමේ සටහන්' : 'Fast furrow hydration checks & irrigation actions'
    },
    {
      id: 'manager',
      title: lang === 'si' ? 'වගා කළමනාකරු' : 'Farm Manager',
      role: 'Farm Manager',
      badge: 'Full Dashboard',
      email: 'manager@agriscout.lk',
      icon: Briefcase,
      desc: lang === 'si' ? 'සමස්ත හරිතාගාර වාර්තා සහ පාත්ති සිතියම' : 'Greenhouse furrow heatmap & yield analytics'
    },
    {
      id: 'agronomist',
      title: lang === 'si' ? 'කෘෂි විද්‍යාඥයා' : 'Agronomist & Specialist',
      role: 'Agronomist',
      badge: 'AI Screening',
      email: 'specialist@agriscout.lk',
      icon: Microscope,
      desc: lang === 'si' ? 'කොළ රෝග ලක්ෂණ පරීක්ෂාව සහ PDF වාර්තා' : 'Leaf foliar screening & diagnosis audits'
    },
    {
      id: 'technician',
      title: lang === 'si' ? 'තාක්ෂණික ශිල්පියා' : 'Hardware Technician',
      role: 'Technician',
      badge: 'Diagnostics',
      email: 'tech@agriscout.lk',
      icon: Wrench,
      desc: lang === 'si' ? 'රෝවරයේ බැටරි, ESP32 සන්නිවේදනය සහ මෝටර් පාලනය' : 'ESP32 UART, battery telemetry & manual override'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const preset = rolePresets.find(r => r.id === selectedRole);
    onLogin({
      email: email || preset.email,
      role: preset.role,
      roleId: preset.id,
      name: preset.title
    });
  };

  const handleQuickLogin = (preset) => {
    onLogin({
      email: preset.email,
      role: preset.role,
      roleId: preset.id,
      name: preset.title
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      
      {/* Language Switcher in corner */}
      <div className="max-w-4xl w-full mx-auto flex justify-end mb-4">
        <button
          onClick={() => setLang(lang === 'en' ? 'si' : 'en')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs hover:bg-slate-50 transition-colors"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-700" />
          <span>{lang === 'en' ? 'සිංහල' : 'English'}</span>
        </button>
      </div>

      <div className="max-w-4xl w-full mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: Brand & Overview */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                <Bot className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                Agri<span className="text-emerald-400">Scout</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight mb-3">
              {lang === 'si' 
                ? 'හරිතාගාර ස්වයංක්‍රීය පාංශු හා පැළ සෞඛ්‍ය කළමනාකරණය' 
                : 'Autonomous Greenhouse Plant & Soil Health Portal'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {lang === 'si'
                ? 'වගා බිමේ තෙතමනය, පෝෂණ මට්ටම් සහ පත්‍ර රෝග තත්ත්ව තත්‍ය කාලීනව නිරීක්ෂණය කරන බහු-පරිශීලක පද්ධතිය.'
                : 'Role-based management console for precision grow-bag monitoring, edge AI foliar screening, and rover telemetry.'}
            </p>

            <div className="mt-6 pt-6 border-t border-slate-700/60 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Multi-stakeholder access verification</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero-loss SQLite store-and-forward</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Dynamic agronomic irrigation rules</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800 text-2xs text-slate-400">
            CO3060 Computer Systems Design Project • Team QuadraMinds (Group 11)
          </div>
        </div>

        {/* Right Side: Role Selector & Login Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center">
          <div className="mb-5">
            <h3 className="text-xl font-bold text-slate-900">
              {lang === 'si' ? 'පද්ධතියට ඇතුල්වීම' : 'Sign in to AgriScout'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'si' 
                ? 'ඔබගේ භූමිකාව තෝරා 1-Click මඟින් පද්ධතියට පිවිසෙන්න' 
                : 'Select your stakeholder role below to launch the tailored console'}
            </p>
          </div>

          {/* Quick Role Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
            {rolePresets.map((preset) => {
              const IconComp = preset.icon;
              const isSelected = selectedRole === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => {
                    setSelectedRole(preset.id);
                    setEmail(preset.email);
                  }}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {preset.title}
                      </span>
                    </div>
                    <p className="text-2xs text-slate-500 line-clamp-1 mt-0.5">
                      {preset.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Standard Form Inputs */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'si' ? 'විද්‍යුත් තැපෑල' : 'Work Email'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email || rolePresets.find(r => r.id === selectedRole)?.email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@agriscout.lk"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-medium text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'si' ? 'මුරපදය' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password || '••••••••'}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-medium text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer mt-2"
            >
              <span>{lang === 'si' ? 'පද්ධතියට පිවිසෙන්න' : 'Access AgriScout Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}

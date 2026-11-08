import React from 'react';
import { Droplet, CheckCircle, AlertTriangle, QrCode, Thermometer, Wind, ArrowRight } from 'lucide-react';
import { translations } from '../data/mockData';

export default function WorkerDashboard({ bags, onSelectBag, onWaterBag, lang }) {
  const t = translations[lang];

  const criticalBags = bags.filter(b => b.status === 'CRITICAL_DRY');
  const warningBags = bags.filter(b => b.status === 'WARNING');
  const healthyBags = bags.filter(b => b.status === 'OPTIMAL');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Banner */}
      <div className="bg-emerald-800 text-white p-5 rounded-2xl shadow-sm">
        <h2 className="text-xl font-black">
          {lang === 'si' ? 'ගොවි සහයක මුහුණත' : 'Grower & Field Worker Console'}
        </h2>
        <p className="text-xs sm:text-sm text-emerald-100 mt-1">
          {lang === 'si' 
            ? 'හරිතාගාරයේ ජලය අවශ්‍ය පාත්ති හඳුනාගෙන වහාම ජල සම්පාදනය කරන්න.' 
            : 'Identify water-stressed grow bags and log irrigation actions directly from your smartphone.'}
        </p>

        {/* Quick status bar */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-emerald-700/60 text-center">
          <div className="bg-emerald-900/40 p-2.5 rounded-xl">
            <span className="text-2xs text-emerald-200 block">{lang === 'si' ? 'හොඳ මට්ටම' : 'Healthy Bags'}</span>
            <span className="text-xl font-black text-white">{healthyBags.length}</span>
          </div>
          <div className="bg-amber-900/40 p-2.5 rounded-xl">
            <span className="text-2xs text-amber-200 block">{lang === 'si' ? 'අවදානම්' : 'Warning'}</span>
            <span className="text-xl font-black text-amber-300">{warningBags.length}</span>
          </div>
          <div className="bg-rose-900/50 p-2.5 rounded-xl border border-rose-400/30">
            <span className="text-2xs text-rose-200 block">{lang === 'si' ? 'දැඩි වියළි' : 'Critical Dry'}</span>
            <span className="text-xl font-black text-rose-300">{criticalBags.length}</span>
          </div>
        </div>
      </div>

      {/* Critical Dry Section - Prioritized First for Field Workers */}
      {criticalBags.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertTriangle className="w-5 h-5 animate-bounce" />
            <h3 className="font-extrabold text-base">
              {lang === 'si' ? 'වහාම ජලය සැපයිය යුතු පාත්ති (තෙතමනය <30%)' : 'Urgent Irrigation Needed (<30% VWC)'}
            </h3>
          </div>

          <div className="space-y-3">
            {criticalBags.map((bag) => (
              <div 
                key={bag.id}
                className="bg-white rounded-2xl border-2 border-rose-300 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                    <Droplet className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base text-slate-900">{bag.id}</span>
                      <span className="text-2xs font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        {bag.moistureVwc}% VWC
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {bag.crop} • {t.row} {bag.row}, Bag #{bag.col}
                    </p>
                    <p className="text-2xs text-rose-600 font-semibold mt-0.5">
                      {lang === 'si' ? 'අවදානම: පැළය ඉක්මනින් වියළී යා හැකිය' : 'High wilting risk. Root zone is depleted.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => onSelectBag(bag)}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
                  >
                    {t.viewBag}
                  </button>
                  <button
                    onClick={() => onWaterBag(bag.id)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{t.markWatered}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warning Bags */}
      {warningBags.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-extrabold text-sm text-slate-700">
            {lang === 'si' ? 'අධීක්ෂණයේ පවතින පාත්ති (30% - 40%)' : 'Moderate Moisture Watchlist (30% - 40%)'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {warningBags.map((bag) => (
              <div 
                key={bag.id}
                onClick={() => onSelectBag(bag)}
                className="bg-white rounded-xl border border-amber-200 p-3.5 hover:shadow-sm cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{bag.id}</span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {bag.moistureVwc}% VWC
                    </span>
                  </div>
                  <p className="text-2xs text-slate-500 mt-0.5">{bag.crop}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Healthy Section */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-sm text-slate-700">
          {lang === 'si' ? 'ප්‍රශස්ථ තත්ත්වයේ පවතින පාත්ති' : 'Optimal Moisture Bags (40% - 70%)'}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {healthyBags.map((bag) => (
            <div 
              key={bag.id}
              onClick={() => onSelectBag(bag)}
              className="bg-white rounded-xl border border-slate-200 p-3 hover:border-emerald-300 cursor-pointer text-center"
            >
              <span className="text-xs font-extrabold text-slate-900 block">{bag.id}</span>
              <span className="text-xs font-bold text-emerald-600 block mt-1">{bag.moistureVwc}% VWC</span>
              <span className="text-2xs text-slate-400 block mt-0.5">{bag.rootTemp}°C</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

import React from 'react';
import { AlertTriangle, Droplet, ArrowRight } from 'lucide-react';
import { translations } from '../data/mockData';

export default function AlertBanner({ criticalBags, onSelectBag, lang }) {
  if (criticalBags.length === 0) return null;

  const t = translations[lang];

  return (
    <div className="bg-rose-50 border-y sm:border sm:rounded-xl border-rose-200 p-3 sm:p-4 my-3 sm:my-6 max-w-7xl mx-auto shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-rose-900">
              {lang === 'si'
                ? `අවධානයයි: පැළ බෑග් ${criticalBags.length} ක තෙතමනය අවම මට්ටමට (<30%) වඩා අඩුවී ඇත!`
                : `Irrigation Alert: ${criticalBags.length} Grow Bag(s) have critically low moisture (<30% VWC)!`}
            </h4>
            <p className="text-xs text-rose-700">
              {t.irrigateNow}
            </p>
          </div>
        </div>

        {/* Quick action buttons for dry bags */}
        <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
          {criticalBags.map((bag) => (
            <button
              key={bag.id}
              onClick={() => onSelectBag(bag)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-rose-300 hover:bg-rose-100/70 text-rose-800 text-xs font-bold transition-all shadow-2xs"
            >
              <Droplet className="w-3.5 h-3.5 text-rose-600" />
              <span>{bag.id} ({bag.moistureVwc}%)</span>
              <ArrowRight className="w-3 h-3 text-rose-500" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

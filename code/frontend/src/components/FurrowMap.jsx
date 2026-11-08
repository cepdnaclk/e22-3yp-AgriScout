import React from 'react';
import { 
  Droplet, 
  Thermometer, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  QrCode, 
  Layers,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { translations } from '../data/mockData';

export default function FurrowMap({
  bags,
  selectedBag,
  onSelectBag,
  filter,
  setFilter,
  lang,
  onSimulateScan,
  isScanning
}) {
  const t = translations[lang];

  // Group bags by row
  const rows = [1, 2];

  const getFilteredBagsForRow = (rowNum) => {
    return bags
      .filter((b) => b.row === rowNum)
      .filter((b) => {
        if (filter === 'CRITICAL') return b.status === 'CRITICAL_DRY';
        if (filter === 'OPTIMAL') return b.status === 'OPTIMAL';
        return true;
      });
  };

  const getStatusBadge = (status, vwc) => {
    if (status === 'CRITICAL_DRY') {
      return {
        bg: 'bg-rose-50 border-rose-200 text-rose-700',
        dot: 'bg-rose-500 animate-pulse',
        label: `${vwc}% - ${lang === 'si' ? 'වියළි' : 'Critical Dry'}`,
      };
    }
    if (status === 'WARNING') {
      return {
        bg: 'bg-amber-50 border-amber-200 text-amber-700',
        dot: 'bg-amber-500',
        label: `${vwc}% - ${lang === 'si' ? 'මධ්‍යස්ථ' : 'Moderate'}`,
      };
    }
    return {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      dot: 'bg-emerald-500',
      label: `${vwc}% - ${lang === 'si' ? 'ප්‍රශස්ථ' : 'Optimal'}`,
    };
  };

  return (
    <div className="space-y-6">
      
      {/* Top Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
        
        {/* Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              filter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {t.allBags} ({bags.length})
          </button>
          
          <button
            onClick={() => setFilter('CRITICAL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              filter === 'CRITICAL'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
            }`}
          >
            <Droplet className="w-3.5 h-3.5" />
            <span>{t.criticalOnly}</span>
          </button>

          <button
            onClick={() => setFilter('OPTIMAL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              filter === 'OPTIMAL'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t.optimalOnly}</span>
          </button>
        </div>

        {/* Live Simulation Trigger (Very helpful for live presentation & PoC testing) */}
        <button
          onClick={onSimulateScan}
          disabled={isScanning}
          className="flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all disabled:opacity-60 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? (lang === 'si' ? 'පරීක්ෂා කරමින්...' : 'Rover Probing...') : t.simulateScan}</span>
        </button>

      </div>

      {/* Furrow Rows */}
      {rows.map((rowNum) => {
        const rowBags = getFilteredBagsForRow(rowNum);
        return (
          <div key={rowNum} className="space-y-3">
            
            {/* Furrow Row Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                  R{rowNum}
                </div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                  {t.row} {rowNum}: {rowNum === 1 ? 'Bell Pepper Section' : 'Cucumber Section'}
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {rowBags.length} {lang === 'si' ? 'පැළ බෑග්' : 'grow bags'}
              </span>
            </div>

            {/* Bag Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {rowBags.map((bag) => {
                const statusMeta = getStatusBadge(bag.status, bag.moistureVwc);
                const isSelected = selectedBag && selectedBag.id === bag.id;

                return (
                  <div
                    key={bag.id}
                    onClick={() => onSelectBag(bag)}
                    className={`group relative bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
                        : bag.status === 'CRITICAL_DRY'
                        ? 'border-rose-300 hover:border-rose-400 bg-rose-50/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Top Row: Bag ID & Status Badge */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                        <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                          {bag.id}
                        </span>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${statusMeta.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`}></span>
                        {statusMeta.label}
                      </span>
                    </div>

                    {/* Crop Label */}
                    <p className="text-xs text-slate-500 font-medium line-clamp-1 mb-3">
                      {bag.crop}
                    </p>

                    {/* Moisture Progress Bar */}
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-600 flex items-center gap-1">
                          <Droplet className="w-3 h-3 text-sky-500" />
                          {t.moistureVwc}
                        </span>
                        <span className={bag.moistureVwc < 30 ? 'text-rose-600 font-bold' : 'text-slate-900'}>
                          {bag.moistureVwc}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            bag.moistureVwc < 30
                              ? 'bg-rose-500'
                              : bag.moistureVwc < 40
                              ? 'bg-amber-400'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(10, bag.moistureVwc))}%` }}
                        />
                      </div>
                    </div>

                    {/* Sensor Footer Glance */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Thermometer className="w-3 h-3 text-orange-400" />
                        <span>{bag.rootTemp}°C</span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-700 font-medium text-2xs">
                        <span>{t.viewBag}</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        );
      })}

    </div>
  );
}

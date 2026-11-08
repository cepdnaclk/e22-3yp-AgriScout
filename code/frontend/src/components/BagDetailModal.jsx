import React from 'react';
import { 
  X, 
  Droplet, 
  Thermometer, 
  Wind, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle,
  QrCode,
  CheckCircle,
  TrendingDown
} from 'lucide-react';
import { translations } from '../data/mockData';

export default function BagDetailModal({ bag, onClose, onWaterBag, lang }) {
  if (!bag) return null;

  const t = translations[lang];

  const getStatusColor = (status) => {
    if (status === 'CRITICAL_DRY') return 'text-rose-600 bg-rose-50 border-rose-200';
    if (status === 'WARNING') return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
              <QrCode className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg sm:text-xl text-slate-900">
                  {bag.id}
                </h3>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getStatusColor(bag.status)}`}>
                  {bag.status === 'CRITICAL_DRY' 
                    ? t.statusCritical 
                    : bag.status === 'WARNING' 
                    ? t.statusWarning 
                    : t.statusOptimal}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{bag.crop} • {t.row} {bag.row}, Bag #{bag.col}</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-200/60 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">

          {/* Primary Metric: Moisture Gauge Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 text-white shadow-md relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Droplet className="w-4 h-4 text-sky-400" />
                  {t.moistureVwc}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                    {bag.moistureVwc}%
                  </span>
                  <span className="text-xs text-slate-400">
                    (Target Zone: 40% – 70%)
                  </span>
                </div>
              </div>

              {/* Action Button: Simulate irrigation */}
              <button
                onClick={() => onWaterBag(bag.id)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-sm shadow-md transition-all cursor-pointer"
              >
                <Droplet className="w-4 h-4 fill-slate-950" />
                <span>{t.markWatered}</span>
              </button>
            </div>

            {/* Visual Hydration Range Bar */}
            <div className="mt-4 space-y-1.5">
              <div className="w-full bg-slate-700/60 rounded-full h-3 overflow-hidden p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    bag.moistureVwc < 30 
                      ? 'bg-rose-500' 
                      : bag.moistureVwc < 40 
                      ? 'bg-amber-400' 
                      : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, bag.moistureVwc))}%` }}
                />
              </div>
              <div className="flex justify-between text-2xs text-slate-400 font-medium px-0.5">
                <span className="text-rose-400">0% Critical Dry</span>
                <span className="text-emerald-400">40% - 70% Optimal Growth</span>
                <span className="text-slate-400">100% Saturation</span>
              </div>
            </div>
          </div>

          {/* Environmental Sensor Readings Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                <Thermometer className="w-4 h-4 text-orange-500" />
                <span>{t.rootTemp}</span>
              </div>
              <p className="text-xl font-bold text-slate-900">{bag.rootTemp} °C</p>
              <span className="text-2xs text-slate-400">DS18B20 Stainless Probe</span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                <Thermometer className="w-4 h-4 text-sky-500" />
                <span>{t.ambientTemp}</span>
              </div>
              <p className="text-xl font-bold text-slate-900">{bag.ambientTemp} °C</p>
              <span className="text-2xs text-slate-400">DHT22 Microclimate</span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                <Wind className="w-4 h-4 text-teal-500" />
                <span>{t.humidity}</span>
              </div>
              <p className="text-xl font-bold text-slate-900">{bag.humidity} % RH</p>
              <span className="text-2xs text-slate-400">Greenhouse Relative Humidity</span>
            </div>

          </div>

          {/* AI Leaf Vision Inspection Panel */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-800">
                  {t.healthStatus}
                </h4>
              </div>
              <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                {bag.lastInspected}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Leaf Image Preview */}
              <div className="relative w-full sm:w-44 h-32 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                <img 
                  src={bag.photoUrl} 
                  alt="Inspected Plant Canopy" 
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-2xs px-1.5 py-0.5 rounded font-mono">
                  5MP OV5647
                </span>
              </div>

              {/* Classification Results */}
              <div className="flex-1 space-y-2 w-full">
                <div className="flex items-center gap-2">
                  {bag.leafCondition === 'healthyLeaf' ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  )}
                  <span className="font-extrabold text-sm text-slate-900">
                    {t[bag.leafCondition]}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600 font-semibold">
                    <span>Edge AI Model Confidence</span>
                    <span className="text-emerald-700 font-bold">{bag.aiConfidence}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div 
                      className="bg-emerald-600 h-full rounded-full" 
                      style={{ width: `${bag.aiConfidence}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-500">
                  {bag.leafCondition === 'healthyLeaf' ? t.normalNotice : t.irrigateNow}
                </p>
              </div>
            </div>
          </div>

          {/* Moisture Decay Curve / History Section */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-slate-500" />
                Today's Moisture Decay Trend (VWC %)
              </span>
              <span className="text-slate-400 font-normal">Sampled by AgriScout</span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-2">
              {bag.history.map((h, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-lg p-2 text-center shadow-2xs">
                  <span className="text-2xs text-slate-400 block font-medium">{h.time}</span>
                  <span className={`text-sm font-bold ${h.vwc < 30 ? 'text-rose-600' : 'text-slate-800'}`}>
                    {h.vwc}%
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer"
          >
            {t.close}
          </button>
        </div>

      </div>
    </div>
  );
}

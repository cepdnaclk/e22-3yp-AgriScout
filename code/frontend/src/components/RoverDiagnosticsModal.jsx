import React from 'react';
import { 
  X, 
  Bot, 
  Battery, 
  Wifi, 
  Cpu, 
  Gauge, 
  ShieldCheck, 
  Navigation,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { translations } from '../data/mockData';

export default function RoverDiagnosticsModal({ isOpen, onClose, rover, lang }) {
  if (!isOpen) return null;

  const t = translations[lang];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Bot className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">
                {rover.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{rover.connectionStatus}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          
          {/* Battery Status */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                <Battery className="w-4 h-4 text-emerald-600" />
                {t.batteryLevel}
              </span>
              <span className="text-xs font-mono font-bold text-slate-700">{rover.batteryVoltage}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{rover.batteryPercentage}%</span>
              <span className="text-xs text-slate-500 font-medium">(Estimated ~4.5 hrs runtime)</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${rover.batteryPercentage}%` }}
              />
            </div>
          </div>

          {/* Subsystem Health Cards */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            
            <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                <Cpu className="w-3.5 h-3.5 text-sky-500" />
                <span>ESP32 RT Controller</span>
              </div>
              <p className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active (115.2k Baud)
              </p>
              <span className="text-2xs text-slate-400">PWM & Odometry OK</span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                <HardDrive className="w-3.5 h-3.5 text-purple-500" />
                <span>RPi 5 Edge Node</span>
              </div>
              <p className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                SQLite Ring Buffer OK
              </p>
              <span className="text-2xs text-slate-400">0 unsynced records</span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                <span>Poly-tunnel Uplink</span>
              </div>
              <p className="font-bold text-slate-800">{rover.signalStrength}</p>
              <span className="text-2xs text-slate-400">TLS MQTT Port 8883</span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                <Gauge className="w-3.5 h-3.5 text-amber-500" />
                <span>Probes Logged</span>
              </div>
              <p className="font-bold text-slate-800">{rover.probesCompletedToday} insertions</p>
              <span className="text-2xs text-slate-400">3-DOF Arm Cycles</span>
            </div>

          </div>

          {/* Location / Mission */}
          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
              <Navigation className="w-4 h-4 text-emerald-700" />
              <span>{t.currentMission}</span>
            </div>
            <p className="text-emerald-800 font-medium">
              {rover.currentLocation} ({rover.mode})
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            {t.close}
          </button>
        </div>

      </div>
    </div>
  );
}

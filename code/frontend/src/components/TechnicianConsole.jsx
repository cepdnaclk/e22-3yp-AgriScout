import React, { useState } from 'react';
import { 
  Bot, 
  Battery, 
  Cpu, 
  Radio, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  AlertOctagon, 
  Play, 
  RefreshCw, 
  Terminal,
  ShieldAlert,
  Zap,
  Activity
} from 'lucide-react';

export default function TechnicianConsole({ rover, lang }) {
  const [eStopActive, setEStopActive] = useState(false);
  const [armAction, setArmAction] = useState('IDLE');
  const [commandLog, setCommandLog] = useState([
    '[12:45:01] ESP32 Booted. Firmware v2.1 (PID Odometry enabled)',
    '[12:45:02] UART0 Link Synchronized with Raspberry Pi 5 @ 115200 baud',
    '[12:45:05] Ultrasonic Sonar HC-SR04: Front=142cm, Rear=180cm (Safe >20cm)',
    '[12:45:10] PCA9685 I2C Servo Driver initialized on 0x40 (6V Rail OK)',
    '[12:45:12] Rover awaiting operator sequence or autonomous dispatch...'
  ]);

  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString();
    setCommandLog(prev => [`[${time}] ${msg}`, ...prev.slice(0, 7)]);
  };

  const handleManualDrive = (direction) => {
    if (eStopActive) {
      addLog(`COMMAND BLOCKED: Emergency Stop Active!`);
      return;
    }
    addLog(`MOTOR PWM DRIVE: ${direction} (Speed: 45% PWM)`);
  };

  const handleArmTrigger = () => {
    if (eStopActive) return;
    setArmAction('PROBING');
    addLog(`3-DOF ARM: Executing insertion trajectory into grow-bag rim...`);
    setTimeout(() => {
      setArmAction('MEASURING');
      addLog(`3-DOF ARM: Capacitive probe engaged. Taking 3-sample ADC reading...`);
      setTimeout(() => {
        setArmAction('RETRACTING');
        addLog(`3-DOF ARM: Retracting joint 2 & 3 to travel position.`);
        setTimeout(() => {
          setArmAction('IDLE');
          addLog(`3-DOF ARM: Retraction complete. Arm parked.`);
        }, 1200);
      }, 1500);
    }, 1200);
  };

  const toggleEStop = () => {
    const next = !eStopActive;
    setEStopActive(next);
    if (next) {
      addLog(`🚨 EMERGENCY STOP TRIGGERED! Hardware relays open. Motor PWM cut to 0.`);
    } else {
      addLog(`EMERGENCY STOP CLEARED. Safety interlocks reset.`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black">
              {lang === 'si' ? 'රෝවරයේ තාක්ෂණික පාලන පුවරුව' : 'Rover Hardware & Embedded Diagnostics'}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'si' ? 'ESP32 සන්නිවේදනය, මෝටර් පාලනය සහ බැටරි තත්ත්වය' : 'Real-time telemetry, ESP32 UART commands & manual actuator overrides'}
            </p>
          </div>
        </div>

        {/* E-Stop Button */}
        <button
          onClick={toggleEStop}
          className={`px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md ${
            eStopActive 
              ? 'bg-amber-400 text-slate-950 hover:bg-amber-300' 
              : 'bg-rose-600 hover:bg-rose-700 text-white'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          <span>{eStopActive ? 'RESET EMERGENCY STOP' : 'EMERGENCY E-STOP (HALT)'}</span>
        </button>
      </div>

      {/* Grid: Diagnostics Telemetry on Left, Manual Overrides on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Telemetry Panels (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Power Subsystem Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Battery className="w-4 h-4 text-emerald-600" />
                Power Rail Telemetry (3S Li-ion 18650 Pack)
              </span>
              <span className="text-2xs font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">
                BMS Active (12.2V)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-2xs text-slate-400 block font-medium">State of Charge</span>
                <span className="text-xl font-black text-slate-900">{rover.batteryPercentage}%</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-2xs text-slate-400 block font-medium">Buck 1 (RPi 5 & ESP)</span>
                <span className="text-xl font-black text-emerald-600">5.12 V</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-2xs text-slate-400 block font-medium">Buck 2 (MG996R Servos)</span>
                <span className="text-xl font-black text-emerald-600">6.05 V</span>
              </div>
            </div>
          </div>

          {/* Embedded Links Card */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>ESP32 RT Node</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <p className="font-extrabold text-sm text-slate-900">UART0 (115,200 baud)</p>
              <p className="text-2xs text-slate-400">PWM PID loop @ 50 Hz</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Sonar Distance Buffer</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <p className="font-extrabold text-sm text-slate-900">142 cm (Front)</p>
              <p className="text-2xs text-slate-400">Cut-off safety trigger: &lt;20cm</p>
            </div>
          </div>

          {/* Real-time Terminal Log */}
          <div className="bg-slate-950 rounded-2xl p-4 text-white shadow-md font-mono text-xs space-y-2 border border-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
              <span className="flex items-center gap-1.5 text-2xs uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                Live UART Serial Telemetry Stream
              </span>
              <span className="text-emerald-400 text-2xs">ONLINE</span>
            </div>

            <div className="space-y-1 text-slate-300 overflow-hidden">
              {commandLog.map((log, i) => (
                <div key={i} className="text-2xs leading-relaxed truncate">
                  {log}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Manual Actuator Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Chassis Locomotion D-Pad */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-sm text-slate-900">
                Manual Rover Locomotion
              </h3>
              <span className="text-2xs text-slate-400">4x DC Geared Motors</span>
            </div>

            {/* D-Pad Buttons */}
            <div className="flex flex-col items-center gap-2 py-2">
              <button
                onClick={() => handleManualDrive('FORWARD')}
                disabled={eStopActive}
                className="w-14 h-14 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center text-slate-800 shadow-2xs font-bold transition-all cursor-pointer active:scale-95"
              >
                <ArrowUp className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleManualDrive('LEFT')}
                  disabled={eStopActive}
                  className="w-14 h-14 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center text-slate-800 shadow-2xs font-bold transition-all cursor-pointer active:scale-95"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>

                <div className="w-14 h-14 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-mono text-2xs font-bold">
                  {rover.speed}
                </div>

                <button
                  onClick={() => handleManualDrive('RIGHT')}
                  disabled={eStopActive}
                  className="w-14 h-14 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center text-slate-800 shadow-2xs font-bold transition-all cursor-pointer active:scale-95"
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>

              <button
                onClick={() => handleManualDrive('REVERSE')}
                disabled={eStopActive}
                className="w-14 h-14 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center text-slate-800 shadow-2xs font-bold transition-all cursor-pointer active:scale-95"
              >
                <ArrowDown className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* 3-DOF Arm Probing Controller */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-sm text-slate-900">
                3-DOF Probing Robotic Arm
              </h3>
              <span className={`text-2xs px-2 py-0.5 rounded-full font-bold ${
                armAction === 'IDLE' ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-emerald-800 animate-pulse'
              }`}>
                {armAction}
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Coordinates Joint 1 (Yaw), Joint 2 (Elevate over 20cm rim), and Joint 3 (Plunge into root coco-peat).
            </p>

            <button
              onClick={handleArmTrigger}
              disabled={eStopActive || armAction !== 'IDLE'}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>{armAction === 'IDLE' ? 'Trigger Single Soil Probe Sequence' : 'Probing Sequence Running...'}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

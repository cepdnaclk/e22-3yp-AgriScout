import React, { useState } from 'react';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import WorkerDashboard from './components/WorkerDashboard';
import AgronomistDashboard from './components/AgronomistDashboard';
import TechnicianConsole from './components/TechnicianConsole';
import AlertBanner from './components/AlertBanner';
import FurrowMap from './components/FurrowMap';
import BagDetailModal from './components/BagDetailModal';
import RoverDiagnosticsModal from './components/RoverDiagnosticsModal';
import MobileBottomNav from './components/MobileBottomNav';
import { initialGrowBags, initialRoverState, translations } from './data/mockData';
import { Droplet, Thermometer, ShieldCheck, Cpu, ArrowUpRight } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState('en');
  const [currentUser, setCurrentUser] = useState(null); // null shows the login screen
  const [currentRole, setCurrentRole] = useState('manager');
  const [growBags, setGrowBags] = useState(initialGrowBags);
  const [rover, setRover] = useState(initialRoverState);
  const [selectedBag, setSelectedBag] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState('map');
  const [isScanning, setIsScanning] = useState(false);

  const t = translations[lang];

  // Derived metrics
  const criticalBags = growBags.filter((b) => b.status === 'CRITICAL_DRY');
  const optimalBags = growBags.filter((b) => b.status === 'OPTIMAL');
  const avgTemp = (growBags.reduce((acc, b) => acc + b.rootTemp, 0) / growBags.length).toFixed(1);

  // Action: Mark a bag as irrigated (simulates grower or drip valve action)
  const handleWaterBag = (bagId) => {
    setGrowBags((prev) =>
      prev.map((b) => {
        if (b.id === bagId) {
          const updated = {
            ...b,
            moistureVwc: 66,
            status: 'OPTIMAL',
            lastInspected: 'Just now (Irrigated)',
            history: [...b.history, { time: 'Now', vwc: 66 }]
          };
          if (selectedBag && selectedBag.id === bagId) {
            setSelectedBag(updated);
          }
          return updated;
        }
        return b;
      })
    );
  };

  // Action: Simulate Rover taking a new probe reading (useful for live demo!)
  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * growBags.length);
      const targetBag = growBags[randomIndex];
      const newMoisture = Math.floor(Math.random() * 35) + 30; // 30% - 65%
      const newStatus = newMoisture < 30 ? 'CRITICAL_DRY' : newMoisture < 40 ? 'WARNING' : 'OPTIMAL';

      setGrowBags((prev) =>
        prev.map((b, idx) => {
          if (idx === randomIndex) {
            return {
              ...b,
              moistureVwc: newMoisture,
              status: newStatus,
              lastInspected: 'Just now (Rover Probe)',
              history: [...b.history, { time: 'Now', vwc: newMoisture }]
            };
          }
          return b;
        })
      );

      setRover((r) => ({
        ...r,
        probesCompletedToday: r.probesCompletedToday + 1,
        currentLocation: `Furrow ${targetBag.row}, Bag ${targetBag.col} Probed`
      }));

      setIsScanning(false);
    }, 1200);
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    setCurrentRole(user.roleId || 'manager');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // If user is not logged in, show the sleek Login screen
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} lang={lang} setLang={setLang} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 sm:pb-12">
      
      {/* Responsive Header with Role Switcher & Language Toggle */}
      <Header
        lang={lang}
        setLang={setLang}
        rover={rover}
        criticalCount={criticalBags.length}
        user={currentUser}
        onLogout={handleLogout}
        currentRole={currentRole}
        onSwitchRole={(role) => setCurrentRole(role)}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        
        {/* Dynamic Role-Based Views */}
        
        {/* 1. FIELD WORKER / GROWER VIEW */}
        {currentRole === 'worker' && (
          <WorkerDashboard
            bags={growBags}
            onSelectBag={(b) => setSelectedBag(b)}
            onWaterBag={handleWaterBag}
            lang={lang}
          />
        )}

        {/* 2. AGRONOMIST & CROP SPECIALIST VIEW */}
        {currentRole === 'agronomist' && (
          <AgronomistDashboard
            bags={growBags}
            lang={lang}
          />
        )}

        {/* 3. HARDWARE TECHNICIAN VIEW */}
        {currentRole === 'technician' && (
          <TechnicianConsole
            rover={rover}
            lang={lang}
          />
        )}

        {/* 4. FARM MANAGER / FULL DASHBOARD VIEW */}
        {currentRole === 'manager' && (
          <>
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              
              <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>{lang === 'si' ? 'මුළු පැළ සංඛ්‍යාව' : 'Monitored Grow Bags'}</span>
                  <Cpu className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  {growBags.length}
                </p>
                <span className="text-2xs text-slate-400">2 Furrows Active</span>
              </div>

              <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>{lang === 'si' ? 'නිරෝගී තත්ත්වය' : 'Optimal Hydration'}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
                  {Math.round((optimalBags.length / growBags.length) * 100)}%
                </p>
                <span className="text-2xs text-slate-400">{optimalBags.length} of {growBags.length} in target VWC</span>
              </div>

              <div className={`p-3.5 sm:p-4 rounded-xl border shadow-2xs transition-all ${
                criticalBags.length > 0 ? 'bg-rose-50/50 border-rose-200' : 'bg-white border-slate-200/80'
              }`}>
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span className={criticalBags.length > 0 ? 'text-rose-700' : ''}>
                    {lang === 'si' ? 'ජල හිඟ පැළ' : 'Critical Water Deficit'}
                  </span>
                  <Droplet className={`w-4 h-4 ${criticalBags.length > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
                </div>
                <p className={`text-2xl sm:text-3xl font-extrabold mt-1 ${
                  criticalBags.length > 0 ? 'text-rose-600' : 'text-slate-900'
                }`}>
                  {criticalBags.length}
                </p>
                <span className="text-2xs text-slate-400">Moisture &lt; 30% VWC</span>
              </div>

              <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>{lang === 'si' ? 'සාමාන්‍ය උෂ්ණත්වය' : 'Avg Root Temp'}</span>
                  <Thermometer className="w-4 h-4 text-orange-500" />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  {avgTemp} °C
                </p>
                <span className="text-2xs text-slate-400">Greenhouse Substrate</span>
              </div>

            </div>

            {/* Real-time Alert Banner */}
            <AlertBanner
              criticalBags={criticalBags}
              onSelectBag={(bag) => setSelectedBag(bag)}
              lang={lang}
            />

            {/* Primary View: Furrow Map */}
            <section className="mt-4">
              <div className="mb-3">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  {t.furrowMap}
                </h2>
                <p className="text-xs text-slate-500">
                  {lang === 'si'
                    ? 'හරිතාගාරයේ එක් එක් පැළ බෑගයේ තෙතමනය සහ සෞඛ්‍ය තත්ත්වය සජීවීව නිරීක්ෂණය කරන්න.'
                    : 'Click any grow bag card to view root moisture decay curves, leaf camera AI inspection, and microclimate telemetry.'}
                </p>
              </div>

              <FurrowMap
                bags={growBags}
                selectedBag={selectedBag}
                onSelectBag={(bag) => setSelectedBag(bag)}
                filter={filter}
                setFilter={setFilter}
                lang={lang}
                onSimulateScan={handleSimulateScan}
                isScanning={isScanning}
              />
            </section>
          </>
        )}

        {/* Footer info for 3YP evaluation */}
        <footer className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
          <p className="font-semibold text-slate-700">
            AgriScout — Precision Greenhouse Monitoring & Locomotion Platform
          </p>
          <p className="mt-1 text-slate-400">
            CO3060 Computer Systems Design Project (E22 Batch) • Team QuadraMinds (Group 11)
          </p>
          <p className="mt-1">
            <a 
              href="https://github.com/cepdnaclk/e22-3yp-AgriScout" 
              target="_blank" 
              rel="noreferrer" 
              className="text-emerald-600 hover:underline inline-flex items-center gap-1 font-medium"
            >
              cepdnaclk/e22-3yp-AgriScout <ArrowUpRight className="w-3 h-3" />
            </a>
          </p>
        </footer>

      </main>

      {/* Bag Detail Modal / Drawer */}
      <BagDetailModal
        bag={selectedBag}
        onClose={() => setSelectedBag(null)}
        onWaterBag={handleWaterBag}
        lang={lang}
      />

      {/* Rover Diagnostics Modal */}
      <RoverDiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        rover={rover}
        lang={lang}
      />

      {/* Mobile-Only Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeMobileTab}
        setActiveTab={(tab) => {
          setActiveMobileTab(tab);
          if (tab === 'alerts' && criticalBags.length > 0) {
            setSelectedBag(criticalBags[0]);
          }
        }}
        criticalCount={criticalBags.length}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        lang={lang}
        setLang={setLang}
      />

    </div>
  );
}

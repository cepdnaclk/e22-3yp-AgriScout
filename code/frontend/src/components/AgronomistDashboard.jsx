import React, { useState } from 'react';
import { 
  Microscope, 
  Sparkles, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Filter,
  Camera,
  Calendar,
  Layers,
  Save
} from 'lucide-react';
import { translations } from '../data/mockData';

export default function AgronomistDashboard({ bags, lang }) {
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [selectedPhotoBag, setSelectedPhotoBag] = useState(bags[1]); // Default to Bag A02 (Chlorosis)
  const [expertNote, setExpertNote] = useState('');
  const [savedNotes, setSavedNotes] = useState({});
  const [exportNotice, setExportNotice] = useState(null);

  const t = translations[lang];

  const filteredBags = bags.filter((b) => {
    if (selectedFilter === 'CHLOROSIS') return b.leafCondition === 'suspectedChlorosis';
    if (selectedFilter === 'NECROSIS') return b.leafCondition === 'necroticSpots';
    if (selectedFilter === 'HEALTHY') return b.leafCondition === 'healthyLeaf';
    return true;
  });

  const handleSaveNote = () => {
    if (!expertNote.trim()) return;
    setSavedNotes({
      ...savedNotes,
      [selectedPhotoBag.id]: expertNote
    });
    setExportNotice(lang === 'si' ? 'විශේෂඥ සටහන සාර්ථකව සුරකින ලදී!' : 'Agronomist audit note saved successfully!');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handleExportPDF = () => {
    setExportNotice(lang === 'si' ? 'PDF වාර්තාව සකස් කෙරේ... බාගත කිරීම ආරම්භ විය.' : 'Generating PDF Audit Report... Download started.');
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleExportCSV = () => {
    setExportNotice(lang === 'si' ? 'සංවේදක දත්ත CSV ගොනුව බාගත විය.' : 'Exported 8 Grow-Bag Telemetry Records to CSV.');
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner & Export Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Microscope className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              {lang === 'si' ? 'කෘෂි විද්‍යාඥ හා ශාක සෞඛ්‍ය පරීක්ෂණ අංශය' : 'Agronomist Foliar Inspection Portal'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'si'
              ? 'රෝවරයේ 5MP කැමරාවෙන් ලබාගත් පත්‍ර ඡායාරූප සහ AI මඟින් හඳුනාගත් රෝග ලක්ෂණ විශ්ලේෂණය.'
              : 'Review high-resolution canopy imagery captured by AgriScout rover and verify AI screening classifications.'}
          </p>
        </div>

        {/* Audit Report Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{lang === 'si' ? 'PDF වාර්තාව (Export)' : 'Export Audit PDF'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>{lang === 'si' ? 'CSV දත්ත' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Export Notification Toast */}
      {exportNotice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Main Workspace Grid: Photo Gallery on Left, Deep Diagnosis on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Gallery / Feed Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-white border text-slate-700'
              }`}
            >
              All Foliar Scans ({bags.length})
            </button>
            <button
              onClick={() => setSelectedFilter('CHLOROSIS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedFilter === 'CHLOROSIS' ? 'bg-amber-500 text-white' : 'bg-amber-50 border border-amber-200 text-amber-800'
              }`}
            >
              Chlorosis Flags
            </button>
            <button
              onClick={() => setSelectedFilter('NECROSIS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedFilter === 'NECROSIS' ? 'bg-rose-600 text-white' : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              Necrotic Spots
            </button>
            <button
              onClick={() => setSelectedFilter('HEALTHY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedFilter === 'HEALTHY' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              }`}
            >
              Healthy
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredBags.map((bag) => {
              const isSelected = selectedPhotoBag.id === bag.id;
              return (
                <div
                  key={bag.id}
                  onClick={() => {
                    setSelectedPhotoBag(bag);
                    setExpertNote(savedNotes[bag.id] || '');
                  }}
                  className={`bg-white rounded-xl border overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                    isSelected
                      ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="relative h-36 bg-slate-100 overflow-hidden">
                    <img 
                      src={bag.photoUrl} 
                      alt={bag.id} 
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-2xs px-2 py-0.5 rounded-md font-mono font-bold">
                      {bag.id}
                    </span>
                    <span className={`absolute bottom-2 right-2 text-2xs px-2 py-0.5 rounded-full font-bold shadow-xs ${
                      bag.leafCondition === 'healthyLeaf'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 text-white'
                    }`}>
                      {t[bag.leafCondition]}
                    </span>
                  </div>

                  <div className="p-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800">{bag.crop}</span>
                      <span className="text-emerald-700 font-bold">{bag.aiConfidence}% AI Conf.</span>
                    </div>
                    <div className="flex justify-between items-center text-2xs text-slate-500 mt-1">
                      <span>Row {bag.row}, Pos {bag.col}</span>
                      <span>{bag.lastInspected}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Deep Diagnosis Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-2xs font-extrabold text-emerald-700 uppercase tracking-wider">
                  Inspecting Leaf Sample
                </span>
                <h3 className="text-lg font-black text-slate-900">{selectedPhotoBag.id}</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">5MP Macro Focus</span>
            </div>

            {/* High-Res View */}
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
              <img 
                src={selectedPhotoBag.photoUrl} 
                alt="Detailed Leaf" 
                className="w-full h-56 object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-3 text-white text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold">{t[selectedPhotoBag.leafCondition]}</span>
                  <span className="text-emerald-400 font-mono font-bold">{selectedPhotoBag.aiConfidence}% Accuracy</span>
                </div>
              </div>
            </div>

            {/* Sensor Context for Agronomist */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-2xs">Substrate Moisture</span>
                <span className="font-bold text-slate-800">{selectedPhotoBag.moistureVwc}% VWC</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-2xs">Root Temperature</span>
                <span className="font-bold text-slate-800">{selectedPhotoBag.rootTemp} °C</span>
              </div>
            </div>

            {/* Specialist Diagnosis Notes */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                {lang === 'si' ? 'කෘෂි විද්‍යාඥ නිර්දේශය සහ ප්‍රතිකාර සටහන' : 'Agronomist Recommendation / Prescription'}
              </label>
              <textarea
                rows={3}
                value={expertNote}
                onChange={(e) => setExpertNote(e.target.value)}
                placeholder={lang === 'si' ? 'උදා: නයිට්‍රජන් පෝෂක මට්ටම වැඩි කරන්න හෝ මැග්නීසියම් ද්‍රාවණයක් යොදන්න...' : 'e.g. Foliar yellowing caused by root water deficit. Recommended micro-nutrient foliar spray...'}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-800"
              />
              <button
                onClick={handleSaveNote}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{lang === 'si' ? 'නිර්දේශය සුරකින්න' : 'Save Prescription to Audit Record'}</span>
              </button>
            </div>

            {savedNotes[selectedPhotoBag.id] && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                <span className="font-bold block">Current Audit Prescription:</span>
                <p className="mt-0.5">{savedNotes[selectedPhotoBag.id]}</p>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}

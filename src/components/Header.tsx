import React from 'react';
import { ActiveTab } from '../types';
import { MapPin, Triangle, Grid, History, FileText } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  savedCount: number;
  onOpenSavedModal: () => void;
  onOpenReportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  onOpenSavedModal,
  onOpenReportModal,
}) => {
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-5 gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Grid className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-light tracking-tight text-slate-900 uppercase">
                  TakarTanah <span className="font-bold">v1.0</span>
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                  Presisi
                </span>
              </div>
              <p className="text-[11px] text-slate-400 uppercase tracking-widest mt-0.5 font-medium">
                Alat Ukur Luas Lahan Mandiri • Koordinat &amp; Triangulasi
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white text-slate-700 border border-slate-300 rounded-md shadow-xs uppercase tracking-wider hover:bg-slate-50 transition"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Export PDF / Cetak</span>
            </button>

            <button
              onClick={onOpenSavedModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-900 text-white rounded-md shadow-xs uppercase tracking-wider hover:bg-slate-800 transition"
            >
              <History className="w-3.5 h-3.5 text-slate-300" />
              <span>Riwayat Projek ({savedCount})</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto no-scrollbar border-t border-slate-100 py-2.5 gap-1.5">
          <button
            onClick={() => setActiveTab('coordinate')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition whitespace-nowrap ${
              activeTab === 'coordinate'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>1. Titik Koordinat (Shoelace)</span>
          </button>

          <button
            onClick={() => setActiveTab('quad_diagonal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition whitespace-nowrap ${
              activeTab === 'quad_diagonal'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>2. Segiempat + Diagonal</span>
          </button>

          <button
            onClick={() => setActiveTab('triangulation')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition whitespace-nowrap ${
              activeTab === 'triangulation'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Triangle className="w-3.5 h-3.5" />
            <span>3. Segitiga Bebas (Heron)</span>
          </button>
        </div>
      </div>
    </header>
  );
};


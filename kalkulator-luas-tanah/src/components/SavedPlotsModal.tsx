import React from 'react';
import { LandPlotRecord } from '../types';
import { formatNumber } from '../utils/units';
import { History, Trash2, ExternalLink, Calendar, User } from 'lucide-react';

interface SavedPlotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedPlots: LandPlotRecord[];
  onLoadPlot: (plot: LandPlotRecord) => void;
  onDeletePlot: (id: string) => void;
  onClearAll: () => void;
}

export const SavedPlotsModal: React.FC<SavedPlotsModalProps> = ({
  isOpen,
  onClose,
  savedPlots,
  onLoadPlot,
  onDeletePlot,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-md max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[85vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-900" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Riwayat Pengukuran Tersimpan</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 text-sm font-bold">
            ✕
          </button>
        </div>

        {/* Modal Body List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {savedPlots.length === 0 ? (
            <div className="text-center py-10 text-slate-500 space-y-2">
              <p className="text-xs">Belum ada riwayat pengukuran tanah yang disimpan.</p>
              <p className="text-[11px] text-slate-400">Klik tombol "Simpan Lahan" di bagian bawah hasil kalkulasi untuk menyimpan.</p>
            </div>
          ) : (
            savedPlots.map((plot) => (
              <div
                key={plot.id}
                className="bg-slate-50 border border-slate-200 rounded-md p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-300 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{plot.title}</h4>
                    <span className="text-[10px] font-semibold bg-slate-200 text-slate-800 border border-slate-300 px-2 py-0.5 rounded uppercase tracking-wider">
                      {plot.method === 'coordinate'
                        ? 'Koordinat'
                        : plot.method === 'quad_diagonal'
                        ? 'Segiempat'
                        : 'Triangulasi'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    {plot.ownerName && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" /> {plot.ownerName}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" /> {plot.date}
                    </span>
                  </div>

                  {plot.notes && <p className="text-[11px] text-slate-500 italic">"{plot.notes}"</p>}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900">
                      {formatNumber(plot.totalAreaM2, 2)} m²
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block">
                      ≈ {formatNumber(plot.totalAreaM2 / 14.0625, 2)} Ru
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      onLoadPlot(plot);
                      onClose();
                    }}
                    className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-semibold text-xs uppercase tracking-wider flex items-center gap-1 transition shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Buka
                  </button>

                  <button
                    onClick={() => onDeletePlot(plot.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        {savedPlots.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <button
              onClick={onClearAll}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold uppercase tracking-wider flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Hapus Semua Riwayat
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-md"
            >
              Tutup
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


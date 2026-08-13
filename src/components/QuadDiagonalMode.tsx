import React from 'react';
import { QuadTriangulationData } from '../types';
import { PRESET_QUADS } from '../data/presets';
import { Grid, CheckCircle2, AlertCircle } from 'lucide-react';

interface QuadDiagonalModeProps {
  quadData: QuadTriangulationData;
  setQuadData: React.Dispatch<React.SetStateAction<QuadTriangulationData>>;
  solverResult: {
    isValid: boolean;
    errorMessage?: string;
    area1: number;
    area2: number;
  };
}

export const QuadDiagonalMode: React.FC<QuadDiagonalModeProps> = ({
  quadData,
  setQuadData,
  solverResult,
}) => {
  const handleChange = (field: keyof QuadTriangulationData, valStr: string) => {
    const val = parseFloat(valStr);
    setQuadData((prev) => ({
      ...prev,
      [field]: isNaN(val) ? 0 : val,
    }));
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = PRESET_QUADS.find((p) => p.id === presetId);
    if (preset) {
      setQuadData(preset.data);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Info */}
      <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-slate-900 text-white rounded-md shrink-0 mt-0.5">
              <Grid className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Metode Segiempat + 1 Diagonal Bentangan</h3>
              <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                Pengukuran paling umum di lapangan menggunakan meteran fisik. Cukup ukur 4 sisi luar tanah dan 1 bentangan garis diagonal tengah.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider shrink-0">Contoh Data:</label>
            <select
              onChange={(e) => handleLoadPreset(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-medium rounded-md py-2 px-3 focus:bg-white focus:border-slate-900 focus:outline-none transition"
              defaultValue=""
            >
              <option value="" disabled>
                -- Pilih Contoh --
              </option>
              {PRESET_QUADS.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Form Inputs */}
      <div className="bg-white border border-slate-200 rounded-md p-5 shadow-xs space-y-5">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
          <span className="w-2 h-2 rounded-full bg-slate-900"></span>
          Input Hasil Ukur Meteran Sisi &amp; Diagonal
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Sisi AB */}
          <div className="bg-slate-50 p-3.5 rounded-md border border-slate-200">
            <label className="block text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1">Sisi AB (Depan - m)</label>
            <input
              type="number"
              step="any"
              min="0"
              value={quadData.sideAB || ''}
              onChange={(e) => handleChange('sideAB', e.target.value)}
              placeholder="0.0"
              className="w-full bg-white border border-slate-300 focus:border-slate-900 rounded-md py-2 px-3 text-xs text-slate-800 font-mono focus:outline-none transition"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Jarak Patok A ke Patok B</span>
          </div>

          {/* Sisi BC */}
          <div className="bg-slate-50 p-3.5 rounded-md border border-slate-200">
            <label className="block text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1">Sisi BC (Kanan - m)</label>
            <input
              type="number"
              step="any"
              min="0"
              value={quadData.sideBC || ''}
              onChange={(e) => handleChange('sideBC', e.target.value)}
              placeholder="0.0"
              className="w-full bg-white border border-slate-300 focus:border-slate-900 rounded-md py-2 px-3 text-xs text-slate-800 font-mono focus:outline-none transition"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Jarak Patok B ke Patok C</span>
          </div>

          {/* Sisi CD */}
          <div className="bg-slate-50 p-3.5 rounded-md border border-slate-200">
            <label className="block text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1">Sisi CD (Belakang - m)</label>
            <input
              type="number"
              step="any"
              min="0"
              value={quadData.sideCD || ''}
              onChange={(e) => handleChange('sideCD', e.target.value)}
              placeholder="0.0"
              className="w-full bg-white border border-slate-300 focus:border-slate-900 rounded-md py-2 px-3 text-xs text-slate-800 font-mono focus:outline-none transition"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Jarak Patok C ke Patok D</span>
          </div>

          {/* Sisi DA */}
          <div className="bg-slate-50 p-3.5 rounded-md border border-slate-200">
            <label className="block text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1">Sisi DA (Kiri - m)</label>
            <input
              type="number"
              step="any"
              min="0"
              value={quadData.sideDA || ''}
              onChange={(e) => handleChange('sideDA', e.target.value)}
              placeholder="0.0"
              className="w-full bg-white border border-slate-300 focus:border-slate-900 rounded-md py-2 px-3 text-xs text-slate-800 font-mono focus:outline-none transition"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Jarak Patok D ke Patok A</span>
          </div>

          {/* Diagonal AC */}
          <div className="bg-slate-100 p-3.5 rounded-md border border-slate-300 sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1">
              Diagonal AC (Bentangan Silang Patok A ke C - m)
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={quadData.diagonalAC || ''}
              onChange={(e) => handleChange('diagonalAC', e.target.value)}
              placeholder="0.0"
              className="w-full bg-white border border-slate-400 focus:border-slate-900 rounded-md py-2 px-3 text-xs text-slate-800 font-mono focus:outline-none transition"
            />
            <span className="text-[10px] text-slate-600 mt-1 block font-medium">
              Sangat penting untuk mengunci bentuk 2 segitiga: △ABC dan △ADC
            </span>
          </div>
        </div>

        {/* Validation & Triangles Results Breakdown */}
        {solverResult.isValid ? (
          <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Pengukuran Valid &amp; Dapat Membentuk Segiempat</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white border border-slate-200 rounded-md p-3 shadow-xs">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">1. Luas Segitiga ABC (AB, BC, AC)</span>
                <p className="text-lg font-semibold text-slate-900 mt-1">{solverResult.area1.toFixed(2)} m²</p>
                <p className="text-[10px] font-semibold text-slate-500 uppercase">
                  ≈ {(solverResult.area1 / 14.0625).toFixed(2)} Ru
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-md p-3 shadow-xs">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">2. Luas Segitiga ADC (CD, DA, AC)</span>
                <p className="text-lg font-semibold text-slate-900 mt-1">{solverResult.area2.toFixed(2)} m²</p>
                <p className="text-[10px] font-semibold text-slate-500 uppercase">
                  ≈ {(solverResult.area2 / 14.0625).toFixed(2)} Ru
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-rose-50 border border-rose-200 rounded-md p-4 flex items-start gap-3 text-rose-900 text-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-950 uppercase tracking-wider">Ukuran Tidak Memenuhi Syarat Segitiga</p>
              <p className="mt-1 text-rose-800">{solverResult.errorMessage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


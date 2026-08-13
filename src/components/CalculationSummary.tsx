import React, { useState } from 'react';
import { LandCalculationResult } from '../types';
import { getAllUnitValues, formatNumber, formatCurrencyIDR } from '../utils/units';
import { Calculator, DollarSign, Ruler, Layers, Save, CheckCircle2, AlertTriangle } from 'lucide-react';

interface CalculationSummaryProps {
  result: LandCalculationResult;
  hasSelfIntersection?: boolean;
  pricePerM2: number;
  setPricePerM2: (price: number) => void;
  priceUnit: 'm2' | 'ru';
  setPriceUnit: (unit: 'm2' | 'ru') => void;
  onSavePlot: (title: string, ownerName: string, notes: string) => void;
}

export const CalculationSummary: React.FC<CalculationSummaryProps> = ({
  result,
  hasSelfIntersection,
  pricePerM2,
  setPricePerM2,
  priceUnit,
  setPriceUnit,
  onSavePlot,
}) => {
  const [plotTitle, setPlotTitle] = useState<string>('');
  const [ownerName, setOwnerName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSavedSuccess, setIsSavedSuccess] = useState<boolean>(false);
  const [showSaveForm, setShowSaveForm] = useState<boolean>(false);

  const unitValues = getAllUnitValues(result.totalAreaM2);

  // Price calculations
  const effectivePricePerM2 = priceUnit === 'ru' ? pricePerM2 / 14.0625 : pricePerM2;
  const totalPriceIDR = result.totalAreaM2 * effectivePricePerM2;

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plotTitle.trim()) return;
    onSavePlot(plotTitle, ownerName, notes);
    setIsSavedSuccess(true);
    setTimeout(() => {
      setIsSavedSuccess(false);
      setShowSaveForm(false);
      setPlotTitle('');
      setNotes('');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Warning for self-intersecting polygon */}
      {hasSelfIntersection && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3.5 flex items-start gap-3 text-amber-900 text-xs shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-950 uppercase tracking-wide">Peringatan: Garis Batas Bersiangan (Self-Intersecting)</p>
            <p className="mt-0.5 text-amber-800">
              Garis sisi tanah saling berpotongan. Pastikan urutan titik koordinat berurutan melingkar (searah atau berlawanan jarum jam) agar hasil luas akurat.
            </p>
          </div>
        </div>
      )}

      {/* Main Result Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Unit 1: Meter Persegi */}
        <div className="bg-white border border-slate-200 rounded-md p-4 flex flex-col justify-between shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-slate-900"></div>
          <div>
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
              <span>Luas (Meter Persegi)</span>
              <span className="text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded text-[10px] border border-slate-200">Utama</span>
            </div>
            <div className="mt-3 text-2xl font-light text-slate-900 tracking-tight">
              <span className="font-semibold">{formatNumber(result.totalAreaM2, 2)}</span>{' '}
              <span className="text-xs font-medium text-slate-500 uppercase">m²</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 font-medium uppercase tracking-wider">Standar Pengukuran BPN / Sertifikat</p>
        </div>

        {/* Unit 2: Ru / Ubin / Tumbak */}
        <div className="bg-white border border-slate-200 rounded-md p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
              <span>Luas (Ru / Ubin)</span>
              <span className="text-slate-600 font-bold text-[10px] bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">1 Ru = 14.06 m²</span>
            </div>
            <div className="mt-3 text-2xl font-light text-slate-900 tracking-tight">
              <span className="font-semibold">{formatNumber(unitValues.find((u) => u.unit === 'ru')?.value || 0, 2)}</span>{' '}
              <span className="text-xs font-medium text-slate-500 uppercase">Ru</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 font-medium uppercase tracking-wider">Satuan Lokal Tradisional (Jawa/Sunda)</p>
        </div>

        {/* Unit 3: Hektar / Are */}
        <div className="bg-white border border-slate-200 rounded-md p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
              <span>Luas (Hektar &amp; Are)</span>
              <span className="text-slate-600 font-bold text-[10px] bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">1 ha = 10.000 m²</span>
            </div>
            <div className="mt-3 text-xl font-light text-slate-900 tracking-tight">
              <span className="font-semibold">{formatNumber(unitValues.find((u) => u.unit === 'ha')?.value || 0, 4)}</span>{' '}
              <span className="text-xs font-medium text-slate-500 uppercase">ha</span>
              <span className="text-slate-300 mx-1.5">/</span>
              <span className="font-semibold">{formatNumber(unitValues.find((u) => u.unit === 'are')?.value || 0, 2)}</span>{' '}
              <span className="text-xs font-medium text-slate-500 uppercase">Are</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 font-medium uppercase tracking-wider">Lahan Pertanian / Kebun Broad Area</p>
        </div>

        {/* Perimeter / Keliling */}
        <div className="bg-white border border-slate-200 rounded-md p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
              <span>Total Keliling Lahan</span>
              <Ruler className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="mt-3 text-2xl font-light text-slate-900 tracking-tight">
              <span className="font-semibold">{formatNumber(result.perimeterM, 2)}</span>{' '}
              <span className="text-xs font-medium text-slate-500 uppercase">Meter</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 font-medium uppercase tracking-wider">Panjang Pagar / Batas Keliling Outer</p>
        </div>
      </div>

      {/* Estimator Harga Tanah */}
      <div className="bg-white border border-slate-200 rounded-md p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <DollarSign className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Estimasi Nilai &amp; Harga Lahan</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Satuan Harga Input
            </label>
            <div className="flex rounded-md bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setPriceUnit('m2')}
                className={`flex-1 py-1.5 text-xs font-semibold uppercase tracking-wider rounded transition ${
                  priceUnit === 'm2'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rp / Meter² (m²)
              </button>
              <button
                type="button"
                onClick={() => setPriceUnit('ru')}
                className={`flex-1 py-1.5 text-xs font-semibold uppercase tracking-wider rounded transition ${
                  priceUnit === 'ru'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rp / Ru (Ubin)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Harga per {priceUnit === 'm2' ? 'Meter² (m²)' : 'Ru (14.06 m²)'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Rp</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={pricePerM2 || ''}
                onChange={(e) => setPricePerM2(parseFloat(e.target.value) || 0)}
                placeholder="Contoh: 250000"
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-slate-900 rounded-md py-2 pl-9 pr-3 text-xs font-medium text-slate-800 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-md p-3.5 flex flex-col justify-center shadow-xs">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-400">Total Estimasi Nilai Lahan</span>
            <span className="text-xl font-semibold tracking-tight mt-0.5 text-white">
              {formatCurrencyIDR(totalPriceIDR)}
            </span>
          </div>
        </div>
      </div>

      {/* Sides & Angles Breakdown Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sides Table */}
        <div className="bg-white border border-slate-200 rounded-md p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5 text-slate-600" />
              Panjang Sisi Lahan
            </h4>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{result.sides.length} Sisi</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Sisi</th>
                  <th className="py-2 px-3">Panjang (Meter)</th>
                  <th className="py-2 px-3 text-right">% Keliling</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.sides.map((side, idx) => {
                  const pct = result.perimeterM > 0 ? (side.length / result.perimeterM) * 100 : 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        Sisi {side.from}-{side.to}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-800">{formatNumber(side.length, 2)} m</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-500">{pct.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Angles Table or Triangles Breakdown */}
        {result.trianglesBreakdown ? (
          <div className="bg-white border border-slate-200 rounded-md p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-600" />
                Rincian Pembagian Segitiga
              </h4>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{result.trianglesBreakdown.length} Segitiga</span>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {result.trianglesBreakdown.map((tri, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200 rounded-md p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">{tri.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Sisi: {tri.sides[0]}m, {tri.sides[1]}m, {tri.sides[2]}m
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900">{formatNumber(tri.areaM2, 2)} m²</p>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase">
                      {formatNumber(tri.areaM2 / 14.0625, 2)} Ru
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-md p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-slate-600" />
                Besar Sudut Interior (Perkiraan)
              </h4>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{result.angles?.length || 0} Sudut</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Sudut</th>
                    <th className="py-2 px-3">Besar Sudut (Derajat)</th>
                    <th className="py-2 px-3 text-right">Kategori</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.angles?.map((ang, idx) => {
                    let type = 'Lancip';
                    if (ang.angleDegrees === 90) type = 'Siku-Siku';
                    else if (ang.angleDegrees > 90 && ang.angleDegrees < 180) type = 'Tumpul';
                    else if (ang.angleDegrees >= 180) type = 'Refleks';

                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="py-2 px-3 font-semibold text-slate-900">Sudut {ang.vertex}</td>
                        <td className="py-2 px-3 font-mono text-slate-800">{ang.angleDegrees}°</td>
                        <td className="py-2 px-3 text-right text-slate-500 font-medium">{type}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Save Plot Action Box */}
      <div className="bg-white border border-slate-200 rounded-md p-5 shadow-xs">
        {!showSaveForm ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Save className="w-4 h-4 text-slate-700" />
                Simpan Hasil Pengukuran Lahan Ini
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Simpan ke memori lokal browser untuk dibuka kembali atau dicetak nanti.
              </p>
            </div>
            <button
              onClick={() => setShowSaveForm(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md uppercase tracking-wider transition shadow-xs whitespace-nowrap"
            >
              + Simpan Lahan
            </button>
          </div>
        ) : (
          <form onSubmit={handleSaveSubmit} className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Formulir Simpan Lahan
              </h4>
              <button
                type="button"
                onClick={() => setShowSaveForm(false)}
                className="text-xs text-slate-400 hover:text-slate-900 uppercase font-semibold tracking-wider"
              >
                Batal
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Nama Lahan / Judul <span className="text-slate-900">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={plotTitle}
                  onChange={(e) => setPlotTitle(e.target.value)}
                  placeholder="Contoh: Sawah Utara Blok A"
                  className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-slate-900 rounded-md py-2 px-3 text-xs text-slate-800 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Nama Pemilik / Lokasi (Opsional)
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Contoh: Pak Budi - Desa Sukamaju"
                  className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-slate-900 rounded-md py-2 px-3 text-xs text-slate-800 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Catatan Tambahan</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan batas lahan, patok kayu, atau keterangan lain..."
                className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-slate-900 rounded-md py-2 px-3 text-xs text-slate-800 focus:outline-none resize-none transition"
              ></textarea>
            </div>

            <div className="flex items-center gap-3 justify-end">
              {isSavedSuccess && (
                <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Berhasil Disimpan!
                </span>
              )}
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md uppercase tracking-wider transition shadow-xs"
              >
                Simpan
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};


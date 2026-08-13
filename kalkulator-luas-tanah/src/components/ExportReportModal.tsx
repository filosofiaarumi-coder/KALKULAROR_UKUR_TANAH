import React, { useState } from 'react';
import { LandCalculationResult } from '../types';
import { formatNumber, formatCurrencyIDR, getAllUnitValues } from '../utils/units';
import { Printer } from 'lucide-react';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: LandCalculationResult;
  methodName: string;
  pricePerM2: number;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  result,
  methodName,
  pricePerM2,
}) => {
  const [reportTitle, setReportTitle] = useState<string>('Laporan Pengukuran Luas Tanah');
  const [ownerName, setOwnerName] = useState<string>('');
  const [locationName, setLocationName] = useState<string>('');
  const [surveyorName, setSurveyorName] = useState<string>('');

  if (!isOpen) return null;

  const unitValues = getAllUnitValues(result.totalAreaM2);
  const totalPriceIDR = result.totalAreaM2 * pricePerM2;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-md max-w-3xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header Controls */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-slate-900" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Pratinjau Cetak Laporan Pengukuran</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold uppercase tracking-wider text-xs rounded-md shadow-xs flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Cetak / Simpan PDF
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-900 text-sm font-bold ml-2">
              ✕
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto space-y-6 bg-slate-50 p-6 rounded-md border border-slate-200 text-slate-800 id-print-container">
          {/* Form Editable Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:hidden border-b border-slate-200 pb-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-0.5">Judul Laporan</label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md py-1 px-2 text-xs text-slate-800 focus:outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-0.5">Nama Pemilik Tanah</label>
              <input
                type="text"
                placeholder="Contoh: Bpk. H. Ahmad"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md py-1 px-2 text-xs text-slate-800 focus:outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-0.5">Lokasi / Alamat Lahan</label>
              <input
                type="text"
                placeholder="Contoh: Desa Sukamaju RT 02/05"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md py-1 px-2 text-xs text-slate-800 focus:outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-0.5">Petugas Pengukur (Surveyor)</label>
              <input
                type="text"
                placeholder="Contoh: Tim Pengukur Mandiri"
                value={surveyorName}
                onChange={(e) => setSurveyorName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md py-1 px-2 text-xs text-slate-800 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          {/* Printable Report Document Card */}
          <div className="space-y-6 bg-white p-6 rounded-md border border-slate-200 shadow-xs print:shadow-none print:border-none print:text-black">
            {/* Header Document */}
            <div className="text-center border-b-2 border-slate-900 pb-4">
              <h2 className="text-base font-bold uppercase tracking-wider text-slate-900">{reportTitle}</h2>
              <p className="text-xs text-slate-600 mt-1">
                Kalkulasi Presisi Luas Tanah Tidak Beraturan ({methodName})
              </p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                Tanggal: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Info Table */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-md border border-slate-200">
              <div>
                <span className="text-slate-500 uppercase tracking-wider text-[10px] block font-semibold">Pemilik Tanah:</span>
                <span className="text-slate-900 font-bold">{ownerName || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase tracking-wider text-[10px] block font-semibold">Lokasi Lahan:</span>
                <span className="text-slate-900 font-bold">{locationName || '-'}</span>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-md">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Luas (Meter²)</span>
                <span className="text-base font-bold text-slate-900">{formatNumber(result.totalAreaM2, 2)} m²</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-md">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Luas (Ru / Ubin)</span>
                <span className="text-base font-bold text-slate-900">
                  {formatNumber(unitValues.find((u) => u.unit === 'ru')?.value || 0, 2)} Ru
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-md">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Luas (Hektar)</span>
                <span className="text-base font-bold text-slate-900">
                  {formatNumber(unitValues.find((u) => u.unit === 'ha')?.value || 0, 4)} ha
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-md">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Total Keliling</span>
                <span className="text-base font-bold text-slate-900">{formatNumber(result.perimeterM, 2)} m</span>
              </div>
            </div>

            {pricePerM2 > 0 && (
              <div className="bg-slate-50 p-3 rounded-md border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-500 uppercase tracking-wider text-[10px] block">Estimasi Harga (Rp {formatNumber(pricePerM2)}/m²):</span>
                  <span className="text-base font-bold text-slate-900">{formatCurrencyIDR(totalPriceIDR)}</span>
                </div>
              </div>
            )}

            {/* Side Measurements List */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">Rincian Bentangan Sisi Tanah:</h4>
              <table className="w-full text-left text-xs text-slate-800 border border-slate-200">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2 px-3">Sisi</th>
                    <th className="py-2 px-3">Panjang Sisi (Meter)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {result.sides.map((side, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 px-3 font-bold text-slate-900">Sisi {side.from}-{side.to}</td>
                      <td className="py-1.5 px-3">{formatNumber(side.length, 2)} meter</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signature Block for Printing */}
            <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
              <div>
                <p className="text-slate-500 uppercase tracking-wider text-[10px]">Pemilik / Penanggung Jawab Tanah</p>
                <div className="h-16"></div>
                <p className="font-bold underline text-slate-900">{ownerName || '( .................................... )'}</p>
              </div>

              <div>
                <p className="text-slate-500 uppercase tracking-wider text-[10px]">Petugas Pengukur</p>
                <div className="h-16"></div>
                <p className="font-bold underline text-slate-900">{surveyorName || '( .................................... )'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


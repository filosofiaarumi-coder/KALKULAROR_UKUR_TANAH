import React, { useState } from 'react';
import { Point2D } from '../types';
import { generatePointName } from '../utils/geometry';
import { PRESET_COORDINATES } from '../data/presets';
import { Plus, Trash2, ArrowUp, ArrowDown, Download, Upload, FileCode2 } from 'lucide-react';

interface CoordinateModeProps {
  points: Point2D[];
  setPoints: React.Dispatch<React.SetStateAction<Point2D[]>>;
  activePointId: string | null;
  setActivePointId: (id: string | null) => void;
}

export const CoordinateMode: React.FC<CoordinateModeProps> = ({
  points,
  setPoints,
  activePointId,
  setActivePointId,
}) => {
  const [newX, setNewX] = useState<string>('');
  const [newY, setNewY] = useState<string>('');
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importText, setImportText] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);

  const handleAddPoint = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const x = parseFloat(newX);
    const y = parseFloat(newY);

    if (isNaN(x) || isNaN(y)) return;

    const newPointName = generatePointName(points.length);
    const newPoint: Point2D = {
      id: `pt-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: newPointName,
      x,
      y,
    };

    setPoints([...points, newPoint]);
    setNewX('');
    setNewY('');
  };

  const handleUpdatePoint = (id: string, field: 'x' | 'y', valStr: string) => {
    const val = parseFloat(valStr);
    setPoints((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            [field]: isNaN(val) ? 0 : val,
          };
        }
        return p;
      })
    );
  };

  const handleDeletePoint = (id: string) => {
    if (points.length <= 3) {
      alert('Minimal 3 titik diperlukan untuk membentuk bidang tanah.');
      return;
    }
    const filtered = points.filter((p) => p.id !== id);
    // Renumber point names A, B, C...
    const renamed = filtered.map((p, idx) => ({
      ...p,
      name: generatePointName(idx),
    }));
    setPoints(renamed);
  };

  const handleMovePoint = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= points.length) return;

    const newArr = [...points];
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;

    // Renumber names
    const renamed = newArr.map((p, idx) => ({
      ...p,
      name: generatePointName(idx),
    }));

    setPoints(renamed);
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = PRESET_COORDINATES.find((p) => p.id === presetId);
    if (preset) {
      setPoints(preset.points);
    }
  };

  const handleProcessImport = () => {
    try {
      setImportError(null);
      const lines = importText.split('\n').filter((l) => l.trim().length > 0);
      const parsedPoints: Point2D[] = [];

      lines.forEach((line, idx) => {
        const parts = line.split(/[,;\s]+/).filter(Boolean);
        if (parts.length >= 2) {
          const x = parseFloat(parts[0]);
          const y = parseFloat(parts[1]);
          if (!isNaN(x) && !isNaN(y)) {
            parsedPoints.push({
              id: `pt-imp-${idx}-${Date.now()}`,
              name: generatePointName(parsedPoints.length),
              x,
              y,
            });
          }
        }
      });

      if (parsedPoints.length < 3) {
        setImportError('Gagal impor: Membutuhkan minimal 3 baris koordinat (X, Y) yang valid.');
        return;
      }

      setPoints(parsedPoints);
      setShowImportModal(false);
      setImportText('');
    } catch (err) {
      setImportError('Terjadi kesalahan saat memproses teks koordinat.');
    }
  };

  const handleExportCSV = () => {
    const csvHeader = 'Name,X_Meters,Y_Meters\n';
    const csvRows = points.map((p) => `${p.name},${p.x},${p.y}`).join('\n');
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `koordinat-tanah-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Top Presets & Utility Controls */}
      <div className="bg-white border border-slate-200 rounded-md p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 flex-1">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider shrink-0">Contoh Lahan:</label>
          <select
            onChange={(e) => handleLoadPreset(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-md py-2 px-3 focus:bg-white focus:border-slate-900 focus:outline-none w-full max-w-xs font-medium transition"
            defaultValue=""
          >
            <option value="" disabled>
              -- Pilih Contoh Bentuk Tanah --
            </option>
            {PRESET_COORDINATES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-md bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-xs transition"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>Impor Teks / CSV</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-md bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Points Table */}
      <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Daftar Titik Koordinat (Meter)</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Masukkan koordinat X (Timur) dan Y (Utara) tiap patok tanah</p>
          </div>
          <span className="text-[11px] font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md uppercase tracking-wider">
            {points.length} Titik
          </span>
        </div>

        {/* Form Add New Point */}
        <form onSubmit={handleAddPoint} className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4 bg-slate-50 p-3 rounded-md border border-slate-200">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-0.5">Koordinat X (m)</label>
            <input
              type="number"
              step="any"
              placeholder="0.0"
              value={newX}
              onChange={(e) => setNewX(e.target.value)}
              className="w-full bg-white border border-slate-300 focus:border-slate-900 rounded-md py-1.5 px-2.5 text-xs text-slate-800 font-mono focus:outline-none transition"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-0.5">Koordinat Y (m)</label>
            <input
              type="number"
              step="any"
              placeholder="0.0"
              value={newY}
              onChange={(e) => setNewY(e.target.value)}
              className="w-full bg-white border border-slate-300 focus:border-slate-900 rounded-md py-1.5 px-2.5 text-xs text-slate-800 font-mono focus:outline-none transition"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold uppercase tracking-wider text-xs rounded-md transition flex items-center justify-center gap-1 shadow-xs"
            >
              <Plus className="w-4 h-4" /> Tambah Titik ({generatePointName(points.length)})
            </button>
          </div>
        </form>

        {/* Coordinates List */}
        <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-[10px] uppercase tracking-wider border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3">Titik</th>
                <th className="py-2.5 px-3">X (Timur - m)</th>
                <th className="py-2.5 px-3">Y (Utara - m)</th>
                <th className="py-2.5 px-3 text-center">Urutan</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {points.map((p, idx) => {
                const isSelected = activePointId === p.id;
                return (
                  <tr
                    key={p.id}
                    onClick={() => setActivePointId(p.id)}
                    className={`transition cursor-pointer ${
                      isSelected ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2 px-3 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                        {p.name}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        step="any"
                        value={p.x}
                        onChange={(e) => handleUpdatePoint(p.id, 'x', e.target.value)}
                        className="w-24 bg-white border border-slate-300 focus:border-slate-900 rounded py-1 px-2 text-xs text-slate-800 font-mono focus:outline-none transition"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        step="any"
                        value={p.y}
                        onChange={(e) => handleUpdatePoint(p.id, 'y', e.target.value)}
                        className="w-24 bg-white border border-slate-300 focus:border-slate-900 rounded py-1 px-2 text-xs text-slate-800 font-mono focus:outline-none transition"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMovePoint(idx, 'up');
                          }}
                          disabled={idx === 0}
                          className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded disabled:opacity-30"
                          title="Naikkan Urutan"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMovePoint(idx, 'down');
                          }}
                          disabled={idx === points.length - 1}
                          className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded disabled:opacity-30"
                          title="Turunkan Urutan"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePoint(p.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                        title="Hapus Titik"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-slate-700" />
                Impor Titik Koordinat Teks / CSV
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-900 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Tempel koordinat tanah per baris. Format: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-900 font-mono border border-slate-200">X, Y</code> (contoh: <code>10.5, 20.2</code>).
            </p>

            <textarea
              rows={6}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={`0, 0\n12.5, 0.8\n14.2, 18.5\n-1.2, 16.0`}
              className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-slate-900 rounded-md p-3 text-xs font-mono text-slate-800 focus:outline-none transition"
            ></textarea>

            {importError && (
              <p className="text-xs font-semibold text-rose-700 bg-rose-50 p-2.5 rounded-md border border-rose-200">
                {importError}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleProcessImport}
                className="px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-white rounded-md shadow-xs"
              >
                Terapkan Impor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


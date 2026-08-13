import React, { useState } from 'react';
import { TriangleData } from '../types';
import { calculateHeronArea, isValidTriangle } from '../utils/geometry';
import { PRESET_TRIANGLES } from '../data/presets';
import { Triangle, Plus, Trash2, AlertCircle } from 'lucide-react';

interface TriangulationModeProps {
  triangles: TriangleData[];
  setTriangles: React.Dispatch<React.SetStateAction<TriangleData[]>>;
}

export const TriangulationMode: React.FC<TriangulationModeProps> = ({
  triangles,
  setTriangles,
}) => {
  const [name, setName] = useState<string>('');
  const [sideA, setSideA] = useState<string>('');
  const [sideB, setSideB] = useState<string>('');
  const [sideC, setSideC] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleAddTriangle = (e: React.FormEvent) => {
    e.preventDefault();
    const a = parseFloat(sideA);
    const b = parseFloat(sideB);
    const c = parseFloat(sideC);

    if (isNaN(a) || isNaN(b) || isNaN(c)) return;

    const valid = isValidTriangle(a, b, c);
    const area = valid ? calculateHeronArea(a, b, c) : 0;

    const newTri: TriangleData = {
      id: `tri-${Date.now()}`,
      name: name.trim() || `Segitiga ${triangles.length + 1}`,
      sideA: a,
      sideB: b,
      sideC: c,
      isValid: valid,
      area,
      notes: notes.trim(),
    };

    setTriangles([...triangles, newTri]);
    setName('');
    setSideA('');
    setSideB('');
    setSideC('');
    setNotes('');
  };

  const handleUpdateTriangle = (id: string, field: keyof TriangleData, valStr: string) => {
    setTriangles((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const numVal = parseFloat(valStr);
          const updated = {
            ...t,
            [field]: isNaN(numVal) ? valStr : numVal,
          };

          const valid = isValidTriangle(updated.sideA, updated.sideB, updated.sideC);
          const area = valid ? calculateHeronArea(updated.sideA, updated.sideB, updated.sideC) : 0;

          return {
            ...updated,
            isValid: valid,
            area,
          };
        }
        return t;
      })
    );
  };

  const handleDeleteTriangle = (id: string) => {
    if (triangles.length <= 1) {
      alert('Minimal 1 segitiga.');
      return;
    }
    setTriangles(triangles.filter((t) => t.id !== id));
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = PRESET_TRIANGLES.find((p) => p.id === presetId);
    if (preset) {
      setTriangles(preset.triangles);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-slate-900 text-white rounded-md shrink-0 mt-0.5">
              <Triangle className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Metode Triangulasi Bebas (Formula Heron)</h3>
              <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                Pembagian bidang tanah menjadi beberapa potongan segitiga. Masukkan panjang 3 sisi untuk setiap bagian segitiga.
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
              {PRESET_TRIANGLES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Form Add Triangle */}
      <div className="bg-white border border-slate-200 rounded-md p-5 shadow-xs space-y-4">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
          <Plus className="w-4 h-4 text-slate-900" />
          Tambah Potongan Segitiga Baru
        </h4>

        <form onSubmit={handleAddTriangle} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div className="md:col-span-1">
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Nama Segitiga</label>
            <input
              type="text"
              placeholder={`Segitiga ${triangles.length + 1}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-slate-900 rounded-md py-2 px-3 text-xs text-slate-800 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Sisi A (meter)</label>
            <input
              type="number"
              step="any"
              required
              placeholder="0.0"
              value={sideA}
              onChange={(e) => setSideA(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-slate-900 rounded-md py-2 px-3 text-xs text-slate-800 font-mono focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Sisi B (meter)</label>
            <input
              type="number"
              step="any"
              required
              placeholder="0.0"
              value={sideB}
              onChange={(e) => setSideB(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-slate-900 rounded-md py-2 px-3 text-xs text-slate-800 font-mono focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Sisi C (meter)</label>
            <input
              type="number"
              step="any"
              required
              placeholder="0.0"
              value={sideC}
              onChange={(e) => setSideC(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-slate-900 rounded-md py-2 px-3 text-xs text-slate-800 font-mono focus:outline-none transition"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold uppercase tracking-wider text-xs rounded-md transition shadow-xs flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" /> Tambah
            </button>
          </div>
        </form>
      </div>

      {/* Triangles List */}
      <div className="bg-white border border-slate-200 rounded-md p-5 shadow-xs space-y-4">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between pb-2 border-b border-slate-100">
          <span>Daftar Segitiga Pengukur</span>
          <span className="text-slate-900 font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px]">{triangles.length} Segitiga</span>
        </h4>

        <div className="space-y-3">
          {triangles.map((tri, idx) => (
            <div
              key={tri.id}
              className={`p-4 rounded-md border transition ${
                tri.isValid
                  ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  : 'bg-rose-50 border-rose-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{tri.name}</h5>
                    {!tri.isValid && (
                      <span className="text-[10px] text-rose-700 font-semibold flex items-center gap-1 mt-0.5">
                        <AlertCircle className="w-3 h-3 text-rose-600" /> Sisi tidak valid (jumlah 2 sisi harus &gt; sisi ke-3)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900">{tri.area.toFixed(2)} m²</span>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                      ≈ {(tri.area / 14.0625).toFixed(2)} Ru
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteTriangle(tri.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                    title="Hapus Segitiga"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Editable Sides Row */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200">
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">Sisi A</span>
                  <input
                    type="number"
                    step="any"
                    value={tri.sideA}
                    onChange={(e) => handleUpdateTriangle(tri.id, 'sideA', e.target.value)}
                    className="w-full bg-white border border-slate-300 focus:border-slate-900 rounded py-1 px-2 text-xs font-mono text-slate-800 focus:outline-none transition"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">Sisi B</span>
                  <input
                    type="number"
                    step="any"
                    value={tri.sideB}
                    onChange={(e) => handleUpdateTriangle(tri.id, 'sideB', e.target.value)}
                    className="w-full bg-white border border-slate-300 focus:border-slate-900 rounded py-1 px-2 text-xs font-mono text-slate-800 focus:outline-none transition"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">Sisi C</span>
                  <input
                    type="number"
                    step="any"
                    value={tri.sideC}
                    onChange={(e) => handleUpdateTriangle(tri.id, 'sideC', e.target.value)}
                    className="w-full bg-white border border-slate-300 focus:border-slate-900 rounded py-1 px-2 text-xs font-mono text-slate-800 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


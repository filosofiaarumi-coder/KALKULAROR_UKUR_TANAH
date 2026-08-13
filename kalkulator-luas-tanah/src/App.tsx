import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
  LandCalculationResult,
  LandPlotRecord,
  Point2D,
  QuadTriangulationData,
  TriangleData,
} from './types';
import {
  calculateShoelaceArea,
  calculatePolygonPerimeter,
  getPolygonSides,
  calculatePolygonAngles,
  solveQuadToPoints,
  hasSelfIntersection,
} from './utils/geometry';
import { PRESET_COORDINATES, PRESET_QUADS, PRESET_TRIANGLES } from './data/presets';
import { Header } from './components/Header';
import { Canvas2D } from './components/Canvas2D';
import { CoordinateMode } from './components/CoordinateMode';
import { QuadDiagonalMode } from './components/QuadDiagonalMode';
import { TriangulationMode } from './components/TriangulationMode';
import { CalculationSummary } from './components/CalculationSummary';
import { SavedPlotsModal } from './components/SavedPlotsModal';
import { ExportReportModal } from './components/ExportReportModal';

const LOCAL_STORAGE_KEY = 'kalkulator_luas_tanah_saved_plots';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('coordinate');

  // Mode 1: Coordinate points
  const [coordinatePoints, setCoordinatePoints] = useState<Point2D[]>(
    PRESET_COORDINATES[0].points
  );

  // Mode 2: Quad with diagonal
  const [quadData, setQuadData] = useState<QuadTriangulationData>(
    PRESET_QUADS[0].data
  );

  // Mode 3: Free triangles
  const [trianglesData, setTrianglesData] = useState<TriangleData[]>(
    PRESET_TRIANGLES[0].triangles
  );

  // Price Estimator state
  const [pricePerM2, setPricePerM2] = useState<number>(250000); // Rp 250.000 / m²
  const [priceUnit, setPriceUnit] = useState<'m2' | 'ru'>('m2');

  // Active point for selection on canvas
  const [activePointId, setActivePointId] = useState<string | null>(null);

  // Saved Plots History
  const [savedPlots, setSavedPlots] = useState<LandPlotRecord[]>([]);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState<boolean>(false);

  // Export Report Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Load saved plots from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setSavedPlots(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load saved plots:', e);
    }
  }, []);

  // Save plots to localStorage on change
  const savePlotsToStorage = (updatedPlots: LandPlotRecord[]) => {
    setSavedPlots(updatedPlots);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPlots));
    } catch (e) {
      console.error('Failed to save plot to localStorage:', e);
    }
  };

  // Perform active calculation based on current tab
  let currentResult: LandCalculationResult = {
    totalAreaM2: 0,
    perimeterM: 0,
    sides: [],
  };

  let activePointsForCanvas: Point2D[] = [];
  let diagonalForCanvas: [string, string] | undefined = undefined;
  let isCurrentSelfIntersecting = false;
  let currentMethodName = 'Titik Koordinat (Shoelace)';

  if (activeTab === 'coordinate') {
    currentMethodName = 'Metode Titik Koordinat (Shoelace)';
    activePointsForCanvas = coordinatePoints;
    const area = calculateShoelaceArea(coordinatePoints);
    const perimeter = calculatePolygonPerimeter(coordinatePoints);
    const sides = getPolygonSides(coordinatePoints);
    const angles = calculatePolygonAngles(coordinatePoints);
    isCurrentSelfIntersecting = hasSelfIntersection(coordinatePoints);

    currentResult = {
      totalAreaM2: area,
      perimeterM: perimeter,
      sides,
      angles,
    };
  } else if (activeTab === 'quad_diagonal') {
    currentMethodName = 'Metode Segiempat + 1 Diagonal Bentangan';
    const solved = solveQuadToPoints(quadData);
    if (solved.isValid) {
      activePointsForCanvas = solved.points;
      diagonalForCanvas = ['A', 'C'];
      const area = solved.area1 + solved.area2;
      const perimeter =
        quadData.sideAB + quadData.sideBC + quadData.sideCD + quadData.sideDA;

      currentResult = {
        totalAreaM2: area,
        perimeterM: perimeter,
        sides: [
          { from: 'A', to: 'B', length: quadData.sideAB },
          { from: 'B', to: 'C', length: quadData.sideBC },
          { from: 'C', to: 'D', length: quadData.sideCD },
          { from: 'D', to: 'A', length: quadData.sideDA },
        ],
        trianglesBreakdown: [
          {
            name: 'Segitiga ABC (Sisi AB, BC, AC)',
            sides: [quadData.sideAB, quadData.sideBC, quadData.diagonalAC],
            areaM2: solved.area1,
          },
          {
            name: 'Segitiga ADC (Sisi CD, DA, AC)',
            sides: [quadData.sideCD, quadData.sideDA, quadData.diagonalAC],
            areaM2: solved.area2,
          },
        ],
      };
    } else {
      currentResult = {
        totalAreaM2: 0,
        perimeterM: 0,
        sides: [],
      };
    }
  } else if (activeTab === 'triangulation') {
    currentMethodName = 'Metode Triangulasi Segitiga Bebas (Formula Heron)';
    const validTriangles = trianglesData.filter((t) => t.isValid);
    const totalArea = validTriangles.reduce((acc, t) => acc + t.area, 0);

    // Approximate sides list
    const breakdown = validTriangles.map((t) => ({
      name: t.name,
      sides: [t.sideA, t.sideB, t.sideC] as [number, number, number],
      areaM2: t.area,
    }));

    currentResult = {
      totalAreaM2: totalArea,
      perimeterM: validTriangles.reduce(
        (acc, t) => acc + t.sideA + t.sideB + t.sideC,
        0
      ),
      sides: validTriangles.map((t, idx) => ({
        from: `T${idx + 1}-A`,
        to: `T${idx + 1}-B`,
        length: t.sideA,
      })),
      trianglesBreakdown: breakdown,
    };
  }

  // Handle saving plot record
  const handleSavePlot = (title: string, ownerName: string, notes: string) => {
    const newRecord: LandPlotRecord = {
      id: `plot-${Date.now()}`,
      title,
      ownerName,
      date: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      method: activeTab,
      points: activeTab === 'coordinate' ? coordinatePoints : undefined,
      quadData: activeTab === 'quad_diagonal' ? quadData : undefined,
      triangles: activeTab === 'triangulation' ? trianglesData : undefined,
      totalAreaM2: currentResult.totalAreaM2,
      pricePerM2,
      notes,
    };

    savePlotsToStorage([newRecord, ...savedPlots]);
  };

  // Handle loading saved plot
  const handleLoadPlot = (plot: LandPlotRecord) => {
    setActiveTab(plot.method);
    if (plot.method === 'coordinate' && plot.points) {
      setCoordinatePoints(plot.points);
    } else if (plot.method === 'quad_diagonal' && plot.quadData) {
      setQuadData(plot.quadData);
    } else if (plot.method === 'triangulation' && plot.triangles) {
      setTrianglesData(plot.triangles);
    }
    if (plot.pricePerM2) {
      setPricePerM2(plot.pricePerM2);
    }
  };

  const handleDeletePlot = (id: string) => {
    savePlotsToStorage(savedPlots.filter((p) => p.id !== id));
  };

  const handleClearAllSaved = () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua riwayat tersimpan?')) {
      savePlotsToStorage([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Top App Header & Tabs */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedPlots.length}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Grid: Canvas Visualization & Input Control Pane */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Top: Interactive Canvas (6 Cols or 7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            <Canvas2D
              points={activePointsForCanvas}
              onPointChange={
                activeTab === 'coordinate' ? setCoordinatePoints : undefined
              }
              diagonalFromTo={diagonalForCanvas}
              isEditable={activeTab === 'coordinate'}
              activePointId={activePointId}
              onSelectPoint={setActivePointId}
            />
          </div>

          {/* Right / Top: Method Input Controls */}
          <div className="lg:col-span-5 space-y-4">
            {activeTab === 'coordinate' && (
              <CoordinateMode
                points={coordinatePoints}
                setPoints={setCoordinatePoints}
                activePointId={activePointId}
                setActivePointId={setActivePointId}
              />
            )}

            {activeTab === 'quad_diagonal' && (
              <QuadDiagonalMode
                quadData={quadData}
                setQuadData={setQuadData}
                solverResult={solveQuadToPoints(quadData)}
              />
            )}

            {activeTab === 'triangulation' && (
              <TriangulationMode
                triangles={trianglesData}
                setTriangles={setTrianglesData}
              />
            )}
          </div>
        </div>

        {/* Calculation Results & Summary Section */}
        <CalculationSummary
          result={currentResult}
          hasSelfIntersection={isCurrentSelfIntersecting}
          pricePerM2={pricePerM2}
          setPricePerM2={setPricePerM2}
          priceUnit={priceUnit}
          setPriceUnit={setPriceUnit}
          onSavePlot={handleSavePlot}
        />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            &copy; {new Date().getFullYear()} Kalkulator Luas Tanah Tidak Beraturan
            • Formula Shoelace &amp; Heron
          </p>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Satuan: m², Ru/Ubin, Hektar, Are</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SavedPlotsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedPlots={savedPlots}
        onLoadPlot={handleLoadPlot}
        onDeletePlot={handleDeletePlot}
        onClearAll={handleClearAllSaved}
      />

      <ExportReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        result={currentResult}
        methodName={currentMethodName}
        pricePerM2={pricePerM2}
      />
    </div>
  );
}

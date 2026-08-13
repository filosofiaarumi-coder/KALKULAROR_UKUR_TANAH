import React, { useState, useRef } from 'react';
import { Point2D } from '../types';
import { getBoundingBox, calculateDistance } from '../utils/geometry';
import { ZoomIn, ZoomOut, RotateCcw, Compass } from 'lucide-react';

interface Canvas2DProps {
  points: Point2D[];
  onPointChange?: (updatedPoints: Point2D[]) => void;
  diagonalFromTo?: [string, string]; // e.g. ['A', 'C'] for quad diagonal
  trianglesBreakdown?: { name: string; points: Point2D[]; color?: string }[];
  isEditable?: boolean;
  activePointId?: string | null;
  onSelectPoint?: (pointId: string | null) => void;
}

export const Canvas2D: React.FC<Canvas2DProps> = ({
  points,
  onPointChange,
  diagonalFromTo,
  trianglesBreakdown,
  isEditable = true,
  activePointId,
  onSelectPoint,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingPan, setIsDraggingPan] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggedPointId, setDraggedPointId] = useState<string | null>(null);

  const [hoveredSideIndex, setHoveredSideIndex] = useState<number | null>(null);
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);

  // Compute bounding box
  const bbox = getBoundingBox(points);
  
  // Padding & SVG sizing
  const svgWidth = 600;
  const svgHeight = 420;

  // Scale factors to fit bbox inside SVG canvas
  const paddingPercent = 0.25;
  const contentWidth = Math.max(bbox.width, 2);
  const contentHeight = Math.max(bbox.height, 2);

  const scaleX = (svgWidth * (1 - paddingPercent * 2)) / contentWidth;
  const scaleY = (svgHeight * (1 - paddingPercent * 2)) / contentHeight;
  const fitScale = Math.min(scaleX, scaleY);

  // Convert real world (meters) to SVG coordinates
  const worldToSvg = (p: { x: number; y: number }) => {
    const cx = svgWidth / 2 + pan.x;
    const cy = svgHeight / 2 + pan.y;

    const relX = p.x - bbox.centerX;
    const relY = p.y - bbox.centerY;

    return {
      x: cx + relX * fitScale * zoom,
      y: cy - relY * fitScale * zoom, // Invert Y
    };
  };

  const svgToWorld = (svgX: number, svgY: number) => {
    const cx = svgWidth / 2 + pan.x;
    const cy = svgHeight / 2 + pan.y;

    const relX = (svgX - cx) / (fitScale * zoom);
    const relY = -(svgY - cy) / (fitScale * zoom);

    return {
      x: Math.round((bbox.centerX + relX) * 10) / 10,
      y: Math.round((bbox.centerY + relY) * 10) / 10,
    };
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDownCanvas = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggedPointId) return;
    if (e.button === 0) {
      setIsDraggingPan(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggedPointId && onPointChange && isEditable) {
      const svgRect = e.currentTarget.getBoundingClientRect();
      const svgX = e.clientX - svgRect.left;
      const svgY = e.clientY - svgRect.top;

      const newWorldPos = svgToWorld(svgX, svgY);
      const updated = points.map((p) => (p.id === draggedPointId ? { ...p, x: newWorldPos.x, y: newWorldPos.y } : p));
      onPointChange(updated);
      return;
    }

    if (isDraggingPan) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUpCanvas = () => {
    setIsDraggingPan(false);
    setDraggedPointId(null);
  };

  const svgPoints = points.map((p) => ({
    ...p,
    svgPos: worldToSvg(p),
  }));

  // Build polygon path string
  const polygonPath = svgPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.svgPos.x} ${p.svgPos.y}`).join(' ') + ' Z';

  // Diagonal line rendering if given
  let diagonalLine = null;
  if (diagonalFromTo && points.length >= 4) {
    const p1 = svgPoints.find((p) => p.name === diagonalFromTo[0]);
    const p2 = svgPoints.find((p) => p.name === diagonalFromTo[1]);
    if (p1 && p2) {
      diagonalLine = { p1: p1.svgPos, p2: p2.svgPos };
    }
  }

  // Calculate real distance scale bar
  const pixel50 = 50;
  const metersIn50px = Math.round((pixel50 / (fitScale * zoom)) * 10) / 10;

  return (
    <div ref={containerRef} className="relative w-full bg-slate-50 border border-slate-200 rounded-md overflow-hidden shadow-xs select-none">
      {/* Top Bar Controls */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-md border border-slate-200 shadow-xs text-xs font-semibold uppercase tracking-wider text-slate-800 pointer-events-auto">
          <span className="inline-block w-2 h-2 rounded-full bg-slate-900"></span>
          Visualisasi Lahan ({points.length} Titik)
        </div>

        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 rounded-md border border-slate-200 shadow-xs pointer-events-auto">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.2, 3))}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition"
            title="Perbesar (Zoom In)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.2, 0.4))}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition"
            title="Perkecil (Zoom Out)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition"
            title="Reset Tampilan"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Compass Rose */}
      <div className="absolute top-14 right-3 z-10 pointer-events-none flex flex-col items-center bg-white/90 backdrop-blur border border-slate-200 p-2 rounded-md text-slate-600 text-[10px] font-bold shadow-xs">
        <span className="text-slate-900 text-xs">U</span>
        <Compass className="w-5 h-5 text-slate-700 my-0.5" />
        <span>S</span>
      </div>

      {/* Scale Bar & Hint */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-none flex items-center gap-4 text-xs text-slate-600 bg-white/90 backdrop-blur px-3 py-1.5 rounded-md border border-slate-200 shadow-xs">
        <div className="flex flex-col items-center">
          <div className="w-[50px] h-1.5 border-b-2 border-x-2 border-slate-900"></div>
          <span className="text-[10px] text-slate-700 font-mono mt-0.5 font-semibold">≈ {metersIn50px} m</span>
        </div>
        {isEditable && (
          <span className="hidden sm:inline text-[11px] text-slate-500 border-l border-slate-200 pl-3 font-medium uppercase tracking-wider">
            Geser patok untuk sesuaikan sketsa
          </span>
        )}
      </div>

      {/* Main SVG Canvas */}
      <svg
        className={`w-full h-[360px] sm:h-[420px] ${isDraggingPan ? 'cursor-grabbing' : 'cursor-grab'}`}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        onMouseDown={handleMouseDownCanvas}
        onMouseMove={handleMouseMoveCanvas}
        onMouseUp={handleMouseUpCanvas}
        onMouseLeave={handleMouseUpCanvas}
      >
        <defs>
          {/* Grid Pattern */}
          <pattern id="grid-pattern-clean" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(0, 0, 0, 0.04)" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Background Grid */}
        <rect width="100%" height="100%" fill="url(#grid-pattern-clean)" />

        {/* Render Triangles breakdown if present */}
        {trianglesBreakdown &&
          trianglesBreakdown.map((tri, tIdx) => {
            const triSvgPts = tri.points.map((pt) => worldToSvg(pt));
            const pathStr = triSvgPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
            const colors = ['rgba(15, 23, 42, 0.06)', 'rgba(51, 65, 85, 0.08)', 'rgba(71, 85, 105, 0.07)'];
            return (
              <path
                key={`tri-${tIdx}`}
                d={pathStr}
                fill={tri.color || colors[tIdx % colors.length]}
                stroke="#64748b"
                strokeDasharray="4 4"
                strokeWidth="1.5"
              />
            );
          })}

        {/* Polygon Main Fill & Outline */}
        {points.length >= 3 && (
          <path
            d={polygonPath}
            fill="rgba(15, 23, 42, 0.07)"
            stroke="#0f172a"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="transition-all duration-150"
          />
        )}

        {/* Diagonal Line if present */}
        {diagonalLine && (
          <line
            x1={diagonalLine.p1.x}
            y1={diagonalLine.p1.y}
            x2={diagonalLine.p2.x}
            y2={diagonalLine.p2.y}
            stroke="#475569"
            strokeWidth="2"
            strokeDasharray="5 4"
          />
        )}

        {/* Side Length Overlays */}
        {svgPoints.map((p1, idx) => {
          const p2 = svgPoints[(idx + 1) % svgPoints.length];
          const midX = (p1.svgPos.x + p2.svgPos.x) / 2;
          const midY = (p1.svgPos.y + p2.svgPos.y) / 2;
          const distM = calculateDistance(p1, p2);

          const isHovered = hoveredSideIndex === idx;

          return (
            <g
              key={`side-${idx}`}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredSideIndex(idx)}
              onMouseLeave={() => setHoveredSideIndex(null)}
            >
              <line
                x1={p1.svgPos.x}
                y1={p1.svgPos.y}
                x2={p2.svgPos.x}
                y2={p2.svgPos.y}
                stroke="transparent"
                strokeWidth="12"
              />

              <rect
                x={midX - 32}
                y={midY - 11}
                width="64"
                height="22"
                rx="4"
                fill={isHovered ? '#0f172a' : '#ffffff'}
                stroke="#0f172a"
                strokeWidth="1.5"
              />
              <text
                x={midX}
                y={midY + 4}
                textAnchor="middle"
                fill={isHovered ? '#ffffff' : '#0f172a'}
                fontSize="11"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                {distM.toFixed(1)} m
              </text>
            </g>
          );
        })}

        {/* Vertex Markers (Points A, B, C...) */}
        {svgPoints.map((p) => {
          const isSelected = activePointId === p.id;
          const isHovered = hoveredPointId === p.id;

          return (
            <g
              key={p.id}
              className={`${isEditable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
              onMouseDown={(e) => {
                e.stopPropagation();
                if (isEditable) setDraggedPointId(p.id);
                if (onSelectPoint) onSelectPoint(p.id);
              }}
              onMouseEnter={() => setHoveredPointId(p.id)}
              onMouseLeave={() => setHoveredPointId(null)}
            >
              {(isSelected || isHovered) && (
                <circle cx={p.svgPos.x} cy={p.svgPos.y} r="18" fill="#0f172a" fillOpacity="0.15" />
              )}

              <circle
                cx={p.svgPos.x}
                cy={p.svgPos.y}
                r={isSelected ? 9 : 7}
                fill={isSelected ? '#0f172a' : '#334155'}
                stroke="#ffffff"
                strokeWidth="2.5"
                className="transition-all duration-100"
              />

              {/* Vertex Name Label Badge */}
              <g transform={`translate(${p.svgPos.x}, ${p.svgPos.y - 18})`}>
                <rect x="-13" y="-12" width="26" height="20" rx="3" fill="#0f172a" stroke="#ffffff" strokeWidth="1" />
                <text
                  x="0"
                  y="2"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {p.name}
                </text>
              </g>

              {/* Tooltip on point hover */}
              {isHovered && (
                <g transform={`translate(${p.svgPos.x + 15}, ${p.svgPos.y + 10})`}>
                  <rect x="0" y="0" width="110" height="36" rx="4" fill="#ffffff" stroke="#0f172a" strokeWidth="1" />
                  <text x="8" y="15" fill="#0f172a" fontSize="10" fontWeight="bold">
                    Titik {p.name}
                  </text>
                  <text x="8" y="28" fill="#64748b" fontSize="10" fontFamily="monospace">
                    X: {p.x}m, Y: {p.y}m
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};


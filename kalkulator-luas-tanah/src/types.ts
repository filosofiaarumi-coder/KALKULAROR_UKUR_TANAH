export interface Point2D {
  id: string;
  name: string; // e.g. "A", "B", "C"
  x: number;
  y: number;
}

export interface PolygonSide {
  from: string; // Point name A
  to: string;   // Point name B
  length: number; // In meters
}

export interface PolygonAngle {
  vertex: string;
  angleDegrees: number;
}

export interface TriangleData {
  id: string;
  name: string; // e.g., "Segitiga 1 (ABC)"
  sideA: number;
  sideB: number;
  sideC: number;
  isValid: boolean;
  area: number;
  notes?: string;
}

export interface QuadTriangulationData {
  sideAB: number;
  sideBC: number;
  sideCD: number;
  sideDA: number;
  diagonalAC: number;
}

export interface LandCalculationResult {
  totalAreaM2: number;
  perimeterM: number;
  sides: PolygonSide[];
  angles?: PolygonAngle[];
  trianglesBreakdown?: {
    name: string;
    sides: [number, number, number];
    areaM2: number;
  }[];
  isSimplePolygon?: boolean;
}

export interface LandPlotRecord {
  id: string;
  title: string;
  ownerName?: string;
  location?: string;
  date: string;
  method: 'coordinate' | 'triangulation' | 'quad_diagonal';
  points?: Point2D[];
  triangles?: TriangleData[];
  quadData?: QuadTriangulationData;
  totalAreaM2: number;
  pricePerM2?: number;
  notes?: string;
}

export type ActiveTab = 'coordinate' | 'triangulation' | 'quad_diagonal' | 'history';

export type LandUnit = 'm2' | 'ru' | 'ha' | 'are' | 'ft2';

export interface UnitValue {
  unit: LandUnit;
  label: string;
  shortLabel: string;
  value: number;
  conversionToM2: number;
  description: string;
}

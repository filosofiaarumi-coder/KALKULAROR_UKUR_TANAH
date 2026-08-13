import { Point2D, PolygonAngle, PolygonSide, TriangleData, QuadTriangulationData } from '../types';

/**
 * Calculates polygon area using the Shoelace (Gauss Area) formula.
 */
export function calculateShoelaceArea(points: Point2D[]): number {
  if (points.length < 3) return 0;
  let sum = 0;
  const n = points.length;

  for (let i = 0; i < n; i++) {
    const current = points[i];
    const next = points[(i + 1) % n];
    sum += current.x * next.y - next.x * current.y;
  }

  return Math.abs(sum) / 2;
}

/**
 * Calculates perimeter of a closed polygon.
 */
export function calculatePolygonPerimeter(points: Point2D[]): number {
  if (points.length < 2) return 0;
  let total = 0;
  const n = points.length;

  for (let i = 0; i < n; i++) {
    const current = points[i];
    const next = points[(i + 1) % n];
    total += calculateDistance(current, next);
  }

  return total;
}

/**
 * Distance between two 2D points.
 */
export function calculateDistance(p1: Point2D, p2: Point2D): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Get all side details (names and lengths) for polygon.
 */
export function getPolygonSides(points: Point2D[]): PolygonSide[] {
  if (points.length < 2) return [];
  const sides: PolygonSide[] = [];
  const n = points.length;

  for (let i = 0; i < n; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    sides.push({
      from: p1.name,
      to: p2.name,
      length: calculateDistance(p1, p2),
    });
  }

  return sides;
}

/**
 * Check if 3 side lengths can form a valid triangle (Triangle Inequality Theorem).
 */
export function isValidTriangle(a: number, b: number, c: number): boolean {
  if (a <= 0 || b <= 0 || c <= 0) return false;
  return a + b > c && a + c > b && b + c > a;
}

/**
 * Calculates area of a triangle using Heron's Formula.
 */
export function calculateHeronArea(a: number, b: number, c: number): number {
  if (!isValidTriangle(a, b, c)) return 0;
  const s = (a + b + c) / 2;
  const areaSq = s * (s - a) * (s - b) * (s - c);
  return Math.sqrt(Math.max(0, areaSq));
}

/**
 * Reconstructs 2D coordinates for a quadrilateral with 1 diagonal (AC).
 * Triangle 1: ABC (sides AB, BC, AC)
 * Triangle 2: ADC (sides CD, DA, AC)
 */
export function solveQuadToPoints(data: QuadTriangulationData): {
  points: Point2D[];
  isValid: boolean;
  errorMessage?: string;
  area1: number;
  area2: number;
} {
  const { sideAB, sideBC, sideCD, sideDA, diagonalAC } = data;

  const validABC = isValidTriangle(sideAB, sideBC, diagonalAC);
  const validADC = isValidTriangle(sideCD, sideDA, diagonalAC);

  if (!validABC) {
    return {
      points: [],
      isValid: false,
      errorMessage: `Sisi AB (${sideAB}m), BC (${sideBC}m), dan Diagonal AC (${diagonalAC}m) tidak memenuhi syarat segitiga ABC (misal: jumlah 2 sisi harus > sisi ketiga).`,
      area1: 0,
      area2: 0,
    };
  }

  if (!validADC) {
    return {
      points: [],
      isValid: false,
      errorMessage: `Sisi CD (${sideCD}m), DA (${sideDA}m), dan Diagonal AC (${diagonalAC}m) tidak memenuhi syarat segitiga ADC.`,
      area1: 0,
      area2: 0,
    };
  }

  const area1 = calculateHeronArea(sideAB, sideBC, diagonalAC);
  const area2 = calculateHeronArea(sideCD, sideDA, diagonalAC);

  // Position A at (0,0), C at (AC, 0)
  const A: Point2D = { id: 'pt-A', name: 'A', x: 0, y: 0 };
  const C: Point2D = { id: 'pt-C', name: 'C', x: diagonalAC, y: 0 };

  // Calculate angle CAB using Law of Cosines: BC^2 = AB^2 + AC^2 - 2*AB*AC*cos(CAB)
  const cosCAB = (sideAB * sideAB + diagonalAC * diagonalAC - sideBC * sideBC) / (2 * sideAB * diagonalAC);
  const angleCAB = Math.acos(Math.max(-1, Math.min(1, cosCAB)));

  const B: Point2D = {
    id: 'pt-B',
    name: 'B',
    x: sideAB * Math.cos(angleCAB),
    y: sideAB * Math.sin(angleCAB),
  };

  // Calculate angle CAD using Law of Cosines: CD^2 = DA^2 + AC^2 - 2*DA*AC*cos(CAD)
  const cosCAD = (sideDA * sideDA + diagonalAC * diagonalAC - sideCD * sideCD) / (2 * sideDA * diagonalAC);
  const angleCAD = Math.acos(Math.max(-1, Math.min(1, cosCAD)));

  const D: Point2D = {
    id: 'pt-D',
    name: 'D',
    x: sideDA * Math.cos(angleCAD),
    y: -sideDA * Math.sin(angleCAD), // Opposite side of AC
  };

  return {
    points: [A, B, C, D],
    isValid: true,
    area1,
    area2,
  };
}

/**
 * Calculates interior angles at each vertex.
 */
export function calculatePolygonAngles(points: Point2D[]): PolygonAngle[] {
  if (points.length < 3) return [];
  const n = points.length;
  const angles: PolygonAngle[] = [];

  for (let i = 0; i < n; i++) {
    const prev = points[(i - 1 + n) % n];
    const curr = points[i];
    const next = points[(i + 1) % n];

    // Vectors curr -> prev and curr -> next
    const v1x = prev.x - curr.x;
    const v1y = prev.y - curr.y;
    const v2x = next.x - curr.x;
    const v2y = next.y - curr.y;

    const angle1 = Math.atan2(v1y, v1x);
    const angle2 = Math.atan2(v2y, v2x);

    let diffRad = angle2 - angle1;
    if (diffRad < 0) diffRad += 2 * Math.PI;

    let deg = (diffRad * 180) / Math.PI;
    deg = Math.round(deg * 10) / 10;

    angles.push({
      vertex: curr.name,
      angleDegrees: deg,
    });
  }

  return angles;
}

/**
 * Get bounding box of points.
 */
export function getBoundingBox(points: Point2D[]): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
} {
  if (points.length === 0) {
    return { minX: 0, maxX: 10, minY: 0, maxY: 10, width: 10, height: 10, centerX: 5, centerY: 5 };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  points.forEach((p) => {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  });

  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  return { minX, maxX, minY, maxY, width, height, centerX, centerY };
}

/**
 * Helper to generate alphabet point names (A, B, C, ... Z, A1, B1...)
 */
export function generatePointName(index: number): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (index < 26) return letters[index];
  const cycle = Math.floor(index / 26);
  const rem = index % 26;
  return `${letters[rem]}${cycle}`;
}

/**
 * Simple self-intersection check (Cross product sign test for non-adjacent line segments).
 */
export function hasSelfIntersection(points: Point2D[]): boolean {
  const n = points.length;
  if (n < 4) return false;

  function ccw(p1: Point2D, p2: Point2D, p3: Point2D): boolean {
    return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
  }

  function intersect(p1: Point2D, p2: Point2D, p3: Point2D, p4: Point2D): boolean {
    return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
  }

  for (let i = 0; i < n; i++) {
    const a1 = points[i];
    const a2 = points[(i + 1) % n];

    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue; // Adjacent edge
      const b1 = points[j];
      const b2 = points[(j + 1) % n];

      if (intersect(a1, a2, b1, b2)) {
        return true;
      }
    }
  }

  return false;
}

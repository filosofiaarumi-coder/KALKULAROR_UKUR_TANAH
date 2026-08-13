import { Point2D, QuadTriangulationData, TriangleData } from '../types';

export interface PresetCoordinate {
  id: string;
  title: string;
  description: string;
  points: Point2D[];
}

export interface PresetQuad {
  id: string;
  title: string;
  description: string;
  data: QuadTriangulationData;
}

export interface PresetTriangles {
  id: string;
  title: string;
  description: string;
  triangles: TriangleData[];
}

export const PRESET_COORDINATES: PresetCoordinate[] = [
  {
    id: 'preset-kavling-4',
    title: 'Kavling Segiempat Tidak Beraturan (4 Titik)',
    description: 'Bentuk tanah rumah / kavling standard dengan 4 sudut tidak persis 90°',
    points: [
      { id: 'p1', name: 'A', x: 0, y: 0 },
      { id: 'p2', name: 'B', x: 12.5, y: 0.8 },
      { id: 'p3', name: 'C', x: 14.2, y: 18.5 },
      { id: 'p4', name: 'D', x: -1.2, y: 16.0 },
    ],
  },
  {
    id: 'preset-sawah-5',
    title: 'Lahan Sawah 5 Sudut (5 Titik)',
    description: 'Lahan pertanian melengkung/banyak sudut di pinggir parit',
    points: [
      { id: 'p1', name: 'A', x: 0, y: 0 },
      { id: 'p2', name: 'B', x: 25.0, y: 0 },
      { id: 'p3', name: 'C', x: 32.4, y: 15.2 },
      { id: 'p4', name: 'D', x: 18.0, y: 30.5 },
      { id: 'p5', name: 'E', x: -5.5, y: 22.0 },
    ],
  },
  {
    id: 'preset-tanah-l',
    title: 'Tanah Bentuk L (6 Titik)',
    description: 'Tanah sudut dengan batas potongan bagunan/jalan',
    points: [
      { id: 'p1', name: 'A', x: 0, y: 0 },
      { id: 'p2', name: 'B', x: 20, y: 0 },
      { id: 'p3', name: 'C', x: 20, y: 10 },
      { id: 'p4', name: 'D', x: 8, y: 10 },
      { id: 'p5', name: 'E', x: 8, y: 25 },
      { id: 'p6', name: 'F', x: 0, y: 25 },
    ],
  },
];

export const PRESET_QUADS: PresetQuad[] = [
  {
    id: 'preset-quad-1',
    title: 'Tanah Pelepasan / Kebun 4 Sisi',
    description: 'Pengukuran fisik meteran 4 sisi luar dan 1 diagonal bentangan tengah',
    data: {
      sideAB: 15.4,
      sideBC: 22.1,
      sideCD: 18.8,
      sideDA: 20.2,
      diagonalAC: 28.5,
    },
  },
  {
    id: 'preset-quad-2',
    title: 'Lahan Sawah Persegi Panjang Miring',
    description: 'Ukuran Sisi 25m × 40m dengan variasi sudut miring',
    data: {
      sideAB: 25.0,
      sideBC: 42.0,
      sideCD: 27.5,
      sideDA: 39.8,
      diagonalAC: 48.0,
    },
  },
];

export const PRESET_TRIANGLES: PresetTriangles[] = [
  {
    id: 'preset-tri-1',
    title: 'Pengukuran 3 Blok Segitiga Lahan',
    description: 'Peta hasil pengukuran fisik membagi tanah menjadi 3 segitiga',
    triangles: [
      {
        id: 't1',
        name: 'Segitiga 1 (Depan)',
        sideA: 12.5,
        sideB: 15.0,
        sideC: 18.2,
        isValid: true,
        area: 93.3,
        notes: 'Area dekat jalan utama',
      },
      {
        id: 't2',
        name: 'Segitiga 2 (Tengah)',
        sideA: 18.2,
        sideB: 22.0,
        sideC: 25.4,
        isValid: true,
        area: 199.6,
        notes: 'Area utama',
      },
      {
        id: 't3',
        name: 'Segitiga 3 (Belakang)',
        sideA: 25.4,
        sideB: 14.5,
        sideC: 16.8,
        isValid: true,
        area: 121.2,
        notes: 'Batas selokan belakang',
      },
    ],
  },
];

import { LandUnit, UnitValue } from '../types';

export const CONVERSION_RATES: Record<LandUnit, number> = {
  m2: 1,
  ru: 14.0625, // 1 Ru / Ubin / Tumbak = 14.0625 m²
  ha: 10000,   // 1 Hektar = 10,000 m²
  are: 100,    // 1 Are = 100 m²
  ft2: 0.09290304, // 1 sq ft = 0.09290304 m²
};

export const LAND_UNITS: { unit: LandUnit; label: string; shortLabel: string; description: string }[] = [
  {
    unit: 'm2',
    label: 'Meter Persegi',
    shortLabel: 'm²',
    description: 'Satuan standar internasional (SI)',
  },
  {
    unit: 'ru',
    label: 'Ru / Ubin / Tumbak / Bata',
    shortLabel: 'Ru',
    description: '1 Ru = 14.0625 m² (3.75m × 3.75m) - Satuan tradisional Indonesia',
  },
  {
    unit: 'ha',
    label: 'Hektar',
    shortLabel: 'ha',
    description: '1 Hektar = 10.000 m²',
  },
  {
    unit: 'are',
    label: 'Are',
    shortLabel: 'a',
    description: '1 Are = 100 m²',
  },
  {
    unit: 'ft2',
    label: 'Kaki Persegi (Square Feet)',
    shortLabel: 'sq ft',
    description: '1 m² = 10.7639 sq ft',
  },
];

export function convertFromM2(areaM2: number, targetUnit: LandUnit): number {
  const rate = CONVERSION_RATES[targetUnit];
  if (!rate || rate === 0) return 0;
  return areaM2 / rate;
}

export function convertToM2(value: number, sourceUnit: LandUnit): number {
  const rate = CONVERSION_RATES[sourceUnit];
  return value * rate;
}

export function getAllUnitValues(areaM2: number): UnitValue[] {
  return LAND_UNITS.map((u) => ({
    unit: u.unit,
    label: u.label,
    shortLabel: u.shortLabel,
    description: u.description,
    conversionToM2: CONVERSION_RATES[u.unit],
    value: convertFromM2(areaM2, u.unit),
  }));
}

export function formatNumber(value: number, decimals: number = 2): string {
  if (isNaN(value) || !isFinite(value)) return '0';
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: Number.isInteger(value) ? 0 : Math.min(2, decimals),
  }).format(value);
}

export function formatCurrencyIDR(value: number): string {
  if (isNaN(value) || !isFinite(value) || value < 0) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

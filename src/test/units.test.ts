import { describe, it, expect } from 'vitest';
import { toGrams, gramsPer, safeNumber, LB_TO_G, OZ_TO_G, KG_TO_G } from '../utils/units';

describe('units utility', () => {
  // Test toGrams function
  describe('toGrams', () => {
    it('converts pounds to grams correctly', () => {
      expect(toGrams(1, 'lb')).toBeCloseTo(LB_TO_G, 3);
      expect(toGrams(2, 'lb')).toBeCloseTo(2 * LB_TO_G, 3);
    });

    it('converts ounces to grams correctly', () => {
      expect(toGrams(1, 'oz')).toBeCloseTo(OZ_TO_G, 3);
      expect(toGrams(16, 'oz')).toBeCloseTo(16 * OZ_TO_G, 3);
    });

    it('converts kilograms to grams correctly', () => {
      expect(toGrams(1, 'kg')).toBeCloseTo(KG_TO_G, 3);
      expect(toGrams(0.5, 'kg')).toBeCloseTo(0.5 * KG_TO_G, 3);
    });

    it('returns the same value for grams', () => {
      expect(toGrams(100, 'g')).toBe(100);
    });

    it('returns undefined for invalid inputs', () => {
      expect(toGrams(undefined, 'g')).toBeUndefined();
      expect(toGrams(100, undefined)).toBeUndefined();
      expect(toGrams(-1, 'g')).toBeUndefined();
      expect(toGrams(0, 'g')).toBeUndefined();
    });
  });

  // Test gramsPer function
  describe('gramsPer', () => {
    it('returns correct grams per unit', () => {
      expect(gramsPer('g')).toBe(1);
      expect(gramsPer('kg')).toBe(KG_TO_G);
      expect(gramsPer('oz')).toBeCloseTo(OZ_TO_G, 3);
      expect(gramsPer('lb')).toBeCloseTo(LB_TO_G, 3);
    });

    it('returns undefined for invalid input', () => {
      expect(gramsPer(undefined)).toBeUndefined();
    });
  });

  // Test safeNumber function
  describe('safeNumber', () => {
    it('returns the number if it is positive', () => {
      expect(safeNumber(10)).toBe(10);
      expect(safeNumber(0.1)).toBe(0.1);
    });

    it('returns undefined for invalid numbers', () => {
      expect(safeNumber(undefined)).toBeUndefined();
      expect(safeNumber(0)).toBeUndefined();
      expect(safeNumber(-1)).toBeUndefined();
      expect(safeNumber(NaN)).toBeUndefined();
    });
  });
});

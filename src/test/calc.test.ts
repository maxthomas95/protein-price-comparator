import { describe, it, expect } from 'vitest';
import { calc } from '../utils/calc';
import type { Item, Settings } from '../types';

describe('calc utility', () => {
  const settings: Settings = {
    currencySymbol: '$',
    comparisonTarget: 30,
  };

  // Test case 1: Unit-price path (no package)
  // Chicken breast — Brand: Kirkland — Store: Costco — Mode B: $2.49/lb — Protein: 31 g/100 g
  it('correctly calculates costs for unit price mode with per100g protein basis', () => {
    const item: Item = {
      id: 'test1',
      name: 'Chicken breast',
      brand: 'Kirkland',
      store: 'Costco',
      priceMode: 'unitPrice',
      unitPrice: 2.49,
      unitPriceUnit: 'lb',
      proteinBasis: 'per100g',
      proteinPer100g: 31,
      favorite: false,
    };

    const result = calc(item, settings);

    // Verify the calculation is valid
    expect(result.valid).toBe(true);

    // Expected calculations:
    // 1 lb = 453.592 g
    // unitPricePerGramProduct = 2.49 / 453.592 ≈ 0.00549
    // gramsProteinPerGramProduct = 31 / 100 = 0.31
    // costPerGram = 0.00549 / 0.31 ≈ 0.0177
    // costPer30g = 0.0177 * 30 ≈ 0.53

    // Check with approximate equality due to floating point precision
    expect(result.unitPricePerGramProduct).toBeCloseTo(0.00549, 5);
    expect(result.gramsProteinPerGramProduct).toBeCloseTo(0.31, 5);
    expect(result.costPerGram).toBeCloseTo(0.0177, 4);
    expect(result.costPerTarget).toBeCloseTo(0.53, 2);
  });

  // Test case 2: Total-price path
  // Whey isolate — Brand: ON — Store: Amazon — Mode A: $39.99 for 5 lb — Protein: 25 g / 32 g serving
  it('correctly calculates costs for total price mode with perServing protein basis', () => {
    const item: Item = {
      id: 'test2',
      name: 'Whey isolate',
      brand: 'ON',
      store: 'Amazon',
      priceMode: 'totalPrice',
      priceTotal: 39.99,
      packageAmount: 5,
      packageUnit: 'lb',
      proteinBasis: 'perServing',
      servingSizeAmount: 32,
      servingSizeUnit: 'g',
      proteinPerServing: 25,
      favorite: false,
    };

    const result = calc(item, settings);

    // Verify the calculation is valid
    expect(result.valid).toBe(true);

    // Expected calculations:
    // 5 lb = 5 * 453.592 = 2267.96 g
    // servingsPerPackage = 2267.96 / 32 ≈ 70.87
    // gramsProteinTotal = 70.87 * 25 ≈ 1771.84
    // costPerGram = 39.99 / 1771.84 ≈ 0.0226
    // costPer30g = 0.0226 * 30 ≈ 0.68

    // Check with approximate equality due to floating point precision
    expect(result.gramsTotal).toBeCloseTo(2267.96, 2);
    expect(result.gramsProteinTotal).toBeCloseTo(1771.84, 2);
    expect(result.costPerGram).toBeCloseTo(0.0226, 4);
    expect(result.costPerTarget).toBeCloseTo(0.68, 2);
  });

  // Test case 3: Invalid inputs
  it('marks calculation as invalid when required fields are missing', () => {
    const item: Item = {
      id: 'test3',
      name: 'Invalid item',
      priceMode: 'totalPrice',
      proteinBasis: 'per100g',
      // Missing required fields
      favorite: false,
    };

    const result = calc(item, settings);

    // Verify the calculation is invalid
    expect(result.valid).toBe(false);
    expect(result.costPerGram).toBeUndefined();
    expect(result.costPerTarget).toBeUndefined();
  });

  // Test case 4: Warning for low protein content
  it('provides warning for very low protein content', () => {
    const item: Item = {
      id: 'test4',
      name: 'Low protein item',
      priceMode: 'totalPrice',
      priceTotal: 10,
      packageAmount: 1000,
      packageUnit: 'g',
      proteinBasis: 'per100g',
      proteinPer100g: 0.05, // Very low protein content
      favorite: false,
    };

    const result = calc(item, settings);

    // Verify the calculation is valid but has warnings
    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('low protein');
  });
});

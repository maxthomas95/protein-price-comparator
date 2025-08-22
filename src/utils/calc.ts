import type { Item, Settings } from "../types";
import { toGrams, gramsPer, safeNumber } from "./units";

type CalcResult = {
  costPerGram?: number;
  costPerTarget?: number;
  unitPricePerGramProduct?: number;
  gramsTotal?: number;
  gramsProteinTotal?: number;
  gramsProteinPerGramProduct?: number;
  valid: boolean;
  warnings: string[];
};

/**
 * Calculates cost metrics for a protein item
 * @param item The item to calculate metrics for
 * @param settings Application settings
 * @returns Calculation results including costs and validation info
 */
export const calc = (item: Item, settings: Settings): CalcResult => {
  const result: CalcResult = {
    valid: true,
    warnings: [],
  };

  // Step 1: Normalize gramsTotal
  if (item.priceMode === "totalPrice") {
    // Mode A: gramsTotal = convert(packageAmount, packageUnit)
    result.gramsTotal = toGrams(item.packageAmount, item.packageUnit);
    if (result.gramsTotal === undefined) {
      result.valid = false;
    }
  } else {
    // Mode B: gramsTotal optional via (packageAmountOptional, packageUnitOptional)
    if (item.packageAmountOptional !== undefined && item.packageUnitOptional !== undefined) {
      result.gramsTotal = toGrams(item.packageAmountOptional, item.packageUnitOptional);
    }
    // For Mode B, we can still calculate costs without gramsTotal
  }

  // Step 2: Calculate protein metrics based on basis
  if (item.proteinBasis === "per100g") {
    const proteinPer100g = safeNumber(item.proteinPer100g);
    if (proteinPer100g === undefined) {
      result.valid = false;
    } else {
      // Calculate gramsProteinPerGramProduct (protein per gram of product)
      result.gramsProteinPerGramProduct = proteinPer100g / 100;

      // If we know the total grams, calculate total protein
      if (result.gramsTotal !== undefined) {
        result.gramsProteinTotal = result.gramsTotal * result.gramsProteinPerGramProduct;
        
        // Warn if total protein is very low
        if (result.gramsProteinTotal < 1) {
          result.warnings.push("Very low protein content detected. Please check your inputs.");
        }
      }
    }
  } else if (item.proteinBasis === "perServing") {
    const servingGrams = toGrams(item.servingSizeAmount, item.servingSizeUnit);
    const proteinPerServing = safeNumber(item.proteinPerServing);
    
    if (servingGrams === undefined || proteinPerServing === undefined) {
      result.valid = false;
    } else {
      // Calculate gramsProteinPerGramProduct (protein per gram of product)
      result.gramsProteinPerGramProduct = proteinPerServing / servingGrams;

      // If we know the total grams, calculate total protein
      if (result.gramsTotal !== undefined) {
        const servingsPerPackage = result.gramsTotal / servingGrams;
        result.gramsProteinTotal = servingsPerPackage * proteinPerServing;
        
        // Warn if total protein is very low
        if (result.gramsProteinTotal < 1) {
          result.warnings.push("Very low protein content detected. Please check your inputs.");
        }
      }
    }
  } else {
    result.valid = false;
  }

  // Step 3: Calculate costs
  if (item.priceMode === "totalPrice") {
    // If total price and gramsProteinTotal known
    const priceTotal = safeNumber(item.priceTotal);
    if (priceTotal === undefined) {
      result.valid = false;
    } else if (result.gramsProteinTotal !== undefined) {
      result.costPerGram = priceTotal / result.gramsProteinTotal;
      result.costPerTarget = result.costPerGram * settings.comparisonTarget;
    } else {
      result.valid = false;
    }
  } else if (item.priceMode === "unitPrice") {
    // If unit price known and gramsProteinPerGramProduct known
    const unitPrice = safeNumber(item.unitPrice);
    const unitPriceUnitGrams = gramsPer(item.unitPriceUnit);
    
    if (unitPrice === undefined || unitPriceUnitGrams === undefined || result.gramsProteinPerGramProduct === undefined) {
      result.valid = false;
    } else {
      result.unitPricePerGramProduct = unitPrice / unitPriceUnitGrams;
      result.costPerGram = result.unitPricePerGramProduct / result.gramsProteinPerGramProduct;
      result.costPerTarget = result.costPerGram * settings.comparisonTarget;
    }
  } else {
    result.valid = false;
  }

  return result;
};

/**
 * Checks if an item has all required fields for calculation
 * @param item The item to validate
 * @returns True if the item has all required fields for calculation
 */
export const isValidForCalc = (item: Item): boolean => {
  if (item.priceMode === "totalPrice") {
    if (safeNumber(item.priceTotal) === undefined || 
        safeNumber(item.packageAmount) === undefined || 
        item.packageUnit === undefined) {
      return false;
    }
  } else if (item.priceMode === "unitPrice") {
    if (safeNumber(item.unitPrice) === undefined || 
        item.unitPriceUnit === undefined) {
      return false;
    }
  } else {
    return false;
  }

  if (item.proteinBasis === "per100g") {
    if (safeNumber(item.proteinPer100g) === undefined) {
      return false;
    }
  } else if (item.proteinBasis === "perServing") {
    if (safeNumber(item.servingSizeAmount) === undefined || 
        item.servingSizeUnit === undefined || 
        safeNumber(item.proteinPerServing) === undefined) {
      return false;
    }
  } else {
    return false;
  }

  return true;
};

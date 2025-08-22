import type { Item } from "../types";
import { toGrams } from "./units";

/**
 * Formats a number as currency
 * @param n The number to format
 * @param currencySymbol The currency symbol to use
 * @returns Formatted currency string
 */
export const formatCurrency = (n: number | undefined, currencySymbol: string): string => {
  if (n === undefined) {
    return "—";
  }
  return `${currencySymbol}${formatNumber(n)}`;
};

/**
 * Formats a number with the specified number of decimal places
 * @param n The number to format
 * @param decimals The number of decimal places
 * @returns Formatted number string
 */
export const formatNumber = (n: number | undefined, decimals = 2): string => {
  if (n === undefined) {
    return "—";
  }
  return n.toFixed(decimals);
};

/**
 * Creates a short summary of the item's price information
 * @param item The item to summarize
 * @returns A string summarizing the price information
 */
export const summarizePrice = (item: Item): string => {
  if (item.priceMode === "totalPrice") {
    if (item.priceTotal === undefined || item.packageAmount === undefined || item.packageUnit === undefined) {
      return "Invalid price data";
    }
    return `$${formatNumber(item.priceTotal)} for ${item.packageAmount} ${item.packageUnit}`;
  } else if (item.priceMode === "unitPrice") {
    if (item.unitPrice === undefined || item.unitPriceUnit === undefined) {
      return "Invalid price data";
    }
    
    let summary = `$${formatNumber(item.unitPrice)}/${item.unitPriceUnit}`;
    
    // Add package info if available
    if (item.packageAmountOptional !== undefined && item.packageUnitOptional !== undefined) {
      summary += ` (${item.packageAmountOptional} ${item.packageUnitOptional} pkg)`;
    }
    
    return summary;
  }
  
  return "Unknown price mode";
};

/**
 * Creates a short summary of the item's protein information
 * @param item The item to summarize
 * @returns A string summarizing the protein information
 */
export const summarizeProtein = (item: Item): string => {
  if (item.proteinBasis === "per100g") {
    if (item.proteinPer100g === undefined) {
      return "Invalid protein data";
    }
    return `${item.proteinPer100g}g per 100g`;
  } else if (item.proteinBasis === "perServing") {
    if (item.proteinPerServing === undefined || 
        item.servingSizeAmount === undefined || 
        item.servingSizeUnit === undefined) {
      return "Invalid protein data";
    }
    
    return `${item.proteinPerServing}g per ${item.servingSizeAmount}${item.servingSizeUnit} serving`;
  }
  
  return "Unknown protein basis";
};

/**
 * Formats a mass value with its unit
 * @param amount The amount
 * @param unit The unit
 * @returns Formatted mass string
 */
export const formatMass = (amount: number | undefined, unit: string | undefined): string => {
  if (amount === undefined || unit === undefined) {
    return "—";
  }
  return `${formatNumber(amount)}${unit}`;
};

/**
 * Formats protein per gram
 * @param gramsProteinPerGramProduct Grams of protein per gram of product
 * @returns Formatted protein per gram string
 */
export const formatProteinPerGram = (gramsProteinPerGramProduct: number | undefined): string => {
  if (gramsProteinPerGramProduct === undefined) {
    return "—";
  }
  // Format as percentage
  return `${formatNumber(gramsProteinPerGramProduct * 100, 1)}%`;
};

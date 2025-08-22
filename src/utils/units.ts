import type { UnitMass } from "../types";

// Conversion constants
export const LB_TO_G = 453.592;
export const OZ_TO_G = 28.3495;
export const KG_TO_G = 1000;

/**
 * Converts a mass value from the specified unit to grams
 * @param amount The amount to convert
 * @param unit The unit of the amount
 * @returns The equivalent amount in grams
 */
export const toGrams = (amount: number | undefined, unit: UnitMass | undefined): number | undefined => {
  if (amount === undefined || unit === undefined || amount <= 0) {
    return undefined;
  }

  switch (unit) {
    case "g":
      return amount;
    case "kg":
      return amount * KG_TO_G;
    case "oz":
      return amount * OZ_TO_G;
    case "lb":
      return amount * LB_TO_G;
    default:
      return undefined;
  }
};

/**
 * Returns the number of grams in one unit of the specified mass unit
 * @param unit The mass unit
 * @returns The number of grams in one unit
 */
export const gramsPer = (unit: UnitMass | undefined): number | undefined => {
  if (unit === undefined) {
    return undefined;
  }

  switch (unit) {
    case "g":
      return 1;
    case "kg":
      return KG_TO_G;
    case "oz":
      return OZ_TO_G;
    case "lb":
      return LB_TO_G;
    default:
      return undefined;
  }
};

/**
 * Helper function to safely handle potentially undefined numbers
 * @param n The number to check
 * @returns The number if it's defined and positive, otherwise undefined
 */
export const safeNumber = (n?: number): number | undefined => {
  if (n === undefined || n <= 0 || isNaN(n)) {
    return undefined;
  }
  return n;
};

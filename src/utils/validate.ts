import type { Item } from "../types";
import { safeNumber } from "./units";

type ValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};

/**
 * Validates an item for form submission
 * @param item The item to validate
 * @returns Validation result with errors by field
 */
export const validateItem = (item: Item): ValidationResult => {
  const result: ValidationResult = {
    valid: true,
    errors: {},
  };

  // Validate name
  if (!item.name || item.name.trim() === "") {
    result.valid = false;
    result.errors.name = "Name is required";
  }

  // Validate price fields based on price mode
  if (item.priceMode === "totalPrice") {
    if (safeNumber(item.priceTotal) === undefined) {
      result.valid = false;
      result.errors.priceTotal = "Total price must be a positive number";
    }

    if (safeNumber(item.packageAmount) === undefined) {
      result.valid = false;
      result.errors.packageAmount = "Package amount must be a positive number";
    }

    if (!item.packageUnit) {
      result.valid = false;
      result.errors.packageUnit = "Package unit is required";
    }
  } else if (item.priceMode === "unitPrice") {
    if (safeNumber(item.unitPrice) === undefined) {
      result.valid = false;
      result.errors.unitPrice = "Unit price must be a positive number";
    }

    if (!item.unitPriceUnit) {
      result.valid = false;
      result.errors.unitPriceUnit = "Unit price unit is required";
    }

    // Optional package fields - if one is provided, both must be valid
    if (item.packageAmountOptional !== undefined || item.packageUnitOptional !== undefined) {
      if (safeNumber(item.packageAmountOptional) === undefined) {
        result.valid = false;
        result.errors.packageAmountOptional = "Package amount must be a positive number";
      }

      if (!item.packageUnitOptional) {
        result.valid = false;
        result.errors.packageUnitOptional = "Package unit is required";
      }
    }
  } else {
    result.valid = false;
    result.errors.priceMode = "Invalid price mode";
  }

  // Validate protein fields based on protein basis
  if (item.proteinBasis === "per100g") {
    if (safeNumber(item.proteinPer100g) === undefined) {
      result.valid = false;
      result.errors.proteinPer100g = "Protein per 100g must be a positive number";
    }
  } else if (item.proteinBasis === "perServing") {
    if (safeNumber(item.servingSizeAmount) === undefined) {
      result.valid = false;
      result.errors.servingSizeAmount = "Serving size amount must be a positive number";
    }

    if (!item.servingSizeUnit) {
      result.valid = false;
      result.errors.servingSizeUnit = "Serving size unit is required";
    }

    if (safeNumber(item.proteinPerServing) === undefined) {
      result.valid = false;
      result.errors.proteinPerServing = "Protein per serving must be a positive number";
    }
  } else {
    result.valid = false;
    result.errors.proteinBasis = "Invalid protein basis";
  }

  return result;
};

/**
 * Checks if a specific field has an error
 * @param errors Validation errors
 * @param field Field name to check
 * @returns Error message or undefined
 */
export const getFieldError = (errors: Record<string, string>, field: string): string | undefined => {
  return errors[field];
};

/**
 * Checks if any field in a group has an error
 * @param errors Validation errors
 * @param fields Array of field names to check
 * @returns True if any field has an error
 */
export const hasGroupError = (errors: Record<string, string>, fields: string[]): boolean => {
  return fields.some(field => errors[field] !== undefined);
};

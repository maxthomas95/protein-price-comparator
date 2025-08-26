/**
 * Protein Price Comparator - Calculation Utilities
 * Pure functions for unit conversions, validation, and cost computations
 */

// Unit conversion constants
const GRAMS_PER_LB = 453.592;
const GRAMS_PER_OZ = 28.3495;
const GRAMS_PER_KG = 1000;

/**
 * Convert a quantity from any unit to grams
 * @param {number} amount - The amount to convert
 * @param {string} unit - The unit ('g', 'kg', 'oz', 'lb')
 * @returns {number} - The equivalent amount in grams
 */
export function gramsIn(amount, unit) {
  if (!amount || amount <= 0) return 0;
  
  switch (unit) {
    case 'g': return amount;
    case 'kg': return amount * GRAMS_PER_KG;
    case 'oz': return amount * GRAMS_PER_OZ;
    case 'lb': return amount * GRAMS_PER_LB;
    default: return 0;
  }
}

/**
 * Calculate the total grams in a serving
 * @param {number} servingSizeAmount - The serving size amount
 * @param {string} servingSizeUnit - The serving size unit ('g', 'kg', 'oz', 'lb')
 * @returns {number} - The serving size in grams
 */
export function servingGrams(servingSizeAmount, servingSizeUnit) {
  return gramsIn(servingSizeAmount, servingSizeUnit);
}

/**
 * Check if a number is positive (greater than zero)
 * @param {number} n - The number to check
 * @returns {boolean} - True if the number is positive
 */
export function isPositive(n) {
  return typeof n === 'number' && !isNaN(n) && n > 0;
}

/**
 * Check if required fields are present based on the item's mode
 * @param {Object} item - The item to validate
 * @returns {Object} - Object with valid flag and reason if invalid
 */
export function validateItem(item) {
  // Common required fields
  if (!item.name || item.name.trim() === '') {
    return { valid: false, reason: 'Name is required' };
  }
  
  // Validate pricing fields based on mode
  if (item.priceMode === 'unitPrice') {
    if (!isPositive(item.unitPrice)) {
      return { valid: false, reason: 'Unit price must be positive' };
    }
    if (!item.unitPriceUnit) {
      return { valid: false, reason: 'Unit price unit is required' };
    }
  } else if (item.priceMode === 'totalPrice') {
    if (!isPositive(item.priceTotal)) {
      return { valid: false, reason: 'Total price must be positive' };
    }
    if (!isPositive(item.packageAmount)) {
      return { valid: false, reason: 'Package amount must be positive' };
    }
    if (!item.packageUnit) {
      return { valid: false, reason: 'Package unit is required' };
    }
  } else {
    return { valid: false, reason: 'Invalid price mode' };
  }
  
  // Validate protein fields based on basis
  if (item.proteinBasis === 'per100g') {
    if (!isPositive(item.proteinPer100g)) {
      return { valid: false, reason: 'Protein per 100g must be positive' };
    }
  } else if (item.proteinBasis === 'perServing') {
    if (!isPositive(item.servingSizeAmount)) {
      return { valid: false, reason: 'Serving size amount must be positive' };
    }
    if (!item.servingSizeUnit) {
      return { valid: false, reason: 'Serving size unit is required' };
    }
    if (!isPositive(item.proteinPerServing)) {
      return { valid: false, reason: 'Protein per serving must be positive' };
    }
  } else {
    return { valid: false, reason: 'Invalid protein basis' };
  }
  
  return { valid: true };
}

/**
 * Calculate protein density per gram of product
 * @param {Object} item - The item to calculate for
 * @returns {Object} - Object with value, valid flag, and reason if invalid
 */
export function proteinDensityPerGram(item) {
  if (item.proteinBasis === 'per100g') {
    if (!isPositive(item.proteinPer100g)) {
      return { 
        value: 0, 
        valid: false, 
        reason: 'Protein per 100g must be positive' 
      };
    }
    return { 
      value: item.proteinPer100g / 100, 
      valid: true 
    };
  } else if (item.proteinBasis === 'perServing') {
    if (!isPositive(item.proteinPerServing) || 
        !isPositive(item.servingSizeAmount) || 
        !item.servingSizeUnit) {
      return { 
        value: 0, 
        valid: false, 
        reason: 'Invalid serving size or protein per serving' 
      };
    }
    
    const servingInGrams = servingGrams(item.servingSizeAmount, item.servingSizeUnit);
    if (servingInGrams <= 0) {
      return { 
        value: 0, 
        valid: false, 
        reason: 'Serving size must convert to a positive amount in grams' 
      };
    }
    
    return { 
      value: item.proteinPerServing / servingInGrams, 
      valid: true 
    };
  }
  
  return { 
    value: 0, 
    valid: false, 
    reason: 'Invalid protein basis' 
  };
}

/**
 * Calculate unit price per gram of product (not protein)
 * @param {Object} item - The item to calculate for
 * @returns {Object} - Object with value, valid flag, and reason if invalid
 */
export function unitPricePerGramProduct(item) {
  if (item.priceMode === 'unitPrice') {
    if (!isPositive(item.unitPrice) || !item.unitPriceUnit) {
      return { 
        value: 0, 
        valid: false, 
        reason: 'Invalid unit price or unit' 
      };
    }
    
    const gramsPerUnit = gramsIn(1, item.unitPriceUnit);
    if (gramsPerUnit <= 0) {
      return { 
        value: 0, 
        valid: false, 
        reason: 'Invalid unit price unit' 
      };
    }
    
    return { 
      value: item.unitPrice / gramsPerUnit, 
      valid: true 
    };
  } else if (item.priceMode === 'totalPrice') {
    if (!isPositive(item.priceTotal) || 
        !isPositive(item.packageAmount) || 
        !item.packageUnit) {
      return { 
        value: 0, 
        valid: false, 
        reason: 'Invalid total price, package amount, or unit' 
      };
    }
    
    const totalGrams = gramsIn(item.packageAmount, item.packageUnit);
    if (totalGrams <= 0) {
      return { 
        value: 0, 
        valid: false, 
        reason: 'Invalid package unit' 
      };
    }
    
    return { 
      value: item.priceTotal / totalGrams, 
      valid: true 
    };
  }
  
  return { 
    value: 0, 
    valid: false, 
    reason: 'Invalid price mode' 
  };
}

/**
 * Calculate derived metrics for an item
 * @param {Object} item - The item to calculate for
 * @param {number} targetGrams - The target grams of protein (default: 30)
 * @returns {Object} - Object with derived values and validity information
 */
export function derive(item, targetGrams = 30) {
  const result = {
    valid: false,
    reason: '',
    costPerGram: 0,
    costPerTarget: 0,
    pricePerGramProduct: 0,
    warnings: []
  };
  
  // Validate the item first
  const validation = validateItem(item);
  if (!validation.valid) {
    result.reason = validation.reason;
    return result;
  }
  
  // Calculate protein density
  const proteinDensity = proteinDensityPerGram(item);
  if (!proteinDensity.valid) {
    result.reason = proteinDensity.reason;
    return result;
  }
  
  // Calculate unit price per gram of product
  const unitPrice = unitPricePerGramProduct(item);
  if (!unitPrice.valid) {
    result.reason = unitPrice.reason;
    return result;
  }
  
  // Store the price per gram of product for sorting
  result.pricePerGramProduct = unitPrice.value;
  
  // Calculate cost per gram of protein
  if (proteinDensity.value <= 0) {
    result.reason = 'Protein density must be positive';
    return result;
  }
  
  result.costPerGram = unitPrice.value / proteinDensity.value;
  result.costPerTarget = result.costPerGram * targetGrams;
  
  // Add additional calculations for total price mode
  if (item.priceMode === 'totalPrice') {
    const totalGrams = gramsIn(item.packageAmount, item.packageUnit);
    result.gramsTotal = totalGrams;
    
    let gramsProteinTotal;
    if (item.proteinBasis === 'per100g') {
      gramsProteinTotal = totalGrams * (item.proteinPer100g / 100);
    } else if (item.proteinBasis === 'perServing') {
      const servingInGrams = servingGrams(item.servingSizeAmount, item.servingSizeUnit);
      const servings = totalGrams / servingInGrams;
      gramsProteinTotal = servings * item.proteinPerServing;
    }
    
    result.gramsProteinTotal = gramsProteinTotal;
    
    // Add warning if total protein is very low
    if (gramsProteinTotal < 1) {
      result.warnings.push('Very low total protein content');
    }
  }
  
  result.valid = true;
  return result;
}

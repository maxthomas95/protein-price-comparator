/**
 * Protein Price Comparator - Formatting Utilities
 * Functions for formatting money, quantities, and derived values
 */

/**
 * Format a number as currency
 * @param {number} value - The value to format
 * @param {string} symbol - The currency symbol (default: '$')
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} - Formatted currency string
 */
export function formatMoney(value, symbol = '$', decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  
  return `${symbol}${value.toFixed(decimals)}`;
}

/**
 * Format a quantity with its unit
 * @param {number} amount - The amount
 * @param {string} unit - The unit ('g', 'kg', 'oz', 'lb')
 * @returns {string} - Formatted quantity string
 */
export function formatQty(amount, unit) {
  if (amount === null || amount === undefined || isNaN(amount) || !unit) {
    return '—';
  }
  
  // Handle pluralization for lb and oz
  let displayUnit = unit;
  if (amount !== 1) {
    if (unit === 'lb') displayUnit = 'lb';
    if (unit === 'oz') displayUnit = 'oz';
  }
  
  return `${amount} ${displayUnit}`;
}

/**
 * Format cost per gram of protein
 * @param {number} value - The value to format
 * @param {string} symbol - The currency symbol
 * @returns {string} - Formatted cost per gram
 */
export function formatPerGram(value, symbol = '$') {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  
  return formatMoney(value, symbol, 4);
}

/**
 * Format cost per target amount of protein
 * @param {number} value - The value to format
 * @param {string} symbol - The currency symbol
 * @returns {string} - Formatted cost per target
 */
export function formatPerTarget(value, symbol = '$') {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  
  return formatMoney(value, symbol, 4);
}

/**
 * Generate a price summary string based on the item's price mode
 * @param {Object} item - The item
 * @param {string} symbol - The currency symbol
 * @returns {string} - Formatted price summary
 */
export function priceSummary(item, symbol = '$') {
  if (!item) return '—';
  
  if (item.priceMode === 'unitPrice') {
    if (!item.unitPrice || !item.unitPriceUnit) return '—';
    return `${formatMoney(item.unitPrice, symbol)} / ${item.unitPriceUnit}`;
  } else if (item.priceMode === 'totalPrice') {
    if (!item.priceTotal || !item.packageAmount || !item.packageUnit) return '—';
    return `${formatMoney(item.priceTotal, symbol)} for ${item.packageAmount} ${item.packageUnit}`;
  }
  
  return '—';
}

/**
 * Generate a protein summary string based on the item's protein basis
 * @param {Object} item - The item
 * @returns {string} - Formatted protein summary
 */
export function proteinSummary(item) {
  if (!item) return '—';
  
  if (item.proteinBasis === 'per100g') {
    if (!item.proteinPer100g) return '—';
    return `${item.proteinPer100g} g per 100 g`;
  } else if (item.proteinBasis === 'perServing') {
    if (!item.proteinPerServing || !item.servingSizeAmount || !item.servingSizeUnit) return '—';
    return `${item.proteinPerServing} g per ${item.servingSizeAmount} ${item.servingSizeUnit} serving`;
  }
  
  return '—';
}

/**
 * Format a derived value or show invalid placeholder
 * @param {Object} derived - The derived calculation result
 * @param {string} property - The property to display
 * @param {Function} formatter - The formatting function to use
 * @param {string} symbol - The currency symbol
 * @returns {Object} - Object with formatted value and title (for tooltips)
 */
export function formatDerived(derived, property, formatter, symbol = '$') {
  if (!derived || !derived.valid) {
    return {
      value: '—',
      title: derived ? derived.reason : 'Invalid calculation'
    };
  }
  
  const value = derived[property];
  if (value === undefined || value === null || isNaN(value)) {
    return {
      value: '—',
      title: 'Value not available'
    };
  }
  
  return {
    value: formatter(value, symbol),
    title: ''
  };
}

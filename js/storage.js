/**
 * Protein Price Comparator - Storage Utilities
 * Functions for LocalStorage persistence and initial data seeding
 */

// LocalStorage key
const STORAGE_KEY = 'ppc:v1';

// Default settings
const DEFAULT_SETTINGS = {
  currencySymbol: '$',
  targetGrams: 30
};

/**
 * Generate a simple UUID
 * Uses crypto.randomUUID() if available, otherwise falls back to a simple implementation
 * @returns {string} - A UUID
 */
export function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  
  // Simple fallback UUID generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Create seed data for first-time users
 * @returns {Array} - Array of sample items
 */
function createSeedData() {
  return [
    {
      id: generateId(),
      name: 'Chicken breast',
      brand: 'Kirkland',
      store: 'Costco',
      favorite: false,
      
      // Unit price mode
      priceMode: 'unitPrice',
      unitPrice: 2.49,
      unitPriceUnit: 'lb',
      
      // Protein per 100g
      proteinBasis: 'per100g',
      proteinPer100g: 31
    },
    {
      id: generateId(),
      name: 'Whey isolate',
      brand: 'ON',
      store: 'Amazon',
      favorite: false,
      
      // Total price mode
      priceMode: 'totalPrice',
      priceTotal: 39.99,
      packageAmount: 5,
      packageUnit: 'lb',
      
      // Protein per serving
      proteinBasis: 'perServing',
      servingSizeAmount: 32,
      servingSizeUnit: 'g',
      proteinPerServing: 25
    },
    {
      id: generateId(),
      name: 'Greek yogurt (2%)',
      brand: 'Fage',
      store: 'Kroger',
      favorite: false,
      
      // Total price mode
      priceMode: 'totalPrice',
      priceTotal: 5.49,
      packageAmount: 32,
      packageUnit: 'oz',
      
      // Protein per 100g
      proteinBasis: 'per100g',
      proteinPer100g: 10
    }
  ];
}

/**
 * Load data from LocalStorage
 * If no data exists, seed with initial data
 * @returns {Object} - The loaded state
 */
export function load() {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    
    if (storedData) {
      return JSON.parse(storedData);
    }
    
    // No data found, create initial state with seed data
    const initialState = {
      items: createSeedData(),
      settings: { ...DEFAULT_SETTINGS }
    };
    
    // Save the initial state
    save(initialState);
    
    return initialState;
  } catch (error) {
    console.error('Error loading data from LocalStorage:', error);
    
    // Return a default state in case of error
    return {
      items: [],
      settings: { ...DEFAULT_SETTINGS }
    };
  }
}

/**
 * Save data to LocalStorage
 * @param {Object} state - The state to save
 */
export function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving data to LocalStorage:', error);
  }
}

/**
 * Create a new item with default values
 * @returns {Object} - A new item with default values
 */
export function createNewItem() {
  return {
    id: generateId(),
    name: '',
    brand: '',
    store: '',
    favorite: false,
    
    // Default to unit price mode
    priceMode: 'unitPrice',
    unitPrice: '',
    unitPriceUnit: 'lb',
    
    // Default to protein per 100g
    proteinBasis: 'per100g',
    proteinPer100g: '',
    
    // Empty fields for other modes
    priceTotal: '',
    packageAmount: '',
    packageUnit: 'lb',
    servingSizeAmount: '',
    servingSizeUnit: 'g',
    proteinPerServing: ''
  };
}

/**
 * Create a duplicate of an existing item with a new ID
 * @param {Object} item - The item to duplicate
 * @returns {Object} - A new item with the same values but a new ID
 */
export function duplicateItem(item) {
  return {
    ...item,
    id: generateId(),
    name: `${item.name} (Copy)`
  };
}

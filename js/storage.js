/**
 * Protein Price Comparator - Storage Utilities
 * Functions for API-first persistence with LocalStorage fallback
 */

// LocalStorage key for fallback mode
const STORAGE_KEY = 'ppc:v1';
const API_BASE = '/api';

// Default settings
const DEFAULT_SETTINGS = {
  currencySymbol: '$',
  targetGrams: 30
};

// State management
let isOnlineMode = true;
let saveDebounceTimer = null;

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
      quality: 8,
      notes: 'High quality lean protein',
      
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
      quality: 9,
      notes: 'Fast absorbing, great for post-workout',
      
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
      quality: 7,
      notes: 'Creamy texture, good for snacks',
      
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
 * Load data from LocalStorage fallback
 * @returns {Object} - The loaded state
 */
function loadFromLocalStorage() {
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
 * Save data to LocalStorage fallback
 * @param {Object} state - The state to save
 */
function saveToLocalStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving data to LocalStorage:', error);
  }
}

/**
 * Load data from API or fallback to LocalStorage
 * @returns {Object} - The loaded state
 */
export async function load() {
  try {
    // Try to load from API first
    const response = await fetch(`${API_BASE}/state`);
    
    if (!response.ok) {
      throw new Error(`API responded with ${response.status}`);
    }
    
    const serverState = await response.json();
    isOnlineMode = true;
    
    // Check if we need to migrate from localStorage to server
    const localState = loadFromLocalStorage();
    
    // If server has no items but local storage does, migrate to server
    if (serverState.items.length === 0 && localState.items.length > 0) {
      console.log('Migrating local data to server...');
      await saveToAPI(localState);
      return localState;
    }
    
    return serverState;
  } catch (error) {
    console.warn('API unavailable, using offline mode:', error);
    isOnlineMode = false;
    
    // Show user notification about offline mode
    showOfflineNotification();
    
    return loadFromLocalStorage();
  }
}

/**
 * Save data to API
 * @param {Object} state - The state to save
 */
async function saveToAPI(state) {
  const response = await fetch(`${API_BASE}/state`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(state)
  });
  
  if (!response.ok) {
    throw new Error(`API save failed with ${response.status}`);
  }
}

/**
 * Save data with API-first approach and localStorage fallback
 * @param {Object} state - The state to save
 */
export function save(state) {
  // Clear any pending debounced save
  if (saveDebounceTimer) {
    clearTimeout(saveDebounceTimer);
  }
  
  // Debounce API saves to avoid too many requests
  saveDebounceTimer = setTimeout(async () => {
    if (isOnlineMode) {
      try {
        await saveToAPI(state);
      } catch (error) {
        console.warn('API save failed, switching to offline mode:', error);
        isOnlineMode = false;
        showOfflineNotification();
        // Fall back to localStorage
        saveToLocalStorage(state);
      }
    } else {
      // Save to localStorage in offline mode
      saveToLocalStorage(state);
    }
  }, 500); // 500ms debounce
}

/**
 * Show offline notification to user
 */
function showOfflineNotification() {
  // Create a simple notification banner
  let banner = document.getElementById('offline-banner');
  
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'offline-banner';
    banner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background-color: #ff9800;
      color: white;
      padding: 8px;
      text-align: center;
      font-size: 14px;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;
    banner.textContent = 'Offline mode - Data saved locally only';
    document.body.prepend(banner);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (banner && banner.parentNode) {
        banner.parentNode.removeChild(banner);
      }
    }, 5000);
  }
}

/**
 * Check if currently in online mode
 * @returns {boolean} - True if connected to API
 */
export function isOnline() {
  return isOnlineMode;
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
    quality: null,
    notes: '',
    
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
    name: `${item.name} (Copy)`,
    quality: item.quality !== null && item.quality !== undefined ? item.quality : null,
    notes: item.notes || ''
  };
}

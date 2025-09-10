const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = '/data';
const STATE_FILE = path.join(DATA_DIR, 'state.json');
const TEMP_FILE = path.join(DATA_DIR, 'state.tmp');

// Default state
const DEFAULT_STATE = {
  items: [
    {
      id: 'seed-1',
      name: 'Chicken breast',
      brand: 'Kirkland',
      store: 'Costco',
      favorite: false,
      quality: 8,
      notes: 'High quality lean protein',
      priceMode: 'unitPrice',
      unitPrice: 2.49,
      unitPriceUnit: 'lb',
      proteinBasis: 'per100g',
      proteinPer100g: 31
    },
    {
      id: 'seed-2',
      name: 'Whey isolate',
      brand: 'ON',
      store: 'Amazon',
      favorite: false,
      quality: 9,
      notes: 'Fast absorbing, great for post-workout',
      priceMode: 'totalPrice',
      priceTotal: 39.99,
      packageAmount: 5,
      packageUnit: 'lb',
      proteinBasis: 'perServing',
      servingSizeAmount: 32,
      servingSizeUnit: 'g',
      proteinPerServing: 25
    },
    {
      id: 'seed-3',
      name: 'Greek yogurt (2%)',
      brand: 'Fage',
      store: 'Kroger',
      favorite: false,
      quality: 7,
      notes: 'Creamy texture, good for snacks',
      priceMode: 'totalPrice',
      priceTotal: 5.49,
      packageAmount: 32,
      packageUnit: 'oz',
      proteinBasis: 'per100g',
      proteinPer100g: 10
    }
  ],
  settings: {
    currencySymbol: '$',
    targetGrams: 30
  }
};

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Write queue to prevent concurrent writes
let writeQueue = Promise.resolve();

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch (error) {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Safe write with atomic operation
async function safeWriteState(state) {
  return new Promise((resolve, reject) => {
    writeQueue = writeQueue.then(async () => {
      try {
        // Write to temp file first
        await fs.writeFile(TEMP_FILE, JSON.stringify(state, null, 2), 'utf8');
        // Atomic rename
        await fs.rename(TEMP_FILE, STATE_FILE);
        console.log('State saved successfully');
        resolve();
      } catch (error) {
        console.error('Error saving state:', error);
        reject(error);
      }
    });
  });
}

// Load state from file
async function loadState() {
  try {
    const data = await fs.readFile(STATE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log('No existing state file, using default state');
    return DEFAULT_STATE;
  }
}

// Validate state structure
function validateState(state) {
  if (!state || typeof state !== 'object') {
    return false;
  }
  
  if (!Array.isArray(state.items)) {
    return false;
  }
  
  if (!state.settings || typeof state.settings !== 'object') {
    return false;
  }
  
  return true;
}

// Routes
app.get('/api/state', async (req, res) => {
  try {
    const state = await loadState();
    res.json(state);
  } catch (error) {
    console.error('Error loading state:', error);
    res.status(500).json({ error: 'Failed to load state' });
  }
});

app.put('/api/state', async (req, res) => {
  try {
    const newState = req.body;
    
    // Validate the state structure
    if (!validateState(newState)) {
      return res.status(400).json({ error: 'Invalid state structure' });
    }
    
    // Save the state
    await safeWriteState(newState);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error saving state:', error);
    res.status(500).json({ error: 'Failed to save state' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function start() {
  try {
    await ensureDataDir();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`PPC API server running on port ${PORT}`);
      console.log(`Data directory: ${DATA_DIR}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
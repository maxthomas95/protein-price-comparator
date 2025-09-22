/**
 * Protein Price Comparator - Main Application
 * Handles state management, rendering, and event handling
 */

import * as calc from './calc.js';
import * as format from './format.js';
import * as storage from './storage.js';
import * as dom from './dom.js';

// Application state
let state = {
  items: [],
  settings: {
    currencySymbol: '$',
    targetGrams: 30
  },
  ui: {
    search: '',
    favoritesOnly: false,
    sortKey: 'costPerTarget',
    sortDir: 'asc',
    editingItem: null
  }
};

// DOM elements cache
const elements = {};

// Focus traps for dialogs
const focusTraps = {};

/**
 * Initialize the application
 */
async function init() {
  // Cache DOM elements
  cacheElements();
  
  // Load data from storage (API-first; await Promise)
  const loadedState = await storage.load();
  
  // Merge loaded state with default state, preserving UI state
  state = {
    items: loadedState.items || [],
    settings: loadedState.settings || { ...state.settings },
    ui: { ...state.ui } // Preserve UI state
  };
  
  // Set up event listeners
  setupEventListeners();
  
  // Initial render
  render();
}

/**
 * Cache DOM elements for faster access
 */
function cacheElements() {
  // Header elements
  elements.addItemBtn = dom.qs('#add-item-btn');
  elements.settingsBtn = dom.qs('#settings-btn');
  
  // Controls elements
  elements.searchInput = dom.qs('#search-input');
  elements.favoritesCheckbox = dom.qs('#favorites-only');
  elements.sortSelect = dom.qs('#sort-select');
  elements.sortDirBtn = dom.qs('#sort-dir-btn');
  
  // Table elements
  elements.tableBody = dom.qs('#items-table-body');
  elements.emptyState = dom.qs('#empty-state');
  
  // Dialog elements
  elements.itemDialog = dom.qs('#item-dialog');
  elements.itemForm = dom.qs('#item-form');
  elements.settingsDialog = dom.qs('#settings-dialog');
  elements.settingsForm = dom.qs('#settings-form');
  
  // Create focus traps for dialogs
  focusTraps.itemDialog = dom.createFocusTrap(elements.itemDialog);
  focusTraps.settingsDialog = dom.createFocusTrap(elements.settingsDialog);
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Header buttons
  elements.addItemBtn.addEventListener('click', () => openItemDialog());
  elements.settingsBtn.addEventListener('click', () => openSettingsDialog());
  
  // Empty state add button
  const emptyAddBtn = dom.qs('#empty-add-btn');
  if (emptyAddBtn) {
    emptyAddBtn.addEventListener('click', () => openItemDialog());
  }
  
  // Controls
  elements.searchInput.addEventListener('input', e => {
    state.ui.search = e.target.value;
    render();
  });
  
  elements.favoritesCheckbox.addEventListener('change', e => {
    state.ui.favoritesOnly = e.target.checked;
    render();
  });
  
  elements.sortSelect.addEventListener('change', e => {
    state.ui.sortKey = e.target.value;
    render();
  });
  
  elements.sortDirBtn.addEventListener('click', () => {
    state.ui.sortDir = state.ui.sortDir === 'asc' ? 'desc' : 'asc';
    render();
  });
  
  // Table actions using event delegation
  dom.on(elements.tableBody, 'click', '.btn-favorite', (e, target) => {
    const id = target.closest('tr').dataset.id;
    toggleFavorite(id);
  });
  
  dom.on(elements.tableBody, 'click', '.btn-edit', (e, target) => {
    const id = target.closest('tr').dataset.id;
    const item = state.items.find(item => item.id === id);
    if (item) {
      openItemDialog(item);
    }
  });
  
  dom.on(elements.tableBody, 'click', '.btn-duplicate', (e, target) => {
    const id = target.closest('tr').dataset.id;
    const index = state.items.findIndex(i => i.id === id);
    if (index !== -1) {
      // Create deep copy with a new ID and name
      const source = state.items[index];
      const duplicate = { ...source, id: storage.generateId(), name: `Copy of ${source.name}` };
      // Insert directly below the original
      state.items.splice(index + 1, 0, duplicate);
      // Persist and re-render
      storage.save(state);
      render();
      // Open editor for the new copy and focus the name input
      openItemDialog(duplicate);
      setTimeout(() => {
        const nameInput = dom.qs('input[name="name"]', elements.itemForm);
        if (nameInput) nameInput.focus();
      }, 10);
    }
  });
  
  dom.on(elements.tableBody, 'click', '.btn-delete', (e, target) => {
    const id = target.closest('tr').dataset.id;
    if (confirm('Are you sure you want to delete this item?')) {
      deleteItem(id);
    }
  });
  
  // Item dialog
  elements.itemDialog.addEventListener('close', () => {
    focusTraps.itemDialog.deactivate();
  });
  
  // Close and cancel buttons for item dialog
  const itemDialogCloseBtn = dom.qs('.dialog-close', elements.itemDialog);
  if (itemDialogCloseBtn) {
    itemDialogCloseBtn.addEventListener('click', () => {
      elements.itemDialog.close();
    });
  }
  
  const itemDialogCancelBtn = dom.qs('.dialog-cancel', elements.itemForm);
  if (itemDialogCancelBtn) {
    itemDialogCancelBtn.addEventListener('click', () => {
      elements.itemDialog.close();
    });
  }
  
  elements.itemForm.addEventListener('submit', e => {
    e.preventDefault();
    saveItemFromForm();
  });
  
  // Settings dialog
  elements.settingsDialog.addEventListener('close', () => {
    focusTraps.settingsDialog.deactivate();
  });
  
  // Close and cancel buttons for settings dialog
  const settingsDialogCloseBtn = dom.qs('.dialog-close', elements.settingsDialog);
  if (settingsDialogCloseBtn) {
    settingsDialogCloseBtn.addEventListener('click', () => {
      elements.settingsDialog.close();
    });
  }
  
  const settingsDialogCancelBtn = dom.qs('.dialog-cancel', elements.settingsForm);
  if (settingsDialogCancelBtn) {
    settingsDialogCancelBtn.addEventListener('click', () => {
      elements.settingsDialog.close();
    });
  }
  
  elements.settingsForm.addEventListener('submit', e => {
    e.preventDefault();
    saveSettingsFromForm();
  });
  
  // Form radio toggles
  setupFormToggleListeners();
}

/**
 * Set up listeners for form radio toggles
 */
function setupFormToggleListeners() {
  // Price mode toggle
  dom.on(elements.itemForm, 'change', 'input[name="priceMode"]', () => {
    updateFormVisibility();
    updateLivePreview();
  });
  
  // Protein basis toggle
  dom.on(elements.itemForm, 'change', 'input[name="proteinBasis"]', () => {
    updateFormVisibility();
    updateLivePreview();
  });
  
  // Input changes for live preview
  dom.on(elements.itemForm, 'input', 'input[type="text"], input[type="number"]', () => {
    updateLivePreview();
  });
  
  dom.on(elements.itemForm, 'change', 'select', () => {
    updateLivePreview();
  });
  
  // Quality slider sync
  dom.on(elements.itemForm, 'input', '#item-quality-slider', (e) => {
    const qualityInput = dom.qs('#item-quality', elements.itemForm);
    qualityInput.value = e.target.value;
  });
  
  dom.on(elements.itemForm, 'input', '#item-quality', (e) => {
    const qualitySlider = dom.qs('#item-quality-slider', elements.itemForm);
    qualitySlider.value = e.target.value || 5;
  });
}

/**
 * Main render function
 */
function render() {
  renderTable();
  renderControls();
  updateEmptyState();
}

/**
 * Render the table with items
 */
function renderTable() {
  // Get filtered and sorted items
  const items = getFilteredAndSortedItems();
  
  // Clear the table body
  elements.tableBody.innerHTML = '';
  
  // Render each item
  items.forEach(item => {
    const row = renderTableRow(item);
    elements.tableBody.appendChild(row);
  });
  
  // Update aria-sort on table headers
  updateTableHeaders();
}

/**
 * Render a single table row for an item
 * @param {Object} item - The item to render
 * @returns {Element} - The table row element
 */
function renderTableRow(item) {
  // Calculate derived values
  const derived = calc.derive(item, state.settings.targetGrams);
  
  // Format values
  const costPerGram = format.formatDerived(derived, 'costPerGram', format.formatPerGram, state.settings.currencySymbol);
  const costPerTarget = format.formatDerived(derived, 'costPerTarget', format.formatPerTarget, state.settings.currencySymbol);
  
  // Create the row
  const row = dom.createEl('tr', {
    className: derived.valid ? '' : 'invalid-item',
    dataset: { id: item.id }
  });
  
  // Favorite column
  const favoriteCell = dom.createEl('td', { className: 'col-favorite' });
  const favoriteBtn = dom.createEl('button', {
    className: `btn-icon btn-favorite ${item.favorite ? 'active' : ''}`,
    title: item.favorite ? 'Remove from favorites' : 'Add to favorites',
    type: 'button'
  });
  
  favoriteBtn.innerHTML = `<svg class="icon"><use href="assets/icons.svg#star"></use></svg>`;
  favoriteCell.appendChild(favoriteBtn);
  
  // Name column
  const nameCell = dom.createEl('td', { className: 'col-name' });
  const nameDiv = dom.createEl('div', {}, item.name);
  
  // Brand and store info
  if (item.brand || item.store) {
    const brandStore = [];
    if (item.brand) brandStore.push(item.brand);
    if (item.store) brandStore.push(item.store);
    
    const brandStoreDiv = dom.createEl('div', {
      className: 'brand-store'
    }, brandStore.join(' — '));
    
    nameDiv.appendChild(brandStoreDiv);
  }
  
  nameCell.appendChild(nameDiv);
  
  // Price column
  const priceCell = dom.createEl('td', { className: 'col-price' });
  priceCell.textContent = format.priceSummary(item, state.settings.currencySymbol);
  
  // Protein column
  const proteinCell = dom.createEl('td', { className: 'col-protein' });
  proteinCell.textContent = format.proteinSummary(item);
  
  // Cost per gram column
  const costPerGramCell = dom.createEl('td', { className: 'col-cost-per-g' });
  costPerGramCell.textContent = costPerGram.value;
  if (costPerGram.title) {
    costPerGramCell.title = costPerGram.title;
  }
  
  // Cost per target column
  const costPerTargetCell = dom.createEl('td', { className: 'col-cost-per-target' });
  costPerTargetCell.textContent = costPerTarget.value;
  if (costPerTarget.title) {
    costPerTargetCell.title = costPerTarget.title;
  }
  
  // Add warning icon if needed
  if (derived.valid && derived.warnings && derived.warnings.length > 0) {
    const warningIcon = dom.createEl('span', {
      className: 'warning-icon',
      title: derived.warnings.join('. ')
    }, '⚠');
    costPerTargetCell.appendChild(warningIcon);
  }
  
  // Quality column
  const qualityCell = dom.createEl('td', { className: 'col-quality' });
  qualityCell.textContent = item.quality !== null && item.quality !== undefined ? item.quality : '—';
  
  // Actions column
  const actionsCell = dom.createEl('td', { className: 'col-actions' });
  
  // Edit button
  const editBtn = dom.createEl('button', {
    className: 'btn-icon btn-action btn-edit',
    title: 'Edit',
    type: 'button'
  });
  editBtn.innerHTML = `<svg class="icon"><use href="assets/icons.svg#edit"></use></svg>`;
  
  // Duplicate button
  const duplicateBtn = dom.createEl('button', {
    className: 'btn-icon btn-action btn-duplicate',
    title: 'Duplicate',
    type: 'button'
  });
  duplicateBtn.innerHTML = `<svg class="icon"><use href="assets/icons.svg#duplicate"></use></svg>`;
  
  // Delete button
  const deleteBtn = dom.createEl('button', {
    className: 'btn-icon btn-delete',
    title: 'Delete',
    type: 'button'
  });
  deleteBtn.innerHTML = `<svg class="icon"><use href="assets/icons.svg#delete"></use></svg>`;
  
  actionsCell.append(editBtn, duplicateBtn, deleteBtn);
  
  // Add all cells to the row
  row.append(
    favoriteCell,
    nameCell,
    priceCell,
    proteinCell,
    costPerGramCell,
    costPerTargetCell,
    qualityCell,
    actionsCell
  );
  
  return row;
}

/**
 * Update the table headers based on sort state
 */
function updateTableHeaders() {
  // Find the header corresponding to the current sort key
  const headers = dom.qsa('th[data-sort]');
  
  // Remove aria-sort from all headers
  headers.forEach(header => {
    header.removeAttribute('aria-sort');
  });
  
  // Find the header for the current sort key
  const currentHeader = Array.from(headers).find(
    header => header.dataset.sort === state.ui.sortKey
  );
  
  // Set aria-sort on the current header
  if (currentHeader) {
    currentHeader.setAttribute('aria-sort', state.ui.sortDir);
  }
}

/**
 * Render the controls based on current state
 */
function renderControls() {
  // Update search input
  elements.searchInput.value = state.ui.search;
  
  // Update favorites checkbox
  elements.favoritesCheckbox.checked = state.ui.favoritesOnly;
  
  // Update sort select
  elements.sortSelect.value = state.ui.sortKey;
  
  // Update sort direction button
  elements.sortDirBtn.textContent = state.ui.sortDir === 'asc' ? '↑' : '↓';
  elements.sortDirBtn.title = state.ui.sortDir === 'asc' ? 'Ascending' : 'Descending';

  // Reactive labels for target grams
  const target = state.settings.targetGrams;
  const opt = dom.qs('#sort-select option[value="costPerTarget"]');
  if (opt) opt.textContent = `$ / ${target}g`;
  const header = dom.qs('th.col-cost-per-target[data-sort="costPerTarget"]');
  if (header) header.textContent = `$ / ${target}g`;
}

/**
 * Update the empty state visibility
 */
function updateEmptyState() {
  const items = getFilteredAndSortedItems();
  
  if (items.length === 0) {
    elements.emptyState.classList.remove('hidden');
    elements.tableBody.closest('table').classList.add('hidden');
  } else {
    elements.emptyState.classList.add('hidden');
    elements.tableBody.closest('table').classList.remove('hidden');
  }
}

/**
 * Get filtered and sorted items based on current UI state
 * @returns {Array} - Filtered and sorted items
 */
function getFilteredAndSortedItems() {
  // Start with all items
  let items = [...state.items];
  
  // Filter by search
  if (state.ui.search) {
    const search = state.ui.search.toLowerCase();
    items = items.filter(item => {
      return (
        (item.name && item.name.toLowerCase().includes(search)) ||
        (item.brand && item.brand.toLowerCase().includes(search)) ||
        (item.store && item.store.toLowerCase().includes(search))
      );
    });
  }
  
  // Filter by favorites
  if (state.ui.favoritesOnly) {
    items = items.filter(item => item.favorite);
  }
  
  // Sort items
  items.sort((a, b) => {
    const derivedA = calc.derive(a, state.settings.targetGrams);
    const derivedB = calc.derive(b, state.settings.targetGrams);
    
    // Handle invalid items (move to bottom)
    if (!derivedA.valid && !derivedB.valid) return 0;
    if (!derivedA.valid) return 1;
    if (!derivedB.valid) return -1;
    
    let result = 0;
    
    switch (state.ui.sortKey) {
      case 'costPerTarget':
        result = derivedA.costPerTarget - derivedB.costPerTarget;
        break;
      case 'costPerGram':
        result = derivedA.costPerGram - derivedB.costPerGram;
        break;
      case 'priceEffective':
        result = derivedA.pricePerGramProduct - derivedB.pricePerGramProduct;
        break;
      case 'name':
        result = (a.name || '').localeCompare(b.name || '');
        break;
      case 'brand':
        result = (a.brand || '').localeCompare(b.brand || '');
        break;
      case 'store':
        result = (a.store || '').localeCompare(b.store || '');
        break;
      case 'quality':
        // Sort by quality; always move null/undefined to bottom regardless of sort direction
        if (a.quality === null || a.quality === undefined) return 1;
        if (b.quality === null || b.quality === undefined) return -1;
        result = a.quality - b.quality;
        break;
      default:
        result = 0;
    }
    
    // Apply sort direction
    return state.ui.sortDir === 'asc' ? result : -result;
  });
  
  return items;
}

/**
 * Toggle favorite status for an item
 * @param {string} id - Item ID
 */
function toggleFavorite(id) {
  const item = state.items.find(item => item.id === id);
  if (item) {
    item.favorite = !item.favorite;
    storage.save(state);
    render();
  }
}

/**
 * Delete an item
 * @param {string} id - Item ID
 */
function deleteItem(id) {
  state.items = state.items.filter(item => item.id !== id);
  storage.save(state);
  render();
}

/**
 * Open the item dialog for adding or editing an item
 * @param {Object} [item] - The item to edit (null for new item)
 */
function openItemDialog(item = null) {
  // Set editing item
  state.ui.editingItem = item;
  
  // Set dialog title
  const titleEl = dom.qs('.dialog-header h2', elements.itemDialog);
  titleEl.textContent = item ? 'Edit Item' : 'Add Item';
  
  // Reset form
  elements.itemForm.reset();
  
  // Fill form with item data if editing
  if (item) {
    fillItemForm(item);
  } else {
    // Set defaults for new item
    dom.qs('input[name="priceMode"][value="unitPrice"]', elements.itemForm).checked = true;
    dom.qs('input[name="proteinBasis"][value="per100g"]', elements.itemForm).checked = true;
    
    // Set default units
    dom.qs('select[name="unitPriceUnit"]', elements.itemForm).value = 'lb';
    dom.qs('select[name="packageUnit"]', elements.itemForm).value = 'lb';
    dom.qs('select[name="servingSizeUnit"]', elements.itemForm).value = 'g';
  }
  
  // Update form visibility based on selected modes
  updateFormVisibility();
  
  // Update live preview
  updateLivePreview();
  
  // Show the dialog
  elements.itemDialog.showModal();
  focusTraps.itemDialog.activate();
}

/**
 * Fill the item form with data from an item
 * @param {Object} item - The item to fill the form with
 */
function fillItemForm(item) {
  // Set price mode
  dom.qs(`input[name="priceMode"][value="${item.priceMode}"]`, elements.itemForm).checked = true;
  
  // Set protein basis
  dom.qs(`input[name="proteinBasis"][value="${item.proteinBasis}"]`, elements.itemForm).checked = true;
  
  // Set text fields
  dom.qs('input[name="name"]', elements.itemForm).value = item.name || '';
  dom.qs('input[name="brand"]', elements.itemForm).value = item.brand || '';
  dom.qs('input[name="store"]', elements.itemForm).value = item.store || '';
  dom.qs('input[name="favorite"]', elements.itemForm).checked = item.favorite || false;
  
  // Set unit price fields
  dom.qs('input[name="unitPrice"]', elements.itemForm).value = item.unitPrice || '';
  dom.qs('select[name="unitPriceUnit"]', elements.itemForm).value = item.unitPriceUnit || 'lb';
  
  // Set total price fields
  dom.qs('input[name="priceTotal"]', elements.itemForm).value = item.priceTotal || '';
  dom.qs('input[name="packageAmount"]', elements.itemForm).value = item.packageAmount || '';
  dom.qs('select[name="packageUnit"]', elements.itemForm).value = item.packageUnit || 'lb';
  
  // Set protein per 100g field
  dom.qs('input[name="proteinPer100g"]', elements.itemForm).value = item.proteinPer100g || '';
  
  // Set protein per serving fields
  dom.qs('input[name="servingSizeAmount"]', elements.itemForm).value = item.servingSizeAmount || '';
  dom.qs('select[name="servingSizeUnit"]', elements.itemForm).value = item.servingSizeUnit || 'g';
  dom.qs('input[name="proteinPerServing"]', elements.itemForm).value = item.proteinPerServing || '';
  
  // Set quality and notes fields
  dom.qs('input[name="quality"]', elements.itemForm).value = item.quality !== null && item.quality !== undefined ? item.quality : '';
  dom.qs('textarea[name="notes"]', elements.itemForm).value = item.notes || '';
  
  // Sync quality slider
  const qualitySlider = dom.qs('#item-quality-slider', elements.itemForm);
  qualitySlider.value = item.quality !== null && item.quality !== undefined ? item.quality : 5;
}

/**
 * Update form field visibility based on selected modes
 */
function updateFormVisibility() {
  const priceMode = dom.qs('input[name="priceMode"]:checked', elements.itemForm).value;
  const proteinBasis = dom.qs('input[name="proteinBasis"]:checked', elements.itemForm).value;
  
  // Price mode fields
  const unitPriceFields = dom.qs('.unit-price-fields', elements.itemForm);
  const totalPriceFields = dom.qs('.total-price-fields', elements.itemForm);
  
  unitPriceFields.classList.toggle('hidden', priceMode !== 'unitPrice');
  totalPriceFields.classList.toggle('hidden', priceMode !== 'totalPrice');
  
  // Protein basis fields
  const per100gFields = dom.qs('.per100g-fields', elements.itemForm);
  const perServingFields = dom.qs('.perServing-fields', elements.itemForm);
  
  per100gFields.classList.toggle('hidden', proteinBasis !== 'per100g');
  perServingFields.classList.toggle('hidden', proteinBasis !== 'perServing');
}

/**
 * Update the live preview in the item form
 */
function updateLivePreview() {
  const formData = getFormData();
  const derived = calc.derive(formData, state.settings.targetGrams);
  
  const previewEl = dom.qs('.preview-box', elements.itemForm);
  const costPerGramEl = dom.qs('.preview-cost-per-gram', previewEl);
  const costPerTargetEl = dom.qs('.preview-cost-per-target', previewEl);
  const invalidEl = dom.qs('.preview-invalid', previewEl);

  // Update the preview label to reflect current target grams
  const targetLabelEl = costPerTargetEl ? costPerTargetEl.previousElementSibling : null;
  if (targetLabelEl) {
    targetLabelEl.textContent = `Cost per ${state.settings.targetGrams}g of protein: `;
  }
  
  if (derived.valid) {
    costPerGramEl.textContent = format.formatPerGram(derived.costPerGram, state.settings.currencySymbol);
    costPerTargetEl.textContent = format.formatPerTarget(derived.costPerTarget, state.settings.currencySymbol);
    invalidEl.textContent = '';
    invalidEl.classList.add('hidden');
  } else {
    costPerGramEl.textContent = '—';
    costPerTargetEl.textContent = '—';
    invalidEl.textContent = derived.reason;
    invalidEl.classList.remove('hidden');
  }
}

/**
 * Get form data as an item object
 * @returns {Object} - Item object from form data
 */
function getFormData() {
  const form = elements.itemForm;
  
  // Get values from form
  const priceMode = dom.qs('input[name="priceMode"]:checked', form).value;
  const proteinBasis = dom.qs('input[name="proteinBasis"]:checked', form).value;
  
  const item = {
    id: state.ui.editingItem ? state.ui.editingItem.id : storage.generateId(),
    name: dom.qs('input[name="name"]', form).value.trim(),
    brand: dom.qs('input[name="brand"]', form).value.trim(),
    store: dom.qs('input[name="store"]', form).value.trim(),
    favorite: dom.qs('input[name="favorite"]', form).checked,
    quality: dom.parseIntSafe(dom.qs('input[name="quality"]', form).value),
    notes: dom.qs('textarea[name="notes"]', form).value.trim(),
    
    priceMode,
    proteinBasis
  };
  
  // Add price mode specific fields
  if (priceMode === 'unitPrice') {
    item.unitPrice = dom.parseFloatSafe(dom.qs('input[name="unitPrice"]', form).value);
    item.unitPriceUnit = dom.qs('select[name="unitPriceUnit"]', form).value;
  } else if (priceMode === 'totalPrice') {
    item.priceTotal = dom.parseFloatSafe(dom.qs('input[name="priceTotal"]', form).value);
    item.packageAmount = dom.parseFloatSafe(dom.qs('input[name="packageAmount"]', form).value);
    item.packageUnit = dom.qs('select[name="packageUnit"]', form).value;
  }
  
  // Add protein basis specific fields
  if (proteinBasis === 'per100g') {
    item.proteinPer100g = dom.parseFloatSafe(dom.qs('input[name="proteinPer100g"]', form).value);
  } else if (proteinBasis === 'perServing') {
    item.servingSizeAmount = dom.parseFloatSafe(dom.qs('input[name="servingSizeAmount"]', form).value);
    item.servingSizeUnit = dom.qs('select[name="servingSizeUnit"]', form).value;
    item.proteinPerServing = dom.parseFloatSafe(dom.qs('input[name="proteinPerServing"]', form).value);
  }
  
  return item;
}

/**
 * Save the item from the form
 */
function saveItemFromForm() {
  const item = getFormData();
  
  // Validate the item
  const validation = calc.validateItem(item);
  if (!validation.valid) {
    alert(validation.reason);
    return;
  }
  
  // Update or add the item
  if (state.ui.editingItem) {
    // Find and update the existing item
    const index = state.items.findIndex(i => i.id === item.id);
    if (index !== -1) {
      state.items[index] = item;
    }
  } else {
    // Add as a new item
    state.items.push(item);
  }
  
  // Save to storage
  storage.save(state);
  
  // Close the dialog
  elements.itemDialog.close();
  
  // Render the updated table
  render();
}

/**
 * Open the settings dialog
 */
function openSettingsDialog() {
  // Reset form
  elements.settingsForm.reset();
  
  // Fill form with current settings
  dom.qs('input[name="currencySymbol"]', elements.settingsForm).value = state.settings.currencySymbol;
  dom.qs('input[name="targetGrams"]', elements.settingsForm).value = state.settings.targetGrams;
  
  // Show the dialog
  elements.settingsDialog.showModal();
  focusTraps.settingsDialog.activate();
}

/**
 * Save settings from the form
 */
function saveSettingsFromForm() {
  const form = elements.settingsForm;
  
  // Get values from form
  const currencySymbol = dom.qs('input[name="currencySymbol"]', form).value.trim() || '$';
  const targetGrams = dom.parseIntSafe(dom.qs('input[name="targetGrams"]', form).value) || 30;
  
  // Update settings
  state.settings.currencySymbol = currencySymbol;
  state.settings.targetGrams = targetGrams;
  
  // Save to storage
  storage.save(state);
  
  // Close the dialog
  elements.settingsDialog.close();
  
  // Render the updated table
  render();
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);

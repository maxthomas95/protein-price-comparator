/**
 * Protein Price Comparator - DOM Utilities
 * Helper functions for DOM manipulation and event handling
 */

/**
 * Shorthand for document.querySelector
 * @param {string} selector - CSS selector
 * @param {Element} [context=document] - Context element
 * @returns {Element|null} - The first matching element or null
 */
export function qs(selector, context = document) {
  return context.querySelector(selector);
}

/**
 * Shorthand for document.querySelectorAll
 * @param {string} selector - CSS selector
 * @param {Element} [context=document] - Context element
 * @returns {NodeList} - List of matching elements
 */
export function qsa(selector, context = document) {
  return context.querySelectorAll(selector);
}

/**
 * Create an element with attributes and children
 * @param {string} tag - Tag name
 * @param {Object} [props={}] - Element properties
 * @param {Array|Element|string} [children] - Child elements or text
 * @returns {Element} - The created element
 */
export function createEl(tag, props = {}, children) {
  const element = document.createElement(tag);
  
  // Set properties
  Object.entries(props).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else if (key === 'style' && typeof value === 'object') {
      Object.entries(value).forEach(([styleKey, styleValue]) => {
        element.style[styleKey] = styleValue;
      });
    } else if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.slice(2).toLowerCase();
      element.addEventListener(eventName, value);
    } else {
      element[key] = value;
    }
  });
  
  // Add children
  if (children) {
    if (Array.isArray(children)) {
      children.forEach(child => {
        appendChild(element, child);
      });
    } else {
      appendChild(element, children);
    }
  }
  
  return element;
}

/**
 * Helper to append a child to an element
 * @param {Element} parent - Parent element
 * @param {Element|string} child - Child element or text
 */
function appendChild(parent, child) {
  if (child === null || child === undefined) return;
  
  if (typeof child === 'string' || typeof child === 'number') {
    parent.appendChild(document.createTextNode(child));
  } else {
    parent.appendChild(child);
  }
}

/**
 * Set up event delegation
 * @param {Element} parent - Parent element to attach the event to
 * @param {string} eventType - Event type (e.g., 'click')
 * @param {string} selector - CSS selector for target elements
 * @param {Function} handler - Event handler function
 * @returns {Function} - Function to remove the event listener
 */
export function on(parent, eventType, selector, handler) {
  const listener = (event) => {
    // Find the closest matching element
    const target = event.target.closest(selector);
    
    if (target && parent.contains(target)) {
      handler(event, target);
    }
  };
  
  parent.addEventListener(eventType, listener);
  
  // Return a function to remove the event listener
  return () => {
    parent.removeEventListener(eventType, listener);
  };
}

/**
 * Safely parse a float value
 * @param {string|number} value - Value to parse
 * @returns {number|null} - Parsed number or null if invalid
 */
export function parseFloatSafe(value) {
  if (value === null || value === undefined || value === '') return null;
  
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Safely parse an integer value
 * @param {string|number} value - Value to parse
 * @returns {number|null} - Parsed number or null if invalid
 */
export function parseIntSafe(value) {
  if (value === null || value === undefined || value === '') return null;
  
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Set multiple attributes on an element
 * @param {Element} element - Target element
 * @param {Object} attrs - Attributes to set
 */
export function setAttrs(element, attrs) {
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      element.removeAttribute(key);
    } else {
      element.setAttribute(key, value);
    }
  });
}

/**
 * Set text content with optional fallback
 * @param {Element} element - Target element
 * @param {string} text - Text to set
 * @param {string} [fallback=''] - Fallback text if empty
 */
export function setText(element, text, fallback = '') {
  element.textContent = text || fallback;
}

/**
 * Create a focus trap for modal dialogs
 * @param {HTMLDialogElement} dialog - The dialog element
 * @returns {Object} - Methods to activate and deactivate the trap
 */
export function createFocusTrap(dialog) {
  let previouslyFocused = null;
  
  // Get all focusable elements
  const getFocusableElements = () => {
    return Array.from(
      dialog.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !el.hasAttribute('disabled'));
  };
  
  // Handle tab key to trap focus
  const handleTabKey = (event) => {
    if (event.key !== 'Tab') return;
    
    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };
  
  // Activate the focus trap
  const activate = () => {
    previouslyFocused = document.activeElement;
    
    dialog.addEventListener('keydown', handleTabKey);
    
    // Focus the first focusable element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      setTimeout(() => {
        focusableElements[0].focus();
      }, 0);
    }
  };
  
  // Deactivate the focus trap
  const deactivate = () => {
    dialog.removeEventListener('keydown', handleTabKey);
    
    if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
      setTimeout(() => {
        previouslyFocused.focus();
      }, 0);
    }
  };
  
  return { activate, deactivate };
}

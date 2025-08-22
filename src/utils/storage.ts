import type { Item, Settings } from "../types";

// LocalStorage keys
const ITEMS_KEY = "ppc_items_v1";
const SETTINGS_KEY = "ppc_settings_v1";
const SEEDED_KEY = "ppc_seed_v1";

// Default settings
export const DEFAULT_SETTINGS: Settings = {
  currencySymbol: "$",
  comparisonTarget: 30,
};

/**
 * Loads items from LocalStorage
 * @returns Array of items or empty array if none found
 */
export const loadItems = (): Item[] => {
  try {
    const itemsJson = localStorage.getItem(ITEMS_KEY);
    if (!itemsJson) {
      return [];
    }
    return JSON.parse(itemsJson);
  } catch (error) {
    console.error("Error loading items from localStorage:", error);
    return [];
  }
};

/**
 * Saves items to LocalStorage
 * @param items Array of items to save
 */
export const saveItems = (items: Item[]): void => {
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Error saving items to localStorage:", error);
  }
};

/**
 * Loads settings from LocalStorage
 * @returns Settings object or default settings if none found
 */
export const loadSettings = (): Settings => {
  try {
    const settingsJson = localStorage.getItem(SETTINGS_KEY);
    if (!settingsJson) {
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(settingsJson) };
  } catch (error) {
    console.error("Error loading settings from localStorage:", error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * Saves settings to LocalStorage
 * @param settings Settings object to save
 */
export const saveSettings = (settings: Settings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving settings to localStorage:", error);
  }
};

/**
 * Checks if demo items have been seeded
 * @returns True if demo items have been seeded
 */
export const loadSeeded = (): boolean => {
  try {
    return localStorage.getItem(SEEDED_KEY) === "true";
  } catch (error) {
    console.error("Error checking if demo items have been seeded:", error);
    return false;
  }
};

/**
 * Sets the seeded flag in LocalStorage
 * @param value True if demo items have been seeded
 */
export const setSeeded = (value: boolean): void => {
  try {
    localStorage.setItem(SEEDED_KEY, value ? "true" : "false");
  } catch (error) {
    console.error("Error setting seeded flag in localStorage:", error);
  }
};

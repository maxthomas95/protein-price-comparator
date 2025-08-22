import { useState, useEffect, useCallback } from "react";
import type { Settings } from "../types";
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from "../utils/storage";

/**
 * Hook for managing application settings with LocalStorage persistence
 * @returns Settings state and update functions
 */
export const useSettings = () => {
  // Initialize settings from localStorage or defaults
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  // Load settings from localStorage on mount
  useEffect(() => {
    const storedSettings = loadSettings();
    setSettings(storedSettings);
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  /**
   * Toggle between 25g and 30g comparison target
   */
  const toggleTarget = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      comparisonTarget: prev.comparisonTarget === 25 ? 30 : 25,
    }));
  }, []);

  /**
   * Update settings with partial changes
   * @param updates Partial settings object with changes
   */
  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettings(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  return {
    settings,
    toggleTarget,
    updateSettings,
  };
};

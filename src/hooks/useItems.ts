import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import type { Item } from "../types";
import { loadItems, saveItems } from "../utils/storage";
import { seedIfFirstLoad, resetDemoItems } from "../utils/seed";

/**
 * Hook for managing items with LocalStorage persistence
 * @returns Items state and CRUD operations
 */
export const useItems = () => {
  // Initialize items from localStorage or seed data
  const [items, setItems] = useState<Item[]>([]);

  // Load items from localStorage on mount, seed if first load
  useEffect(() => {
    const initialItems = seedIfFirstLoad();
    setItems(initialItems);
  }, []);

  // Save items to localStorage whenever they change
  useEffect(() => {
    saveItems(items);
  }, [items]);

  /**
   * Add a new item
   * @param item Item to add (without ID)
   * @returns The added item with generated ID
   */
  const addItem = useCallback((item: Omit<Item, "id">): Item => {
    const newItem = { ...item, id: uuidv4() } as Item;
    setItems(prev => [...prev, newItem]);
    return newItem;
  }, []);

  /**
   * Update an existing item
   * @param id ID of the item to update
   * @param updates Partial item with changes
   * @returns The updated item or undefined if not found
   */
  const updateItem = useCallback((id: string, updates: Partial<Omit<Item, "id">>): Item | undefined => {
    let updatedItem: Item | undefined;
    
    setItems(prev => {
      const newItems = prev.map(item => {
        if (item.id === id) {
          updatedItem = { ...item, ...updates };
          return updatedItem;
        }
        return item;
      });
      
      return newItems;
    });
    
    return updatedItem;
  }, []);

  /**
   * Delete an item
   * @param id ID of the item to delete
   * @returns True if the item was deleted
   */
  const deleteItem = useCallback((id: string): boolean => {
    let deleted = false;
    
    setItems(prev => {
      const newItems = prev.filter(item => {
        if (item.id === id) {
          deleted = true;
          return false;
        }
        return true;
      });
      
      return newItems;
    });
    
    return deleted;
  }, []);

  /**
   * Duplicate an item
   * @param id ID of the item to duplicate
   * @returns The duplicated item or undefined if not found
   */
  const duplicateItem = useCallback((id: string): Item | undefined => {
    const itemToDuplicate = items.find(item => item.id === id);
    
    if (!itemToDuplicate) {
      return undefined;
    }
    
    const { id: _, ...itemWithoutId } = itemToDuplicate;
    const duplicatedItem = { ...itemWithoutId, id: uuidv4(), name: `${itemToDuplicate.name} (Copy)` } as Item;
    
    setItems(prev => [...prev, duplicatedItem]);
    
    return duplicatedItem;
  }, [items]);

  /**
   * Toggle the favorite status of an item
   * @param id ID of the item to toggle
   * @returns The updated item or undefined if not found
   */
  const toggleFavorite = useCallback((id: string): Item | undefined => {
    return updateItem(id, { favorite: !items.find(item => item.id === id)?.favorite });
  }, [items, updateItem]);

  /**
   * Reset to demo items, clearing any existing items
   * @returns The demo items
   */
  const handleResetDemoItems = useCallback((): Item[] => {
    const demoItems = resetDemoItems();
    setItems(demoItems);
    return demoItems;
  }, []);

  return {
    items,
    addItem,
    updateItem,
    deleteItem,
    duplicateItem,
    toggleFavorite,
    resetDemoItems: handleResetDemoItems,
  };
};

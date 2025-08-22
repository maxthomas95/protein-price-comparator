import type { Item, Filters } from "../types";

/**
 * Filters items based on search query and favorites filter
 * @param items Array of items to filter
 * @param filters Filters to apply
 * @returns Filtered array of items
 */
export const filterItems = (items: Item[], filters: Filters): Item[] => {
  return items.filter(item => {
    // Apply favorites filter
    if (filters.favoritesOnly && !item.favorite) {
      return false;
    }
    
    // Apply search query filter
    if (filters.query && filters.query.trim() !== "") {
      const query = filters.query.toLowerCase().trim();
      
      // Search in name, brand, and store
      const nameMatch = item.name.toLowerCase().includes(query);
      const brandMatch = item.brand ? item.brand.toLowerCase().includes(query) : false;
      const storeMatch = item.store ? item.store.toLowerCase().includes(query) : false;
      
      // Return true if any field matches
      return nameMatch || brandMatch || storeMatch;
    }
    
    // If no query or favorites filter, include the item
    return true;
  });
};

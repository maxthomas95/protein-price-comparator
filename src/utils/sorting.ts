import type { Item, Settings, SortKey, SortDir } from "../types";
import { calc } from "./calc";

/**
 * Gets a comparator function for sorting items
 * @param sortKey The key to sort by
 * @param dir The sort direction
 * @param settings Application settings
 * @returns A comparator function for use with Array.sort()
 */
export const getComparator = (
  sortKey: SortKey,
  dir: SortDir,
  settings: Settings
): ((a: Item, b: Item) => number) => {
  // Create a multiplier for sort direction
  const multiplier = dir === "asc" ? 1 : -1;

  return (a: Item, b: Item): number => {
    // Handle special case for $/target
    if (sortKey === "$/target") {
      const calcA = calc(a, settings);
      const calcB = calc(b, settings);
      
      // Handle undefined values (treat as Infinity for ascending sort)
      const valueA = calcA.costPerTarget ?? Infinity;
      const valueB = calcB.costPerTarget ?? Infinity;
      
      return (valueA - valueB) * multiplier;
    }
    
    // Handle special case for $/g
    if (sortKey === "$/g") {
      const calcA = calc(a, settings);
      const calcB = calc(b, settings);
      
      // Handle undefined values (treat as Infinity for ascending sort)
      const valueA = calcA.costPerGram ?? Infinity;
      const valueB = calcB.costPerGram ?? Infinity;
      
      return (valueA - valueB) * multiplier;
    }
    
    // Handle special case for price
    if (sortKey === "price") {
      let valueA: number | undefined;
      let valueB: number | undefined;
      
      if (a.priceMode === "totalPrice") {
        valueA = a.priceTotal;
      } else {
        valueA = a.unitPrice;
      }
      
      if (b.priceMode === "totalPrice") {
        valueB = b.priceTotal;
      } else {
        valueB = b.unitPrice;
      }
      
      // Handle undefined values (treat as Infinity for ascending sort)
      valueA = valueA ?? Infinity;
      valueB = valueB ?? Infinity;
      
      return (valueA - valueB) * multiplier;
    }
    
    // Handle string fields (name, brand, store)
    if (sortKey === "name" || sortKey === "brand" || sortKey === "store") {
      const valueA = (a[sortKey] || "").toLowerCase();
      const valueB = (b[sortKey] || "").toLowerCase();
      
      if (valueA < valueB) return -1 * multiplier;
      if (valueA > valueB) return 1 * multiplier;
      return 0;
    }
    
    // Default case (should not happen)
    return 0;
  };
};

/**
 * Gets the label for a sort key, using the current comparison target
 * @param sortKey The sort key
 * @param settings Application settings
 * @returns A user-friendly label for the sort key
 */
export const getSortKeyLabel = (sortKey: SortKey, settings: Settings): string => {
  if (sortKey === "$/target") {
    return `$/${settings.comparisonTarget}g`;
  }
  
  const labels: Record<SortKey, string> = {
    "$/target": `$/${settings.comparisonTarget}g`,
    "$/g": "$/g",
    "price": "Price",
    "name": "Name",
    "brand": "Brand",
    "store": "Store",
  };
  
  return labels[sortKey] || sortKey;
};

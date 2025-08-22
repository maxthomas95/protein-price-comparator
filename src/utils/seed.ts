import type { Item } from "../types";
import { loadItems, saveItems, loadSeeded, setSeeded } from "./storage";
import { v4 as uuidv4 } from "uuid";

/**
 * Demo seed items as specified in the requirements
 */
export const DEMO_ITEMS: Item[] = [
  {
    id: uuidv4(),
    name: "Chicken breast",
    brand: "Kirkland",
    store: "Costco",
    priceMode: "unitPrice",
    unitPrice: 2.49,
    unitPriceUnit: "lb",
    proteinBasis: "per100g",
    proteinPer100g: 31,
    favorite: false,
  },
  {
    id: uuidv4(),
    name: "Whey isolate",
    brand: "ON",
    store: "Amazon",
    priceMode: "totalPrice",
    priceTotal: 39.99,
    packageAmount: 5,
    packageUnit: "lb",
    proteinBasis: "perServing",
    servingSizeAmount: 32,
    servingSizeUnit: "g",
    proteinPerServing: 25,
    favorite: false,
  },
  {
    id: uuidv4(),
    name: "Greek yogurt (2%)",
    brand: "Fage",
    store: "Kroger",
    priceMode: "totalPrice",
    priceTotal: 5.49,
    packageAmount: 32,
    packageUnit: "oz",
    proteinBasis: "per100g",
    proteinPer100g: 10,
    favorite: false,
  },
];

/**
 * Seeds demo items if this is the first load
 * @returns The seeded items or existing items
 */
export const seedIfFirstLoad = (): Item[] => {
  // Check if we've already seeded
  if (loadSeeded()) {
    return loadItems();
  }

  // Seed demo items
  saveItems(DEMO_ITEMS);
  setSeeded(true);
  return DEMO_ITEMS;
};

/**
 * Resets to demo items, clearing any existing items
 * @returns The demo items
 */
export const resetDemoItems = (): Item[] => {
  // Generate new IDs for demo items to ensure they're fresh
  const freshDemoItems = DEMO_ITEMS.map(item => ({
    ...item,
    id: uuidv4(),
  }));
  
  saveItems(freshDemoItems);
  setSeeded(true);
  return freshDemoItems;
};

# Protein Price Comparator

A single-page, mobile-friendly web app to compare foods/powders by cost per gram of protein and $/30g. Built with vanilla HTML, CSS, and JavaScript with LocalStorage for persistence.

## Features

- Compare food items by protein cost ($/g and $/30g)
- Two pricing modes: unit price or total package price
- Two protein basis modes: per 100g or per serving
- Sort by various metrics (cost, name, brand, store)
- Filter by search or favorites
- Persistent storage using LocalStorage
- Mobile-friendly responsive design
- Dark theme matching the reference site

## Setup and Run

No build step required! Simply serve the files with any static server:

```bash
# Using Python
python -m http.server

# Or using VS Code Live Server extension
# Right-click on index.html and select "Open with Live Server"
```

## File Structure

- `index.html` - Main HTML file with the application structure
- `/css/styles.css` - Stylesheet with design tokens and styles
- `/js/app.js` - Main application logic (state, render, event handlers)
- `/js/calc.js` - Pure calculation utilities for conversions and derived values
- `/js/format.js` - Formatting utilities for money and units
- `/js/storage.js` - LocalStorage operations (load, save, seed)
- `/js/dom.js` - DOM helper functions
- `/assets/icons.svg` - SVG icons for the application

## Calculation Formulas

### Unit Conversions
- 1 lb = 453.592 g
- 1 oz = 28.3495 g
- 1 kg = 1000 g

### Unit Price Mode
- Unit price per gram of product = unitPrice / gramsIn(1, unitPriceUnit)
- Protein density:
  - per100g → gramsProteinPerGramProduct = proteinPer100g / 100
  - perServing → gramsProteinPerGramProduct = proteinPerServing / servingGrams
- Cost per gram of protein = unitPricePerGramProduct / gramsProteinPerGramProduct
- Cost per 30g of protein = costPerGram * 30

### Total Price Mode
- Total grams = gramsIn(packageAmount, packageUnit)
- Protein total:
  - per100g → gramsProteinTotal = gramsTotal * (proteinPer100g / 100)
  - perServing → servings = gramsTotal / servingGrams; gramsProteinTotal = servings * proteinPerServing
- Cost per gram of protein = priceTotal / gramsProteinTotal
- Cost per 30g of protein = costPerGram * 30

## Data Model

```javascript
// UnitMass: 'g' | 'kg' | 'oz' | 'lb'
const Item = {
  id: 'uuid',
  name: 'Chicken breast',
  brand: 'Kirkland',       // optional
  store: 'Costco',         // optional
  favorite: false,
    
  // Pricing mode
  priceMode: 'unitPrice' | 'totalPrice',
    
  // Mode A (total price + package)
  priceTotal: 39.99,
  packageAmount: 5,
  packageUnit: 'lb',
    
  // Mode B (unit price)
  unitPrice: 2.49,
  unitPriceUnit: 'lb',
    
  // Protein basis
  proteinBasis: 'per100g' | 'perServing',
  proteinPer100g: 31,      // if per100g
  servingSizeAmount: 32,   // if perServing
  servingSizeUnit: 'g',    // UnitMass
  proteinPerServing: 25    // if perServing
};
```

## Example Calculations

1. Chicken breast (Unit price mode)
   - $2.49/lb & 31 g/100 g
   - $/g ≈ 0.0177
   - $/30g ≈ 0.5312

2. Whey isolate (Total price mode)
   - $39.99 for 5 lb & 25 g / 32 g serving
   - $/g ≈ 0.0226
   - $/30g ≈ 0.6771

## Accessibility Features

- Semantic HTML structure
- ARIA attributes for sorting
- Keyboard navigation support
- Focus management in dialogs
- Adequate color contrast
- Responsive design for all screen sizes

# 🥩 Protein Price Comparator

A simple, mobile-friendly web app for comparing foods and powders by **cost per gram of protein** and **$/25g or $/30g** of protein.  
Use it to see whether Costco chicken, Greek yogurt, or your favorite protein powder gives you the best bang for your buck.

---

## ✨ Features (MVP)

- **Add any item** with:
  - **Total price** + package size (e.g. `$9.99 for 2 lb`)
  - **or** **Unit price** (e.g. `$2.49 / lb`)
- **Protein basis**:
  - Per 100 g (e.g. `31 g protein / 100 g`)
  - Per serving (e.g. `25 g protein in a 32 g scoop`)
- **Automatic calculations**:
  - Cost per gram of protein
  - Cost per 25 g protein
  - Cost per 30 g protein (default view)
- **Comparison table**:
  - Sortable by price per gram, per 25g, per 30g, total price, name, brand, or store
  - Quick search filter
  - ⭐ Favorites
- **Settings**:
  - Toggle default target (25g vs 30g)
  - Change currency symbol (default: `$`)
- **Persistence**: Items are saved in your browser (LocalStorage)
- **Demo data** loads on first run (chicken breast, whey isolate, Greek yogurt)

---

## 🧮 How the math works

**Conversions**
- 1 lb = 453.592 g  
- 1 oz = 28.3495 g  
- 1 kg = 1000 g  

**Per‑100g path**
    
    gramsTotal = convert(packageAmount, packageUnit)
    gramsProteinTotal = gramsTotal × (proteinPer100g / 100)
    costPerGram = priceTotal / gramsProteinTotal
    costPer25   = costPerGram × 25
    costPer30   = costPerGram × 30

**Per‑serving path**
    
    servingGrams = convert(servingSizeAmount, servingSizeUnit)
    servingsPerPackage = gramsTotal / servingGrams
    gramsProteinTotal = servingsPerPackage × proteinPerServing
    costPerGram = priceTotal / gramsProteinTotal

**Unit‑price path (when no package size known)**
    
    unitPricePerGramProduct = unitPrice / gramsInUnit
    gramsProteinPerGramProduct = (proteinPer100g / 100)  OR  (proteinPerServing / servingGrams)
    costPerGram = unitPricePerGramProduct / gramsProteinPerGramProduct
    costPer25 = costPerGram × 25
    costPer30 = costPerGram × 30

---

## 🚀 Getting Started

**Prerequisites**
- Node.js (v18+ recommended)
- npm or yarn

**Install**
    
    git clone https://github.com/yourname/protein-price-comparator.git
    cd protein-price-comparator
    npm install

**Run (development)**
    
    npm run dev
    # Open http://localhost:5173

**Build (production)**
    
    npm run build
    npm run preview

---

## 📂 Project Structure

    src/
      components/   # UI pieces (Header, Controls, ItemTable, ItemForm, SettingsModal, PreviewCard)
      hooks/        # State management (useItems, useSettings)
      utils/        # Pure functions (units, calc, storage, format, seed)
      types.ts      # Data models
      App.tsx       # Root component
      main.tsx      # Entry point

---

## ✅ Acceptance Tests

- **Chicken breast**: `$2.49/lb` + `31 g / 100 g` → ≈ `$0.0177 / g` → ≈ `$0.53 / 30g`
- **Whey isolate**: `$39.99 for 5 lb` + `25 g / 32 g serving` → ≈ `$0.0226 / g` → ≈ `$0.68 / 30g`
- **Sorting**: Chicken shows before whey when sorted by cheapest $/30g
- **Validation**: Empty or zero inputs are blocked

---

## 🛠️ Roadmap (post‑MVP)

- Import/export JSON of items  
- Barcode scanning (webcam or mobile)  
- USDA FoodData Central API integration  
- Cooked yield adjustments for meats  
- Calories & protein quality (PDCAAS/DIAAS)  
- Price tracking over time  

---

## 📜 License
MIT — feel free to fork, modify, and share.

---

### 🥗 Example Use
Add chicken breast from Costco and whey isolate from Amazon. The app will instantly tell you which one is cheaper per 30 g of protein. Spoiler: chicken usually wins 🐓💪.

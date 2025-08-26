# 🥩 Protein Price Comparator

A simple, mobile-friendly web app for comparing foods and powders by **cost per gram of protein** and **$/30g** of protein.  
Use it to see whether Costco chicken, Greek yogurt, or your favorite protein powder gives you the best bang for your buck.

---

## ✨ Features (MVP)

- **Add any item** with:
  - Unit price (e.g. $2.49 / lb)
  - Total price + package (e.g. $39.99 for 5 lb)
- **Protein basis**:
  - Per 100 g (e.g. `31 g protein / 100 g`)
  - Per serving (e.g. `25 g protein in a 32 g scoop`)
- **Automatic calculations**:
  - Cost per gram of protein
  - Cost per 30 g protein (default view)
- **Comparison table**:
  - Sortable by price per gram, per 30g, total price, name, brand, or store
  - Quick search filter
  - ⭐ Favorites
- **Settings**:
  - Change currency symbol (default: `$`)
- **Persistence**: Items are saved in your browser (LocalStorage)
- **Demo data** loads on first run (chicken breast, whey isolate, Greek yogurt)

---

## 📦 Project Structure
    index.html
    css/
      styles.css
    js/
      app.js       # app logic, event wiring, rendering
      calc.js      # pure cost/yield calculations
      storage.js   # LocalStorage + first-run seed
      dom.js       # small DOM helpers
      format.js    # money/unit formatting
    assets/
      icons.svg
    reference/
      max-thomas.com/   # (read-only) design reference, DO NOT MODIFY

> The reference/max-thomas.com/ folder is design reference only.  
> The app reads its tokens (font/colors) but never edits those files.

---

## 🧮 How the math works

**Conversions**
- 1 lb = 453.592 g  
- 1 oz = 28.3495 g  
- 1 kg = 1000 g  

**Unit-price mode**
    unitPricePerGramProduct = unitPrice / gramsIn(1 unitPriceUnit)
    gramsProteinPerGramProduct =
      - per100g: proteinPer100g / 100
      - perServing: proteinPerServing / servingGrams
    costPerGram = unitPricePerGramProduct / gramsProteinPerGramProduct
    costPer30   = costPerGram * 30

**Total-price mode**
    gramsTotal = gramsIn(packageAmount, packageUnit)
    gramsProteinTotal =
      - per100g: gramsTotal * (proteinPer100g / 100)
      - perServing: (gramsTotal / servingGrams) * proteinPerServing
    costPerGram = priceTotal / gramsProteinTotal
    costPer30   = costPerGram * 30

---

## 🚀 Getting Started

Use any static server (no build step required).

**Option A: VS Code Live Server**
1. Install the “Live Server” extension.
2. Right-click index.html → “Open with Live Server”.

**Option B: Python**
    python -m http.server 5173
Then open http://localhost:5173 in your browser.

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

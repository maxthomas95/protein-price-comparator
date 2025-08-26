# Project: Protein Price Comparator (Static Site — HTML/CSS/JS)

## Objective
Build a single-page, mobile-friendly web app to compare foods/powders by cost per gram of protein and $/30g. No frameworks, no bundlers — pure HTML + CSS + JS with LocalStorage.

## Constraints & Design Reference
- Do NOT use React/Vue/Svelte/TypeScript. Only vanilla HTML, CSS, and JavaScript.
- Do NOT touch or modify my existing site files. They are reference-only to match style (fonts, colors, spacing).
- The repo will include a folder like ./reference/max-thomas.com/ with my old website. Treat it as read-only and mirror its look by extracting tokens, but keep all new code separate.
- Must run from any static server (VS Code Live Server or `python -m http.server`). No build step.

## Tech
- HTML5 + CSS3 (single stylesheet). Use CSS custom properties for theme tokens.
- Vanilla JS modules via `<script type="module">`.
- LocalStorage for persistence.
- Native <dialog> elements for modals.

## File Tree (authoritative)
    / (repo root)
      index.html
      /css
        styles.css
      /js
        app.js          # bootstrap, events, render cycle
        calc.js         # pure calculation utilities
        storage.js      # LocalStorage load/save, first-run seed
        dom.js          # DOM helpers (qs/qsa/createEl, delegation)
        format.js       # money/unit formatting
      /assets
        icons.svg       # star/edit/delete icons (inline sprite or external)
      /reference
        max-thomas.com/ # EXISTING site files (READ-ONLY, DO NOT MODIFY)

## Data Model (JS doc)
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

## Conversions (fixed)
- 1 lb = 453.592 g
- 1 oz = 28.3495 g
- 1 kg = 1000 g

## Calculations (in js/calc.js)
Unit-price mode:
- unitPricePerGramProduct = unitPrice / gramsIn(1, unitPriceUnit)
- Protein density:
  - per100g → gramsProteinPerGramProduct = proteinPer100g / 100
  - perServing → gramsProteinPerGramProduct = proteinPerServing / servingGrams
- costPerGram = unitPricePerGramProduct / gramsProteinPerGramProduct
- costPer30 = costPerGram * 30

Total-price mode:
- gramsTotal = gramsIn(packageAmount, packageUnit)
- Protein total:
  - per100g → gramsProteinTotal = gramsTotal * (proteinPer100g / 100)
  - perServing → servings = gramsTotal / servingGrams; gramsProteinTotal = servings * proteinPerServing
- costPerGram = priceTotal / gramsProteinTotal
- costPer30 as above

Guardrails:
- Missing/zero critical fields → invalid; show "—" and an explanatory title/tooltip.
- Warn if gramsProteinTotal < 1 when package is provided.

## UI/UX (single page)
Header bar:
- Title (“Protein Price Comparator”)
- [Add Item] button (opens dialog form)
- [Settings] (dialog for currency symbol + default target)

Controls row:
- Search input (filters name/brand/store)
- Favorites-only checkbox
- Sort dropdown + asc/desc toggle
  Sort keys: $ / 30g (default), $ / g, Price, Name, Brand, Store

Main table (responsive, sticky header):
- Columns: ★ | Name (brand/store small) | Price summary | Protein summary | $ / g | $ / (30)g | Actions (Edit | Duplicate | Delete)

Add/Edit Item dialog:
- Pricing mode radio:
  - Unit price → unitPrice, unitPriceUnit
  - Total price → priceTotal, packageAmount, packageUnit
- Protein basis radio:
  - Per 100g → proteinPer100g
  - Per serving → servingSizeAmount, servingSizeUnit, proteinPerServing
- Name/Brand/Store, Favorite
- Live preview of derived $/g, $/30g as user types
- Save/Cancel

Empty state:
- Big icon + “Add Item” CTA

Accessibility:
- Semantic HTML, label/for for inputs, keyboard traps inside dialogs, aria-sort on table headers, focus outlines, adequate contrast.

## Styling
- Extract font family + color tokens from /reference/max-thomas.com/ (read only).
- Define CSS variables in :root (e.g., --bg, --text, --muted, --card, --accent, --border).
- Use a dark theme that visually matches the reference site (without changing it).
- Buttons, inputs, table rows: 8px radii, subtle borders, hover/focus states.

## Persistence
- LocalStorage key: ppc:v1
- Save items array and settings (currency symbol, default target 30).
- Seed demo data on first run only:
  1) Chicken breast — Brand: Kirkland — Store: Costco — Mode B: $2.49/lb — Protein: 31 g / 100 g
  2) Whey isolate — Brand: ON — Store: Amazon — Mode A: $39.99 for 5 lb — Protein: 25 g / 32 g serving
  3) Greek yogurt (2%) — Brand: Fage — Store: Kroger — Mode A: $5.49 for 32 oz — Protein: 10 g / 100 g

## Sorting & Filtering
- Filter by case-insensitive substring in name/brand/store.
- Sort by derived values where available; invalid items (no derived value) go to the bottom.

## Acceptance Tests (manual)
- Unit-price path (no package): $2.49/lb & 31 g/100 g → $/g ≈ 0.017708; $/30g ≈ 0.5312
- Total-price path: $39.99 for 5 lb & 25 g / 32 g → $/g ≈ 0.02257; $/30g ≈ 0.6771
- Sorting by $ / 30g asc lists chicken before whey with the above data.
- Validation blocks zero/blank critical fields; live preview shows invalid reason.

## Deliverables
- index.html, css/styles.css, js/*.js, assets/icons.svg
- Works with a static server; no build step required
- A concise README with setup/run and formulas

## Numbered Task List (for Act)
1. Create the file tree exactly as specified.
2. Read ./reference/max-thomas.com/ (read-only) to identify primary font and 3–5 core colors; define as CSS custom properties in css/styles.css. Do NOT modify that folder.
3. Build index.html with semantic layout: header, controls, table, dialogs (<dialog>).
4. Implement js/calc.js with pure functions for conversions/validation/cost computations.
5. Implement js/format.js for money and unit formatting.
6. Implement js/storage.js for LocalStorage (load/save, first-run seeding).
7. Implement js/dom.js helpers (qs/qsa/createEl, event delegation, safe parsing).
8. Implement js/app.js: global state; render pipeline; handlers (add/edit/duplicate/delete/favorite, sort/filter); dialog focus management; live preview calculations.
9. Test acceptance tests manually; correct rounding/edge cases.

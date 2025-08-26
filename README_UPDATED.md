
# 🥩 Protein Price Comparator (Static HTML/CSS/JS)

Compare groceries and powders by **cost per gram of protein** and $/30g**.  
Zero dependencies. Runs from any static web server or in Docker/Portainer with Nginx.

I’ve always wanted an easy way to compare which proteins are cheaper.
Sure, not all proteins are equal (something to explore in the future), but for now I wanted a simple, visual way to line up foods and powders side by side and see the cost per gram of protein — and especially what 30g of protein actually costs across different sources.

---

## ✨ Features (MVP)
- Add items via:
  - Unit price (e.g. $2.49 / lb)
  - Total price + package (e.g. $39.99 for 5 lb)
- Protein basis:
  - Per 100 g (e.g. 31 g / 100 g)
  - Per serving (e.g. 25 g in a 32 g scoop)
- Instant calculations:
  - $/g and $/30g
- Sort, search, and ⭐ favorites
- Settings: currency symbol and default target (30g)
- Data saved in LocalStorage (no backend)
- Demo items on first run

---

## 📦 Project Structure
ppc/
  dockerfile         # builds Nginx container
  nginx.conf         # custom server config
  index.html
  css/
    styles.css
  js/
    app.js, calc.js, storage.js, dom.js, format.js
  assets/
    icons.svg

---

## 🧮 Formulas
Unit conversion:
- 1 lb = 453.592 g
- 1 oz = 28.3495 g
- 1 kg = 1000 g

Unit-price mode:
    unitPricePerGramProduct = unitPrice / gramsIn(1 unitPriceUnit)
    gramsProteinPerGramProduct =
      - per100g: proteinPer100g / 100
      - perServing: proteinPerServing / servingGrams
    costPerGram = unitPricePerGramProduct / gramsProteinPerGramProduct
    costPer30   = costPerGram * 30

Total-price mode:
    gramsTotal = gramsIn(packageAmount, packageUnit)
    gramsProteinTotal =
      - per100g: gramsTotal * (proteinPer100g / 100)
      - perServing: (gramsTotal / servingGrams) * proteinPerServing
    costPerGram = priceTotal / gramsProteinTotal
    costPer30   = costPerGram * 30

---

## 🚀 Run Locally (without Docker)

Use any static server (no build step required).

Option A: VS Code Live Server
1. Install the “Live Server” extension.
2. Right-click index.html → “Open with Live Server”.

Option B: Python
    python -m http.server 5173
Then open http://localhost:5173

---

## 🐳 Run with Docker

### 1. Build & run manually
From project root:
    docker build -t protein-app -f ppc/dockerfile .
    docker run -d -p 8080:80 --name protein-app protein-app

Then open http://localhost:8080

### 2. With docker-compose
docker-compose.yml:
    version: "3.8"
    services:
      protein-app:
        image: protein-app:latest
        container_name: protein-app
        ports:
          - "8080:80"
        restart: unless-stopped

Run:
    docker compose up -d

### 3. In Portainer
- Option A (Build from tar):
  1. Upload the tar in Images → Build image
  2. Dockerfile path: ./ppc/dockerfile
  3. Tag: protein-app:latest
  4. Deploy container: image = protein-app:latest, port mapping 8080:80

- Option B (Stacks):
  1. Go to Stacks → Add stack
  2. Paste the docker-compose.yml above

---

## ✅ Acceptance Checks
- Chicken breast — $2.49/lb, 31 g / 100 g → $/g ≈ $0.0177 → $/30g ≈ $0.53
- Whey isolate — $39.99 for 5 lb, 25 g / 32 g → $/g ≈ $0.02257 → $/30g ≈ $0.68
- Sorting by $/30g ascending shows chicken before whey.
- Invalid/empty inputs show “—” and prevent saving.

---

## 🛣️ Roadmap (post-MVP)
- Import/export items (JSON)
- USDA FoodData Central integration
- Price tracking over time
- Barcode scan (mobile)

---

## 📜 License
MIT

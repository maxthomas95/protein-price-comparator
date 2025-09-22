# 🥩 Protein Price Comparator

Compare grocery items and protein powders by cost per gram of protein and cost per 30g. 

I’ve always wanted an easy way to compare which proteins are cheaper.
Sure, not all proteins are equal (something to explore in the future), but for now I wanted a simple, visual way to line up foods and powders side by side and see the cost per gram of protein — and especially what 30g of protein actually costs across different sources.

<img width="1210" height="422" alt="image" src="https://github.com/user-attachments/assets/1a693d55-f1bb-4c93-81dd-353b4ee66dd7" />

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
- Demo items on first run

## Tech stack

- Static site: HTML, CSS, vanilla JS modules ([index.html](index.html), [css/styles.css](css/styles.css), [js/app.js](js/app.js), [js/calc.js](js/calc.js), [js/format.js](js/format.js), [js/storage.js](js/storage.js), [js/dom.js](js/dom.js))
- API: Node.js (Express + CORS) ([api/server.js](api/server.js), [api/package.json](api/package.json))
- Reverse proxy: Nginx ([nginx.conf](nginx.conf))
- Containerization: Dockerfiles + Compose ([Dockerfile](Dockerfile), [api/Dockerfile](api/Dockerfile), [docker-compose.yml](docker-compose.yml), [.dockerignore](.dockerignore))

## Project structure (key files)

- Frontend entry: [index.html](index.html)
- Frontend logic: [js/app.js](js/app.js), calculations in [js/calc.js](js/calc.js), persistence in [js/storage.js](js/storage.js), formatting in [js/format.js](js/format.js), DOM helpers in [js/dom.js](js/dom.js)
- API service: [api/server.js](api/server.js) with endpoints GET /api/health, GET/PUT /api/state; npm scripts in [api/package.json](api/package.json)
- Nginx config: [nginx.conf](nginx.conf) (serves / and proxies /api to the API service)
- Containers and orchestration: [Dockerfile](Dockerfile) (web), [api/Dockerfile](api/Dockerfile) (API), [docker-compose.yml](docker-compose.yml)

## Quickstart (local, without Docker)

You can run the frontend alone (offline mode) or run the API as well.

Frontend only:
- Option A — VS Code Live Server: open [index.html](index.html) with “Open with Live Server”.
- Option B — Python http.server:
  ```
  python -m http.server 5173
  ```
  Then open http://localhost:5173

Note: When the API is unreachable, the app automatically switches to Offline mode and uses LocalStorage for persistence (see [js/storage.js](js/storage.js)).

Run the API:
```
cd api
npm install
npm start
```
- The API listens on http://localhost:3000 (configurable via PORT). Health check: http://localhost:3000/api/health. State endpoints: GET/PUT http://localhost:3000/api/state. Data is saved to /data/state.json on the host.
- To use the API with the frontend without Docker, serve the frontend through a dev server that proxies /api to http://localhost:3000; otherwise the UI will remain in Offline mode.

## Quickstart (Docker Compose)

Requires Docker Desktop (Compose v2).

```
docker compose up --build
```

- Open http://localhost
- The web container serves the static app and proxies /api to the API container per [nginx.conf](nginx.conf).
- Published ports (from [docker-compose.yml](docker-compose.yml)): 80:80 (web), 3000:3000 (API). The API is also reachable directly at http://localhost:3000.
- Persistent state is stored at /data inside the API container via the ppc-data volume.

## Configuration

- API
  - PORT: port to listen on (default 3000). Set via environment (see [docker-compose.yml](docker-compose.yml)); used by [api/server.js](api/server.js).
  - Data directory: fixed to /data inside the API (see [api/server.js](api/server.js)); ensure the path is writable when running outside Docker.
- Nginx: see [nginx.conf](nginx.conf) for the /api reverse proxy to http://api:3000/api/.

## Development tips

- Main UI logic: [js/app.js](js/app.js)
- Core calculations: [js/calc.js](js/calc.js)
- Persistence and Offline mode: [js/storage.js](js/storage.js)
- Formatting helpers: [js/format.js](js/format.js)
- DOM helpers: [js/dom.js](js/dom.js)
- When running via Docker, rebuild after changes:
  ```
  docker compose up --build
  ```

## Changelog

See [changelog.md](changelog.md).

## Versioning

This project follows Semantic Versioning: https://semver.org

## Contributing

Small PRs and bug reports are welcome. Keep changes focused and include updates to [README.md](README.md) and [changelog.md](changelog.md) when applicable.

## License

No license specified.
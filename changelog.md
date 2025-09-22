# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog 1.1.0 (https://keepachangelog.com/en/1.1.0/) and this project adheres to Semantic Versioning 2.0.0 (https://semver.org/spec/v2.0.0.html).

## Unreleased

## 0.1.0 — 2025-09-22

### Added
- Static site UI: [index.html](index.html), [css/styles.css](css/styles.css), core JS modules [js/app.js](js/app.js), [js/calc.js](js/calc.js), [js/format.js](js/format.js), [js/storage.js](js/storage.js), [js/dom.js](js/dom.js), and assets [assets/icons.svg](assets/icons.svg).
- Node API service (Express + CORS): [api/server.js](api/server.js), [api/package.json](api/package.json). Endpoints: GET /api/health and GET/PUT /api/state; file persistence under /data.
- Containerization and reverse proxy: [Dockerfile](Dockerfile), [api/Dockerfile](api/Dockerfile), [docker-compose.yml](docker-compose.yml), [nginx.conf](nginx.conf), and [.dockerignore](.dockerignore). Compose exposes 80:80 for web and 3000:3000 for API; ppc-data volume mounts /data; ppc-network connects services.
- Offline-first storage fallback to LocalStorage implemented in [js/storage.js](js/storage.js) when API is unavailable.
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Aerothon 6.0 hackathon project: a flight navigation tool that checks weather along a route and finds alternate airports/routes (Dijkstra shortest path). Two independent npm packages, no root package.json, no monorepo tooling:

- `flight-navigation-backend/` — Node + Express (CommonJS), MySQL
- `flight-navigation-frontend/` — React 18 + Vite (ESM), Tailwind + shadcn config, react-bootstrap, react-leaflet, chart.js/recharts

Hosted: frontend on Vercel (https://flight-navigation-frontend.vercel.app/), backend on Render (`https://flight-navigation-backend.onrender.com`).

## Commands

Backend (`cd flight-navigation-backend`):
- `npm install`
- `npm start` — runs `node server.js` on `PORT` (default 5000). `nodemon` is a dependency but has no script; use `npx nodemon server.js` for reload.

Frontend (`cd flight-navigation-frontend`):
- `npm run dev` — Vite dev server
- `npm run build` / `npm run preview`
- `npm run lint` — ESLint with `--max-warnings 0`, so any warning fails

There are no tests in either package (backend `npm test` is the npm placeholder that exits 1).

Database: load `deployDB.sql` (repo root) into a MySQL database named `airbus`. It creates `aircraft_data`, `airports`, `destinationairport`, `fuel`, `nearestairport`, `weather` and seeds data. See `Aerothon schema diagram.png` for the schema.

## Backend architecture

**`server.js` is the real, monolithic server.** Every endpoint, the MySQL connection, external API helpers, the hardcoded `routes` table, graph construction and Dijkstra all live in this one file (~1100 lines).

The `index.js` + `routers/` + `controllers/` + `utils/` + `middlewares/` layout is an abandoned refactor and is **not used**: `index.js` requires `./routes/...` (the folder is actually `routers/`), so it would crash; `utils/dbUtils.js` uses `pg` (Postgres) while the live server uses `mysql`; `authMiddleware` is a no-op. `routes.json` is not loaded anywhere — the route data actually used is the `const routes = [...]` array inside `server.js`. Make changes in `server.js` unless deliberately completing that refactor.

Key points in `server.js`:
- MySQL connection is created with hardcoded `localhost`/`root` credentials and database `airbus` (not from env). `util.promisify(db.query)` gives an async `query` used by later handlers.
- Env vars (via `.env`, which is committed): `WEATHER_API_KEY` (weatherapi.com), `AMADEUS_API_KEY` (Amadeus test API bearer token — short-lived, expires frequently), `PORT`.
- External services: weatherapi.com (current conditions → `extractFactors` → inserted into `Weather` table), Amadeus (airports near a lat/lon), airportgap.com (airport distance + coordinates by IATA).
- `routes` + `getCitiesCovered(origin, dest, routes)` map an IATA pair (direct or via one hop) to the intermediate cities whose weather determines whether a leg is flyable (`getFlyStatus`).
- `/api/airport-graphs` flow: airportgap distance → Amadeus airports within 280 km of the destination → `constructGraph` (weather-filtered legs from `routes`) merged with `constructGraph1` (haversine distances from source) → `findShortestPath` (Dijkstra) → `{ path, distance }`.
- `/api/get-nearest-airport` has its own nested Amadeus fetch, graph builder and `dijkstra`.
- **Duplicate handlers**: `POST /api/airport-graphs` and `POST /api/getFlyStatus` are each registered twice; Express runs only the first registration, so the later copies are dead code. `GET /api/getRoute` returns the in-file `routes` array.

Most endpoints are `POST` with a JSON body, even ones the README lists as `GET` — trust `server.js` over the README's API section.

## Frontend architecture

- Routes (`src/App.jsx`): `/` → `pages/FlightSearchBar.jsx` (main flow: pick aircraft, origin/destination, fetch weather along route and fly status), `/dashboard` → `pages/WeatherDetails.jsx`, `/altroute` → `pages/SearchAltRoute.jsx` (alternate-route graph, airport info, fuel). Other files in `pages/` are sub-components despite the folder name.
- The backend URL is hardcoded as `http://localhost:5000` in each axios/fetch call (no env var or shared client); switching to the Render backend means editing every call site.
- Some components call third-party APIs directly from the browser (airportgap, Amadeus in `src/distance.js`, RapidAPI airport-info in `SearchAltRoute.jsx`) with keys inlined in source.
- `@/` aliases `src/` (vite.config.js + jsconfig.json); shadcn `components.json` points utils at `@/lib/utils`.

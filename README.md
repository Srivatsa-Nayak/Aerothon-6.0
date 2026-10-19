# Aerothon 6.0 — Flight Navigation

A flight navigation tool built for Aerothon 6.0. It checks the weather along a flight route to decide whether the route is safe to fly, and when it isn't, finds alternate airports and the shortest alternate route using Dijkstra's algorithm.

**Live demo:** https://flight-navigation-frontend.vercel.app/

## Tech stack

- **Frontend:** React + Vite, Tailwind, Leaflet maps, charts — hosted on Vercel
- **Backend:** Node.js + Express — hosted on Render
- **Database:** MySQL
- **External APIs:** weatherapi.com (weather), Amadeus (nearby airports), airportgap.com (airport distances)

## Project structure

```
Aerothon-6.0/
├── flight-navigation-backend/    Express API server (entry point: server.js)
├── flight-navigation-frontend/   React app (pages in src/pages, UI in src/components)
└── deployDB.sql                  MySQL schema + seed data (database: airbus)
```

## Running locally

1. Load `deployDB.sql` into a MySQL database named `airbus`.
2. Backend:
   ```
   cd flight-navigation-backend
   npm install
   npm start          # runs on http://localhost:5000
   ```
3. Frontend:
   ```
   cd flight-navigation-frontend
   npm install
   npm run dev
   ```

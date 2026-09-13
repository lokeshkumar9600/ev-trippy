# EV Trip Planner

A React + TypeScript + Vite app for exploring electric vehicles, planning trips,
and finding nearby charging stations.

## Features

- **Vehicle Explorer** — browse and filter EVs with pagination and search
- **Vehicle Details** — modal with full vehicle info (battery, range, performance, charging)
- **Nearby Charging Stations** — interactive Mapbox map with station markers,
  station detail popups (name, address, power, availability), and selection
- **Trip Planner** — plan a route with an interactive map, charging stops,
  and route status tracking
- **Range Filter** — single-value slider to search stations from 1 to 10 km
- **GraphQL Data Layer** — Apollo Client for fetching vehicle, station,
  and route data

## Tech Stack

- React 19 + TypeScript
- Vite (build tool / dev server)
- Apollo Client + GraphQL
- Mantine + Radix UI (component library)
- Mapbox GL JS (maps — station markers, popups, navigation)
- React Router (client-side routing)

## Getting Started

```bash
npm install
npm run dev
```

The app starts at `http://localhost:5173`.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build |

## Project Structure

```
src/
  App.tsx                      # Root component + routes
  main.tsx                     # App entry point
  pages/
    VehicleExplorer.tsx        # Vehicle listing & filtering
    TripPlanner.tsx            # Trip planning with map + route tracking
    NearbyStations.tsx         # Nearby charging stations with range slider
  components/
    VehicleCard.tsx            # Vehicle card
    VehicleDetailsModal.tsx    # Vehicle detail modal
    NearbyStationsMap.tsx      # Mapbox map with station markers + popups
    MapView.tsx                 # Trip route map
    RouteStatus.tsx             # Route progress display
    TripForm.tsx                # Trip input form
  graphql/
    queries.ts                  # GraphQL queries (LIST_VEHICLES, GET_VEHICLE_DETAILS,
                                # GET_STATIONS_AROUND, GET_ROUTE, GET_STATION)
  lib/
    apollo.ts                   # Apollo Client setup
    geocoding.ts                # Address geocoding
    location.ts                 # User location helper
```

---

> This README was updated to reflect current features and file structure.

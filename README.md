# EV Trip Planner

A React + TypeScript + Vite app for exploring electric vehicles and planning trips.

## Features

- **Vehicle Explorer** — browse and filter EVs with pagination
- **Vehicle Details** — modal with full vehicle information
- **Trip Planner** — plan a route with an interactive Mapbox map
- **GraphQL data layer** — Apollo Client for fetching vehicle data

## Tech Stack

- React 19 + TypeScript
- Vite (build tool / dev server)
- Apollo Client + GraphQL
- Mantine + Radix UI (component library)
- Mapbox GL JS (maps)
- React Router (client-side routing)

## Getting Started

```bash
npm install
npm run dev
```

The app starts at `http://localhost:5173`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build |

## Project Structure

```
src/
  App.tsx              # Root component + routes
  main.tsx             # App entry point
  pages/
    VehicleExplorer.tsx   # Vehicle listing & filtering
    TripPlanner.tsx       # Trip planning with map
  components/
    VehicleCard.tsx         # Vehicle card
    VehicleDetailsModal.tsx # Vehicle detail modal
    MapView.tsx             # Mapbox map wrapper
  graphql/
    queries.ts              # GraphQL queries
  lib/
    apollo.ts               # Apollo Client setup
```

---

> This README was formatted and generated with the help of agentic AI — Claude Code.
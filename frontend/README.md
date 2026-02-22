# Real-Time Satellite Tracker

A Next.js web application that displays real-time satellite positions on a 2D world map using TLE (Two-Line Element) data and SGP4 propagation.

## Features

- 🛰️ **Real-Time Tracking**: Satellites update positions every 5 seconds with smooth animations
- 🗺️ **Interactive Map**: Click satellites to view detailed orbital information
- 📊 **Orbital Data**: View altitude, velocity, inclination, coordinates, and orbital elements
- 🎯 **Category Filters**: Toggle visibility of satellite categories (stations, navigation, weather, etc.)
- 🌍 **Ground Track**: View 90-minute orbital ground track for selected satellites
- 🎨 **Category Icons**: Distinct icons and colors for each satellite category

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Map**: deck.gl 9.x + react-map-gl 8.x + MapLibre GL JS 5.x
- **SGP4 Propagation**: satellite.js 6.x
- **State Management**: Zustand 5.x
- **Styling**: Tailwind CSS 4.x
- **Testing**: Vitest 2.x + Playwright 1.x

## Getting Started

### Prerequisites

- Node.js 20.x or later
- npm 10.x or later

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd sat

# Install dependencies
cd frontend
npm install

# Install Playwright browsers (for E2E tests)
npx playwright install
```

### Development

```bash
# Start development server
npm run dev

# Open in browser
open http://localhost:3000
```

### Testing

```bash
# Run unit/integration tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Build

```bash
# Production build
npm run build

# Start production server
npm start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Main page with map
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── map/
│   │   │   └── SatelliteMap.tsx  # Main map with deck.gl layers
│   │   ├── sidebar/
│   │   │   ├── Sidebar.tsx       # Collapsible sidebar container
│   │   │   ├── DetailsPanel.tsx  # Satellite details display
│   │   │   ├── FilterPanel.tsx   # Category filters
│   │   │   └── SatelliteList.tsx # Satellite list for selection
│   │   └── common/
│   │       ├── LoadingSpinner.tsx
│   │       └── ErrorBanner.tsx
│   ├── features/
│   │   ├── satellites/
│   │   │   ├── store.ts          # Zustand store
│   │   │   ├── hooks.ts          # Custom hooks
│   │   │   └── usePositionUpdater.ts
│   │   ├── filters/
│   │   │   └── useFilters.ts
│   │   └── orbital-path/
│   │       └── useGroundTrack.ts
│   ├── services/
│   │   ├── tle/
│   │   │   ├── parseTLE.ts       # TLE parsing utilities
│   │   │   └── fetchTLE.ts       # Data fetching with cache
│   │   └── propagator/
│   │       ├── propagate.ts      # SGP4 propagation
│   │       ├── batchPropagate.ts
│   │       └── groundTrack.ts
│   ├── types/
│   │   ├── index.ts              # TypeScript types
│   │   └── category.ts           # Category icons/colors
│   └── lib/
│       └── constants.ts          # App constants
├── public/
│   ├── data/
│   │   └── satellites.json       # Sample TLE data
│   └── icons/                    # Satellite category icons
├── tests/
│   ├── unit/                     # Vitest unit tests
│   ├── integration/              # Integration tests
│   └── e2e/                      # Playwright E2E tests
└── package.json
```

## Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
# TLE data source URL
NEXT_PUBLIC_TLE_URL=/data/satellites.json

# MapLibre GL map style URL
NEXT_PUBLIC_MAP_STYLE=https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json
```

## Satellite Categories

| Category | Icon | Description |
|----------|------|-------------|
| Station | 🏠 | Space stations (ISS, Tiangong) |
| Navigation | 🧭 | GPS, GLONASS, Galileo, BeiDou |
| Weather | 🌤️ | Weather/meteorological satellites |
| Science | 🔬 | Scientific research satellites |
| Debris | ⚠️ | Space debris |
| Unknown | ❓ | Unclassified objects |

## API

### Zustand Store

```typescript
const useSatelliteStore = create<SatelliteStore>((set) => ({
  satellites: new Map<number, Satellite>(),
  selectedId: null,
  filters: { station: true, navigation: true, ... },
  groundTrack: null,
  isLoading: true,
  error: null,
  
  setSatellites: (satellites) => set(...),
  selectSatellite: (id) => set(...),
  toggleFilter: (category) => set(...),
  updatePositions: (updates) => set(...),
}));
```

### Types

```typescript
interface Satellite {
  noradId: number;
  name: string;
  category: SatelliteCategory;
  tle: TwoLineElement;
  epoch: Date;
  position: GeodeticPosition;
  velocity: VelocityVector;
  orbitalElements: OrbitalElements;
  dataStatus: DataStatus;
  satrec: satellite.SatRec | null;
}
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

The app is zero-config for Vercel deployment with Next.js.

## Testing Coverage

The project maintains ≥80% test coverage:

- Unit tests for propagation and TLE parsing
- Integration tests for Zustand store
- E2E tests for user interactions

Run `npm run test:coverage` to generate coverage report.

## License

MIT

## Credits

- TLE data format: [CelesTrak](https://celestrak.org/)
- SGP4 propagation: [satellite.js](https://github.com/shashwatak/satellite-js)
- Map tiles: [CARTO](https://carto.com/basemaps/)

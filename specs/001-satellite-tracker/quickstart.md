# Quickstart: Real-Time Satellite Tracker

**Branch**: `001-satellite-tracker` | **Date**: 2026-02-22

## Prerequisites

- **Node.js**: 20.x LTS or later
- **npm**: 10.x or later (included with Node.js)
- **Git**: For version control
- **Modern browser**: Chrome, Firefox, Safari, or Edge (latest 2 versions)

---

## Initial Setup

### 1. Create Project

```bash
# From repository root
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd frontend
```

### 2. Install Dependencies

```bash
# Core dependencies
npm install deck.gl react-map-gl maplibre-gl satellite.js zustand

# Development dependencies
npm install -D @types/maplibre-gl vitest @vitest/coverage-v8 jsdom
npm install -D @playwright/test @testing-library/react @testing-library/jest-dom

# Install Playwright browsers
npx playwright install
```

### 3. Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Main page (Server Component)
│   │   └── globals.css
│   ├── components/
│   │   ├── map/
│   │   │   ├── SatelliteMap.tsx      # 'use client'
│   │   │   └── SatelliteLayer.tsx
│   │   ├── sidebar/
│   │   │   ├── Sidebar.tsx           # 'use client'
│   │   │   ├── FilterPanel.tsx
│   │   │   └── DetailsPanel.tsx
│   │   └── common/
│   │       ├── LoadingSpinner.tsx
│   │       └── ErrorBanner.tsx
│   ├── features/
│   │   ├── satellites/
│   │   │   ├── types.ts
│   │   │   ├── store.ts
│   │   │   └── hooks.ts
│   │   ├── filters/
│   │   │   └── useFilters.ts
│   │   └── orbital-path/
│   │       └── useGroundTrack.ts
│   ├── services/
│   │   ├── tle/
│   │   │   ├── fetchTLE.ts
│   │   │   └── parseTLE.ts
│   │   └── propagator/
│   │       ├── propagate.ts
│   │       └── groundTrack.ts
│   ├── types/
│   │   └── index.ts
│   └── lib/
│       └── constants.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── public/
│   └── icons/
│       ├── station.svg
│       ├── navigation.svg
│       └── weather.svg
├── next.config.ts
├── tsconfig.json
├── vitest.config.ts
└── playwright.config.ts
```

---

## Configuration Files

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'tests/unit/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        global: { lines: 80, branches: 80, functions: 80 }
      },
      exclude: ['tests/**', 'src/types/**', '**/*.d.ts']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
});
```

### next.config.ts

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Transpile deck.gl and related packages
  transpilePackages: ['deck.gl', '@deck.gl/core', '@deck.gl/layers', '@deck.gl/react'],
};

export default nextConfig;
```

### package.json scripts

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test"
  }
}
```

---

## Development Commands

```bash
# Start development server
npm run dev

# Run unit tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage
npm run test -- --coverage

# Run E2E tests
npx playwright test

# Run E2E tests with UI
npx playwright test --ui

# Type check
npx tsc --noEmit

# Lint (if ESLint configured)
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Key Implementation Patterns

### Zustand Store (src/features/satellites/store.ts)

```typescript
import { create } from 'zustand';
import type { Satellite, SatelliteCategory } from '@/types';

interface SatelliteStore {
  satellites: Map<number, Satellite>;
  selectedId: number | null;
  filters: Record<SatelliteCategory, boolean>;
  isLoading: boolean;
  
  setPositions: (satellites: Satellite[]) => void;
  selectSatellite: (id: number | null) => void;
  toggleFilter: (category: SatelliteCategory) => void;
}

export const useSatelliteStore = create<SatelliteStore>((set) => ({
  satellites: new Map(),
  selectedId: null,
  filters: { station: true, navigation: true, weather: true },
  isLoading: true,
  
  setPositions: (satellites) => set({
    satellites: new Map(satellites.map(s => [s.noradId, s])),
    isLoading: false
  }),
  
  selectSatellite: (id) => set({ selectedId: id }),
  
  toggleFilter: (category) => set((state) => ({
    filters: { ...state.filters, [category]: !state.filters[category] }
  }))
}));
```

### SGP4 Propagation (src/services/propagator/propagate.ts)

```typescript
import * as satellite from 'satellite.js';
import type { GeodeticPosition, VelocityVector } from '@/types';

export function propagateSatellite(
  satrec: satellite.SatRec,
  time: Date
): { position: GeodeticPosition; velocity: VelocityVector } | null {
  const posVel = satellite.propagate(satrec, time);
  
  if (!posVel.position || typeof posVel.position === 'boolean') {
    return null;
  }
  
  const gmst = satellite.gstime(time);
  const geo = satellite.eciToGeodetic(posVel.position, gmst);
  
  const velocity = posVel.velocity as satellite.EciVec3<number>;
  const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2);
  
  return {
    position: {
      latitude: satellite.degreesLat(geo.latitude),
      longitude: satellite.degreesLong(geo.longitude),
      altitude: geo.height,
      timestamp: time
    },
    velocity: {
      x: velocity.x,
      y: velocity.y,
      z: velocity.z,
      speed
    }
  };
}
```

### Map Component Pattern (src/components/map/SatelliteMap.tsx)

```typescript
'use client';

import { useEffect, useState } from 'react';
import Map from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import { IconLayer, PathLayer } from '@deck.gl/layers';
import { useSatelliteStore } from '@/features/satellites/store';
import 'maplibre-gl/dist/maplibre-gl.css';

const INITIAL_VIEW = {
  longitude: 0,
  latitude: 20,
  zoom: 1.5,
  pitch: 0,
  bearing: 0
};

export function SatelliteMap() {
  const { satellites, selectedId, filters } = useSatelliteStore();
  
  // Filter visible satellites
  const visibleSatellites = Array.from(satellites.values())
    .filter(s => filters[s.category]);
  
  const layers = [
    new IconLayer({
      id: 'satellites',
      data: visibleSatellites,
      getPosition: d => [d.position.longitude, d.position.latitude],
      getIcon: d => d.category,
      getSize: d => d.noradId === selectedId ? 48 : 32,
      iconAtlas: '/icons/satellite-atlas.png',
      iconMapping: '/icons/satellite-mapping.json',
      pickable: true,
      // Smooth position transitions!
      transitions: {
        getPosition: 1000
      }
    }),
    // Ground track for selected satellite
    selectedId && new PathLayer({
      id: 'ground-track',
      data: [satellites.get(selectedId)?.groundTrack].filter(Boolean),
      getPath: d => d.points.map(p => [p.longitude, p.latitude]),
      getColor: [255, 140, 0, 200],
      widthMinPixels: 2,
      jointRounded: true
    })
  ].filter(Boolean);
  
  return (
    <DeckGL
      initialViewState={INITIAL_VIEW}
      controller={true}
      layers={layers}
      onClick={({ object }) => {
        if (object) useSatelliteStore.getState().selectSatellite(object.noradId);
      }}
    >
      <Map
        mapStyle="https://demotiles.maplibre.org/style.json"
        style={{ width: '100%', height: '100vh' }}
      />
    </DeckGL>
  );
}
```

### Page Component (src/app/page.tsx)

```typescript
import dynamic from 'next/dynamic';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// Load map client-side only (deck.gl needs browser APIs)
const SatelliteMap = dynamic(
  () => import('@/components/map/SatelliteMap').then(mod => mod.SatelliteMap),
  { 
    ssr: false,
    loading: () => <LoadingSpinner />
  }
);

export default function Home() {
  return (
    <main className="relative h-screen w-screen">
      <SatelliteMap />
      <Sidebar />
    </main>
  );
}
```
```

---

## Testing Patterns

### Unit Test Example (tests/unit/propagate.test.ts)

```typescript
import { describe, it, expect } from 'vitest';
import * as satellite from 'satellite.js';
import { propagateSatellite } from '../../src/services/propagator/propagate';

describe('propagateSatellite', () => {
  const ISS_TLE = {
    line1: '1 25544U 98067A   26053.50900463  .00003075  00000-0  59442-4 0  9992',
    line2: '2 25544  51.6433  59.2583 0008217  16.4489 347.6017 15.51174618173442'
  };
  
  it('returns valid position for ISS TLE', () => {
    const satrec = satellite.twoline2satrec(ISS_TLE.line1, ISS_TLE.line2);
    const result = propagateSatellite(satrec, new Date('2026-02-22T12:00:00Z'));
    
    expect(result).not.toBeNull();
    expect(result!.position.latitude).toBeGreaterThanOrEqual(-90);
    expect(result!.position.latitude).toBeLessThanOrEqual(90);
    expect(result!.position.altitude).toBeGreaterThan(200); // ISS ~400km
    expect(result!.velocity.speed).toBeCloseTo(7.66, 1); // ISS ~7.66 km/s
  });
});
```

### E2E Test Example (tests/e2e/satellite-selection.spec.ts)

```typescript
import { test, expect } from '@playwright/test';

test('selecting satellite shows details panel', async ({ page }) => {
  await page.goto('/');
  
  // Wait for satellites to load
  await expect(page.locator('.loading-spinner')).toBeHidden({ timeout: 10000 });
  
  // Click a satellite icon
  await page.click('[data-testid="satellite-25544"]');
  
  // Verify details panel appears
  await expect(page.locator('[data-testid="details-panel"]')).toBeVisible();
  await expect(page.locator('[data-testid="satellite-name"]')).toContainText('ISS');
});
```

---

## Deployment (Vercel)

### Build for Production

```bash
npm run build
# Output in .next/ folder
```

### Vercel Setup

1. **Install Vercel CLI** (optional, for local preview):
   ```bash
   npm install -g vercel
   ```

2. **Connect Repository**:
   - Go to [vercel.com](https://vercel.com) and sign in with GitHub
   - Click "Add New Project" → Import your repository
   - Vercel auto-detects Vite and configures:
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

3. **Deploy**:
   - Every push to `main` triggers automatic deployment
   - PRs get preview deployments with unique URLs

### Environment Variables

Set in Vercel Dashboard → Project → Settings → Environment Variables:

| Name | Value |
|------|-------|
| `VITE_TLE_URL` | `https://raw.githubusercontent.com/owner/repo/main/data/satellites.json` |

Access in code:
```typescript
const TLE_URL = import.meta.env.VITE_TLE_URL;
```

### Local Preview (Optional)

```bash
# Build and start production server locally
npm run build && npm run start

# Or use Vercel CLI
vercel dev
```

---

## Next Steps

1. Run `/speckit.tasks` to generate implementation tasks
2. Follow test-first development (constitution requirement)
3. Implement features in priority order (P1 → P5)

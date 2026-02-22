# Research: Real-Time Satellite Tracker

**Branch**: `001-satellite-tracker` | **Date**: 2026-02-22

## Overview

This document consolidates research findings for the technical decisions required to implement the satellite tracker web application.

---

## 1. Mapping Library

### Decision: deck.gl + react-map-gl (MapLibre basemap)

**Rationale:**
- **Purpose-built for large datasets** - GPU-instanced rendering handles 10k+ points at 60fps
- **Built-in transitions** - `transitions: { getPosition: 1000 }` provides smooth satellite movement animations
- **IconLayer** - Optimized for thousands of icons with automatic batching
- **PathLayer with greatCircle** - Native support for orbital ground tracks without Turf.js
- **GPU-accelerated picking** - Fast click detection even with many objects
- **First-class React support** - `@deck.gl/react` with hooks integration
- **Open source** (MIT) - No API keys required, uses MapLibre GL JS as basemap

**Alternatives Considered:**

| Library | Reason Rejected |
|---------|-----------------|
| MapLibre GL JS (raw) | Requires manual GeoJSON updates, no built-in transitions |
| Leaflet | DOM-based rendering cannot achieve 60fps with 200 updating markers |
| Mapbox GL JS | Proprietary license, mandatory API key, usage-based pricing |
| CesiumJS | Overkill for 2D map; 3D globe adds complexity |

**Key Integration Notes:**
- Use `IconLayer` for satellite icons with `transitions` for smooth position updates
- Use `PathLayer` for ground tracks (or `ArcLayer` for 3D arcs)
- `react-map-gl` provides the MapLibre basemap
- Free tile source: CartoDB Dark Matter (no labels) — no API key required

---

## 2. SGP4/SDP4 Propagation Library

### Decision: satellite.js

**Rationale:**
- **Performance**: WASM-based `BulkPropagator` for batch calculations (critical for 100-200 satellites)
- **Accuracy**: Based on Vallado's reference implementation, verified against SpaceTrack Report #3
- **Active maintenance**: Updated January 2025, 19 contributors, 12k weekly npm downloads
- **Zero dependencies**: No supply chain risk
- **Comprehensive API**: TLE/OMM parsing, coordinate transforms, look angles, Doppler
- **Native TypeScript**: Built-in type definitions

**Alternatives Considered:**

| Library | Reason Rejected |
|---------|-----------------|
| tle.js | Wrapper around satellite.js (adds dependency), less actively maintained, no WASM |
| ootk | AGPL license (copyleft), larger bundle (~2.5MB), overkill for basic tracking |
| sgp4 (node-sgp4) | Abandoned (10 years old), no TypeScript, no modern features |

**Key API Patterns:**

```typescript
import * as satellite from 'satellite.js';

// Parse TLE once at startup
const satrec = satellite.twoline2satrec(tle1, tle2);

// Propagate to current time
const posVel = satellite.propagate(satrec, new Date());
const gmst = satellite.gstime(new Date());
const geo = satellite.eciToGeodetic(posVel.position, gmst);

// Extract coordinates
const lat = satellite.degreesLat(geo.latitude);
const lng = satellite.degreesLong(geo.longitude);
const alt = geo.height; // km

// Velocity calculation
const speed = Math.sqrt(posVel.velocity.x**2 + posVel.velocity.y**2 + posVel.velocity.z**2);

// Orbital elements
const inclination = satrec.inclo * (180 / Math.PI); // degrees
```

**Performance Considerations:**
- Pre-compute `satrec` objects at TLE fetch, reuse for propagation
- Cache `gmst` once per update cycle, not per satellite
- Use Web Workers for batch calculations to avoid blocking main thread

---

## 3. UI Framework

### Decision: Next.js 16 (App Router)

**Rationale:**
- **Future-ready**: Auth.js/NextAuth integration when user accounts are needed
- **API Routes**: Ready for server-side features without separate backend
- **Map library ecosystem**: deck.gl and react-map-gl work seamlessly as Client Components
- **Real-time updates**: React 18 automatic batching handles 5-second intervals
- **TypeScript support**: Best-in-class with excellent type inference
- **Vercel deployment**: Zero-config, automatic edge caching, PR previews

**Alternatives Considered:**

| Framework | Reason Rejected |
|-----------|-----------------|
| Vite + React | No built-in API routes; migration cost when auth needed |
| Solid | No mature deck.gl wrappers; manual integration required |
| Vue 3 | Smaller mapping ecosystem, fewer visualization options |
| Remix | Less Vercel integration; more backend-focused |

**Architecture Notes:**
- Map component is `'use client'` (deck.gl needs browser APIs)
- Use `dynamic()` with `ssr: false` for map to avoid hydration issues
- Server Components for static UI (sidebar chrome, filter labels)
- Turbopack for fast dev builds

**State Management: Zustand**
- ~1KB bundle size, no boilerplate
- Fine-grained subscriptions (only re-render components using changed slices)
- Works seamlessly with React 18 concurrent features

```typescript
interface SatelliteStore {
  positions: Map<string, Position>;
  selectedId: string | null;
  filters: { stations: boolean; navigation: boolean; weather: boolean };
  updatePositions: (data: Position[]) => void;
}
```

---

## 4. Testing Stack

### Decision: Vitest (unit/integration) + Playwright (E2E)

**Rationale:**

**Vitest:**
- Native ESM + TypeScript via esbuild, zero config
- 2-10x faster than Jest (critical for CI/CD)
- Shares Vite config seamlessly
- Built-in coverage via v8/istanbul

**Playwright:**
- Chromium, Firefox, WebKit (Safari) support out of box
- Parallel execution by default
- Canvas/WebGL map interaction support
- Built-in device emulation and geolocation mocking

**Alternatives Considered:**

| Framework | Reason Rejected |
|-----------|-----------------|
| Jest | Slower transforms, requires ts-jest config, no native ESM |
| Cypress | Single-threaded (slow CI), weaker canvas/map support, Safari experimental |

**Coverage Strategy:**

| Test Type | Target | Focus Areas |
|-----------|--------|-------------|
| Unit | 90%+ | SGP4 propagation, TLE parsing, coordinate transforms |
| Integration | 80%+ | Component interactions, state management, filter logic |
| E2E | Critical paths | Map load → satellite display → selection → details panel |

**Configuration:**

```typescript
// vite.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      thresholds: { global: { lines: 80, branches: 80, functions: 80 } }
    }
  }
})
```

---

## 5. Additional Dependencies

### Map Tiles
- **Primary**: CartoDB Dark Matter (no labels) — free, no API key required
- **Fallback**: OpenStreetMap raster tiles (no API key)

### Ground Track Calculations
- **@turf/great-circle**: Generate curved orbital paths as GeoJSON

### Date/Time
- **Native Date API**: Sufficient for propagation timestamps
- Consider **date-fns** only if timezone display needed

### Icons
- **Custom SVG sprites** for satellite category differentiation
- Consider **Lucide React** for UI icons (sidebar, close buttons)

---

## Technology Stack Summary

| Category | Choice | Version |
|----------|--------|---------|
| Language | TypeScript | 5.x |
| Framework | Next.js (App Router) | 15.x |
| Visualization | deck.gl | 9.x |
| Basemap | react-map-gl + MapLibre GL JS | 7.x / 4.x |
| SGP4 Library | satellite.js | 6.x |
| State Management | Zustand | 4.x |
| Unit Testing | Vitest | 2.x |
| E2E Testing | Playwright | 1.x |
| Deployment | Vercel | - |

---

## Open Questions Resolved

| Question | Resolution |
|----------|------------|
| Mapping library for 200+ satellites? | deck.gl IconLayer with GPU instancing + react-map-gl basemap |
| SGP4 library choice? | satellite.js with WASM bulk propagation |
| UI framework for real-time updates? | React 18 with Zustand state |
| Testing stack for 80% coverage? | Vitest + Playwright |
| Map tile source? | CartoDB Dark Matter (no labels) / OSM fallback |
| Smooth satellite movement? | deck.gl built-in transitions |

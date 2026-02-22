# Tasks: Real-Time Satellite Tracker

**Input**: Design documents from `/specs/001-satellite-tracker/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Paths use `frontend/` as defined in plan.md

---

## Phase 1: Setup

**Purpose**: Project initialization and configuration

- [X] T001 Create Next.js 16 project with `npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
- [X] T002 Install core dependencies: `npm install deck.gl react-map-gl maplibre-gl satellite.js zustand`
- [X] T003 [P] Install dev dependencies: `npm install -D @types/maplibre-gl vitest @vitest/coverage-v8 jsdom @vitejs/plugin-react @playwright/test @testing-library/react @testing-library/jest-dom`
- [X] T004 [P] Configure next.config.ts with deck.gl transpilation in frontend/next.config.ts
- [X] T005 [P] Create vitest.config.ts with coverage thresholds (80%) in frontend/vitest.config.ts
- [X] T006 [P] Create playwright.config.ts for E2E tests in frontend/playwright.config.ts
- [X] T007 [P] Create test setup file in frontend/tests/setup.ts
- [X] T008 Install Playwright browsers: `npx playwright install`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types and services that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T009 Create TypeScript type definitions for all entities in frontend/src/types/index.ts
- [X] T010 [P] Create SatelliteCategory enum and icon mapping in frontend/src/types/category.ts
- [X] T011 [P] Create TLE parsing service in frontend/src/services/tle/parseTLE.ts
- [X] T012 [P] Create TLE fetch service with cache fallback in frontend/src/services/tle/fetchTLE.ts
- [X] T013 Create SGP4 propagation service in frontend/src/services/propagator/propagate.ts
- [X] T014 [P] Create constants file with update intervals and thresholds in frontend/src/lib/constants.ts
- [X] T015 [P] Create satellite icon SVGs (station, navigation, weather) in frontend/public/icons/
- [X] T016 [P] Create icon atlas and mapping JSON for deck.gl in frontend/public/icons/satellite-atlas.png and satellite-mapping.json
- [X] T017 Create LoadingSpinner component in frontend/src/components/common/LoadingSpinner.tsx
- [X] T018 [P] Create ErrorBanner component in frontend/src/components/common/ErrorBanner.tsx

**Checkpoint**: Foundation ready - user story implementation can begin

---

## Phase 3: User Story 1 - View Satellites on Map (Priority: P1) 🎯 MVP

**Goal**: Display satellites on a 2D world map with category-specific icons

**Independent Test**: Open app → verify satellite icons appear on map at plausible positions with distinct icons per category

### Implementation for User Story 1

- [X] T019 [US1] Create Zustand satellite store with initial state in frontend/src/features/satellites/store.ts
- [X] T020 [US1] Create useSatellites hook for store access in frontend/src/features/satellites/hooks.ts
- [X] T021 [US1] Create SatelliteMap client component with deck.gl IconLayer in frontend/src/components/map/SatelliteMap.tsx
- [X] T022 [US1] Create main page with dynamic map import (ssr: false) in frontend/src/app/page.tsx
- [X] T023 [US1] Create root layout with metadata in frontend/src/app/layout.tsx
- [X] T024 [US1] Implement TLE fetch on app load and populate store in frontend/src/components/map/SatelliteMap.tsx
- [X] T025 [US1] Add loading spinner overlay during initial data fetch in frontend/src/app/page.tsx
- [X] T026 [US1] Add error handling for TLE fetch failures with ErrorBanner
- [X] T027 [US1] Style map to full-screen with proper CSS in frontend/src/app/globals.css

**Checkpoint**: Map displays with satellite icons at correct positions - MVP complete

---

## Phase 4: User Story 2 - Real-Time Position Updates (Priority: P2)

**Goal**: Satellite positions update automatically every 5 seconds with smooth transitions

**Independent Test**: Watch ISS icon for 60 seconds → verify it moves perceptibly across the map

### Implementation for User Story 2

- [X] T028 [US2] Create position update loop with setInterval (5000ms) in frontend/src/features/satellites/usePositionUpdater.ts
- [X] T029 [US2] Implement batch propagation for all satellites in frontend/src/services/propagator/batchPropagate.ts
- [X] T030 [US2] Update Zustand store action for position batch updates in frontend/src/features/satellites/store.ts
- [X] T031 [US2] Add deck.gl transitions config for smooth icon movement (1000ms) in frontend/src/components/map/SatelliteMap.tsx
- [X] T032 [US2] Integrate position updater hook in SatelliteMap component
- [X] T033 [US2] Add cleanup for interval on component unmount

**Checkpoint**: Satellites move smoothly across map in real-time

---

## Phase 5: User Story 3 - View Satellite Details (Priority: P3)

**Goal**: Click satellite → details panel shows name, altitude, velocity, inclination, coordinates

**Independent Test**: Click any satellite → verify details panel appears with accurate orbital data

### Implementation for User Story 3

- [X] T034 [US3] Add selectedSatelliteId to Zustand store in frontend/src/features/satellites/store.ts
- [X] T035 [US3] Create Sidebar container component (collapsible) in frontend/src/components/sidebar/Sidebar.tsx
- [X] T036 [US3] Create DetailsPanel component with satellite info display in frontend/src/components/sidebar/DetailsPanel.tsx
- [X] T037 [US3] Add click handler to deck.gl IconLayer for satellite selection in frontend/src/components/map/SatelliteMap.tsx
- [X] T038 [US3] Implement satellite deselection (close button, click outside)
- [X] T039 [US3] Format orbital data display (altitude km, velocity km/s, inclination degrees)
- [X] T040 [US3] Update details panel values on position update cycle
- [X] T041 [US3] Add Sidebar to main page layout in frontend/src/app/page.tsx

**Checkpoint**: Clicking satellite shows detailed orbital information

---

## Phase 6: User Story 4 - Filter Satellites by Category (Priority: P4)

**Goal**: Toggle category visibility (stations, navigation, weather) via sidebar controls

**Independent Test**: Toggle "Weather" filter off → verify weather satellite icons disappear from map

### Implementation for User Story 4

- [X] T042 [US4] Add category filters state to Zustand store in frontend/src/features/satellites/store.ts
- [X] T043 [US4] Create FilterPanel component with toggle switches in frontend/src/components/sidebar/FilterPanel.tsx
- [X] T044 [US4] Create useFilters hook for filter state access in frontend/src/features/filters/useFilters.ts
- [X] T045 [US4] Filter visible satellites in IconLayer data based on filter state
- [X] T046 [US4] Close details panel when selected satellite's category is hidden
- [X] T047 [US4] Add FilterPanel to Sidebar component
- [X] T048 [US4] Persist filter state across position updates

**Checkpoint**: Category filters control which satellites are visible

---

## Phase 7: User Story 5 - View Orbital Path (Priority: P5)

**Goal**: Selected satellite shows ground track as curved line on map

**Independent Test**: Select ISS → verify curved orbital path line appears showing ~90 min of track

### Implementation for User Story 5

- [X] T049 [US5] Create ground track calculation service in frontend/src/services/propagator/groundTrack.ts
- [X] T050 [US5] Create useGroundTrack hook for selected satellite in frontend/src/features/orbital-path/useGroundTrack.ts
- [X] T051 [US5] Add PathLayer to SatelliteMap for ground track visualization in frontend/src/components/map/SatelliteMap.tsx
- [X] T052 [US5] Calculate 90-minute track (45 min past, 45 min future) at 30-second resolution
- [X] T053 [US5] Clear ground track when satellite is deselected
- [X] T054 [US5] Update ground track on selection change
- [X] T055 [US5] Style ground track line (color, width, opacity)

**Checkpoint**: Selected satellite shows orbital ground track

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Quality, performance, and deployment readiness

- [X] T056 [P] Add unit tests for propagate.ts in frontend/tests/unit/propagate.test.ts
- [X] T057 [P] Add unit tests for parseTLE.ts in frontend/tests/unit/parseTLE.test.ts
- [X] T058 [P] Add unit tests for groundTrack.ts in frontend/tests/unit/groundTrack.test.ts
- [X] T059 [P] Add integration test for satellite store in frontend/tests/integration/store.test.ts
- [X] T060 Add E2E test for satellite selection flow in frontend/tests/e2e/satellite-selection.spec.ts
- [X] T061 Add E2E test for filter functionality in frontend/tests/e2e/filters.spec.ts
- [X] T062 [P] Add data-testid attributes to key UI elements for E2E tests
- [X] T063 Run coverage report and verify ≥80% threshold
- [X] T064 [P] Create sample TLE data file for local development in frontend/public/data/satellites.json
- [X] T065 [P] Add environment variable for TLE URL in frontend/.env.local
- [X] T066 [P] Update README.md with setup and run instructions
- [X] T067 Verify Vercel deployment configuration
- [X] T068 Run quickstart.md validation to confirm setup works

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ←── BLOCKS ALL USER STORIES
    ↓
┌───┴───┬───────┬───────┬───────┐
↓       ↓       ↓       ↓       ↓
US1     US2*    US3*    US4*    US5*
(P1)    (P2)    (P3)    (P4)    (P5)
↓       ↓       ↓       ↓       ↓
└───────┴───────┴───────┴───────┘
                ↓
        Phase 8 (Polish)

* US2-US5 can run in parallel after US1 is complete
  (US1 establishes core map infrastructure)
```

### User Story Dependencies

| Story | Depends On | Can Start After |
|-------|------------|-----------------|
| US1 | Foundational | Phase 2 complete |
| US2 | US1 (map exists) | T027 complete |
| US3 | US1 (map + selection) | T027 complete |
| US4 | US1 (store + map) | T027 complete |
| US5 | US1 + US3 (selection) | T041 complete |

### Parallel Opportunities per Phase

**Phase 1** (Setup):
```
T003 ─┬─ T004 ─┬─ T005 ─┬─ T006 ─┬─ T007
      └────────┴────────┴────────┴────────→ (all parallel)
```

**Phase 2** (Foundational):
```
T010 ─┬─ T011 ─┬─ T012 ─┬─ T014 ─┬─ T015 ─┬─ T016 ─┬─ T018
      └────────┴────────┴────────┴────────┴────────┴────────→ (all parallel)
```

**After US1**: US2, US3, US4 can proceed in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. ✅ Complete Phase 1: Setup
2. ✅ Complete Phase 2: Foundational
3. ✅ Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Satellites visible on map with correct positions
5. Deploy to Vercel → **MVP shipped!**

### Incremental Delivery

| Increment | Stories | Value Delivered |
|-----------|---------|-----------------|
| MVP | US1 | Static satellite positions on map |
| v1.1 | + US2 | Real-time movement |
| v1.2 | + US3 | Satellite details on click |
| v1.3 | + US4 | Category filtering |
| v1.4 | + US5 | Orbital path visualization |

### Estimated Task Count

| Phase | Tasks | Parallel |
|-------|-------|----------|
| Setup | 8 | 5 |
| Foundational | 10 | 7 |
| US1 (P1) | 9 | 0 |
| US2 (P2) | 6 | 0 |
| US3 (P3) | 8 | 0 |
| US4 (P4) | 7 | 0 |
| US5 (P5) | 7 | 0 |
| Polish | 13 | 8 |
| **Total** | **68** | **20** |

---

## Notes

- Constitution requires ≥80% test coverage - tests included in Polish phase
- All client components must have `'use client'` directive
- Map component uses `dynamic()` with `ssr: false` to avoid hydration issues
- deck.gl `transitions` provide smooth satellite movement animations
- Vercel deployment is zero-config for Next.js projects

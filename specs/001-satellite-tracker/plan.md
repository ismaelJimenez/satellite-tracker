# Implementation Plan: Real-Time Satellite Tracker

**Branch**: `001-satellite-tracker` | **Date**: 2026-02-22 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-satellite-tracker/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build a web application that displays real-time satellite positions on a 2D world map. The app tracks space stations (ISS, Tiangong), GPS/navigation satellites, and weather satellites using TLE data fetched from GitHub (populated by backoffice process). Satellites appear as icons with orbital paths, positions auto-update every 5 seconds, and a collapsible sidebar provides category filters and satellite details (altitude, velocity, inclination, coordinates).

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: Next.js 16, deck.gl, react-map-gl, satellite.js, Zustand  
**Storage**: N/A (client-side only; TLE data fetched from GitHub static file)  
**Testing**: Vitest (unit/integration) + Playwright (E2E)  
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
**Project Type**: web-app (single-page application, frontend-only)  
**Performance Goals**: <3s initial load, <100ms interaction response, 60fps map rendering  
**Constraints**: <1s Time to Interactive, <200ms position updates, support 200 satellites without degradation  
**Scale/Scope**: 100-200 satellites displayed, single view with sidebar, no backend required

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Pre-Research | Post-Design | Notes |
|-----------|-------------|--------------|-------------|-------|
| I. Code Quality First | Linting, type checking, clean architecture | ✅ PASS | ✅ PASS | TypeScript strict mode; modular structure defined |
| II. Test-First Development | Tests before implementation; ≥80% coverage | ✅ PASS | ✅ PASS | Vitest + Playwright; coverage thresholds configured |
| III. UX Consistency | Design system, error handling, loading states, WCAG AA | ✅ PASS | ✅ PASS | Loading spinner, error handling defined in data model |
| IV. Performance by Design | <100ms interaction, <1s TTI, <200ms API p95 | ✅ PASS | ✅ PASS | WebGL rendering, 5s batch updates, 200 satellite budget |

**Post-Design Assessment**: All gates pass. Design decisions align with constitution:
- Vitest coverage thresholds set to 80% (Test-First)
- deck.gl WebGL rendering meets 60fps requirement (Performance)
- Loading states and error handling defined in data model (UX Consistency)
- TypeScript strict mode enforced (Code Quality)

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/        # UI components (Map, Sidebar, SatelliteIcon, DetailsPanel)
│   │   ├── map/
│   │   ├── sidebar/
│   │   └── common/
│   ├── features/          # Feature modules (satellites, filters, details)
│   │   ├── satellites/
│   │   ├── filters/
│   │   └── orbital-path/
│   ├── services/          # Data fetching and SGP4 calculations
│   │   ├── tle/
│   │   └── propagator/
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Shared utilities
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── public/                # Static assets (satellite icons)
└── index.html
```

**Structure Decision**: Frontend-only web application. No backend required since TLE data is fetched from GitHub static files. Single `frontend/` directory for clarity and potential future backend addition.

## Complexity Tracking

> No constitution violations requiring justification. Design adheres to all principles.

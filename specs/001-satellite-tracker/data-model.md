# Data Model: Real-Time Satellite Tracker

**Branch**: `001-satellite-tracker` | **Date**: 2026-02-22

## Overview

This document defines the data entities, their relationships, and validation rules for the satellite tracker application. All types are defined in TypeScript.

---

## Core Entities

### Satellite

Represents a tracked space object with TLE data and computed position.

```typescript
interface Satellite {
  /** NORAD Catalog Number (unique identifier) */
  noradId: number;
  
  /** Human-readable satellite name */
  name: string;
  
  /** Category for filtering and icon styling */
  category: SatelliteCategory;
  
  /** Two-Line Element data for position calculation */
  tle: TwoLineElement;
  
  /** TLE epoch - when the orbital data was generated */
  epoch: Date;
  
  /** Computed current position (updated every 5 seconds) */
  position: GeodeticPosition;
  
  /** Computed velocity vector */
  velocity: VelocityVector;
  
  /** Derived orbital parameters for display */
  orbitalElements: OrbitalElements;
  
  /** Data freshness indicator */
  dataStatus: DataStatus;
}
```

**Validation Rules:**
- `noradId`: Positive integer, 1-99999 (5-digit NORAD ID limit)
- `name`: Non-empty string, max 24 characters
- `category`: Must be valid enum value
- `epoch`: Must be within 30 days of current date (older = stale warning, >30 days = excluded)

---

### SatelliteCategory

Classification for filtering and visual differentiation.

```typescript
enum SatelliteCategory {
  /** Space stations: ISS, Tiangong, etc. */
  STATION = 'station',
  
  /** GPS/GLONASS/Galileo navigation satellites */
  NAVIGATION = 'navigation',
  
  /** Weather/meteorological satellites */
  WEATHER = 'weather'
}
```

**Icon Mapping:**
| Category | Icon Style | Color |
|----------|------------|-------|
| STATION | Large circle with ring | Blue |
| NAVIGATION | Small diamond | Green |
| WEATHER | Cloud-shaped | Orange |

---

### TwoLineElement

Raw TLE data as received from GitHub-hosted file.

```typescript
interface TwoLineElement {
  /** Line 0: Satellite name (optional header line) */
  line0?: string;
  
  /** Line 1: Orbital identification and epoch */
  line1: string;
  
  /** Line 2: Orbital elements */
  line2: string;
}
```

**Validation Rules:**
- `line1`: Must match TLE Line 1 format (69 characters, starts with "1 ")
- `line2`: Must match TLE Line 2 format (69 characters, starts with "2 ")
- Checksum validation on both lines

**Example:**
```
ISS (ZARYA)             
1 25544U 98067A   24053.50900463  .00003075  00000-0  59442-4 0  9992
2 25544  51.6433  59.2583 0008217  16.4489 347.6017 15.51174618173442
```

---

### GeodeticPosition

Geographic coordinates on Earth's surface with altitude.

```typescript
interface GeodeticPosition {
  /** Latitude in decimal degrees (-90 to +90) */
  latitude: number;
  
  /** Longitude in decimal degrees (-180 to +180) */
  longitude: number;
  
  /** Altitude above Earth's surface in kilometers */
  altitude: number;
  
  /** Timestamp when position was calculated */
  timestamp: Date;
}
```

**Validation Rules:**
- `latitude`: -90 ≤ value ≤ 90
- `longitude`: -180 ≤ value ≤ 180
- `altitude`: 100 ≤ value ≤ 50000 (realistic satellite range in km)

---

### VelocityVector

Satellite velocity in Earth-Centered Inertial (ECI) frame.

```typescript
interface VelocityVector {
  /** Velocity component X (km/s) */
  x: number;
  
  /** Velocity component Y (km/s) */
  y: number;
  
  /** Velocity component Z (km/s) */
  z: number;
  
  /** Computed speed magnitude (km/s) */
  speed: number;
}
```

**Derivation:**
```typescript
speed = Math.sqrt(x² + y² + z²)
```

**Typical Ranges:**
- LEO satellites: 7.5 - 8.0 km/s
- MEO satellites: 3.0 - 4.0 km/s
- GEO satellites: ~3.0 km/s

---

### OrbitalElements

Keplerian orbital parameters for display and education.

```typescript
interface OrbitalElements {
  /** Inclination in degrees (0-180) */
  inclination: number;
  
  /** Orbital eccentricity (0 = circular, <1 = elliptical) */
  eccentricity: number;
  
  /** Orbital period in minutes */
  period: number;
  
  /** Semi-major axis in kilometers */
  semiMajorAxis: number;
  
  /** Right ascension of ascending node in degrees */
  raan: number;
  
  /** Argument of perigee in degrees */
  argumentOfPerigee: number;
}
```

**Derivation from satellite.js satrec:**
```typescript
inclination = satrec.inclo * (180 / Math.PI)
eccentricity = satrec.ecco
period = (2 * Math.PI) / satrec.no  // minutes
```

---

### GroundTrack

Orbital path projected onto Earth's surface.

```typescript
interface GroundTrack {
  /** Satellite this track belongs to */
  satelliteId: number;
  
  /** Array of positions forming the track line */
  points: GroundTrackPoint[];
  
  /** Total duration covered by track in minutes */
  durationMinutes: number;
  
  /** Time resolution between points in seconds */
  stepSeconds: number;
}

interface GroundTrackPoint {
  /** Latitude in decimal degrees */
  latitude: number;
  
  /** Longitude in decimal degrees */
  longitude: number;
  
  /** Time offset from track center in seconds */
  timeOffset: number;
  
  /** Whether this point is in the past or future */
  isFuture: boolean;
}
```

**Generation Parameters:**
- Duration: 90 minutes (approximately one LEO orbit)
- Step: 30 seconds (180 points per track)
- Centered on current time (45 min past, 45 min future)

---

### DataStatus

Indicates TLE data freshness and validity.

```typescript
enum DataStatus {
  /** TLE epoch within 7 days - fully valid */
  FRESH = 'fresh',
  
  /** TLE epoch 7-30 days old - show warning indicator */
  STALE = 'stale',
  
  /** TLE epoch >30 days old - excluded from display */
  EXPIRED = 'expired',
  
  /** TLE parsing or propagation error */
  ERROR = 'error'
}
```

---

## Application State

### SatelliteStore

Global state container using Zustand.

```typescript
interface SatelliteStore {
  /** All loaded satellites indexed by NORAD ID */
  satellites: Map<number, Satellite>;
  
  /** Currently selected satellite (if any) */
  selectedSatelliteId: number | null;
  
  /** Category visibility filters */
  filters: CategoryFilters;
  
  /** Ground track for selected satellite */
  selectedGroundTrack: GroundTrack | null;
  
  /** Loading state */
  loadingState: LoadingState;
  
  /** Last TLE fetch timestamp */
  lastFetchTime: Date | null;
  
  /** Error information if fetch failed */
  fetchError: FetchError | null;
}

interface CategoryFilters {
  [SatelliteCategory.STATION]: boolean;
  [SatelliteCategory.NAVIGATION]: boolean;
  [SatelliteCategory.WEATHER]: boolean;
}

interface LoadingState {
  isLoading: boolean;
  progress?: number;
}

interface FetchError {
  message: string;
  timestamp: Date;
  isUsingCache: boolean;
}
```

---

## State Transitions

### Satellite Selection Flow

```
[No Selection] 
    │
    ├── click satellite icon
    ▼
[Satellite Selected]
    │
    ├── compute ground track
    ├── open details panel
    │
    ├── click different satellite → [Satellite Selected] (new satellite)
    ├── click close / click outside → [No Selection]
    └── toggle off satellite's category → [No Selection]
```

### Data Loading Flow

```
[Initial Load]
    │
    ├── show map with loading spinner
    ▼
[Fetching TLE]
    │
    ├── success → [Satellites Visible] (spinner disappears)
    └── failure
        │
        ├── cache exists → [Satellites Visible] + stale indicator
        └── no cache → [Error State] with retry option
```

### Position Update Flow

```
[Satellites Visible]
    │
    └── every 5 seconds
        │
        ├── propagate all visible satellites
        ├── batch update positions on map
        └── if satellite selected: update details panel values
```

---

## Entity Relationships

```
┌─────────────┐       ┌──────────────────┐
│  TLE File   │──────>│    Satellite     │
│  (GitHub)   │  1:N  │                  │
└─────────────┘       └────────┬─────────┘
                               │
                               │ has
                               ▼
              ┌────────────────┴────────────────┐
              │                                 │
              ▼                                 ▼
     ┌─────────────────┐              ┌─────────────────┐
     │ GeodeticPosition │              │ OrbitalElements │
     │ (computed)       │              │ (derived)       │
     └─────────────────┘              └─────────────────┘
              │
              │ when selected
              ▼
     ┌─────────────────┐
     │   GroundTrack   │
     │ (computed path) │
     └─────────────────┘
```

---

## GeoJSON Format for MapLibre

Satellites are rendered as a GeoJSON FeatureCollection:

```typescript
interface SatelliteFeatureCollection {
  type: 'FeatureCollection';
  features: SatelliteFeature[];
}

interface SatelliteFeature {
  type: 'Feature';
  id: number;  // NORAD ID
  geometry: {
    type: 'Point';
    coordinates: [number, number];  // [lng, lat]
  };
  properties: {
    name: string;
    category: SatelliteCategory;
    altitude: number;
    isSelected: boolean;
    dataStatus: DataStatus;
  };
}
```

Ground tracks are rendered as GeoJSON LineString:

```typescript
interface GroundTrackFeature {
  type: 'Feature';
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];  // [[lng, lat], ...]
  };
  properties: {
    satelliteId: number;
    isFuturePath: boolean;
  };
}
```

---

## Constants

```typescript
const POSITION_UPDATE_INTERVAL_MS = 5000;  // 5 seconds
const GROUND_TRACK_DURATION_MIN = 90;       // ~1 orbit for LEO
const GROUND_TRACK_STEP_SEC = 30;           // 30-second resolution
const TLE_STALE_THRESHOLD_DAYS = 7;
const TLE_EXPIRED_THRESHOLD_DAYS = 30;
const MAX_SATELLITES_WITHOUT_CLUSTERING = 200;
const POSITION_ACCURACY_TOLERANCE_KM = 50;
```

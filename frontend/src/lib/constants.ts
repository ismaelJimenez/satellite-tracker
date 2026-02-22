/**
 * Application constants
 */

/** TLE data URL - set via environment variable or use fallback */
export const TLE_URL = process.env.NEXT_PUBLIC_TLE_URL || 
  '/data/satellites.json';

/** Position update interval in milliseconds (5 seconds) */
export const UPDATE_INTERVAL_MS = 5000;

/** Smooth transition duration for satellite icons in milliseconds */
export const TRANSITION_DURATION_MS = 1000;

/** Cache key for TLE data in localStorage */
export const CACHE_KEY = 'satellite-tracker-tle-cache';

/** Cache TTL in milliseconds (1 hour) */
export const CACHE_TTL_MS = 60 * 60 * 1000;

/** Ground track duration before current position (45 minutes) */
export const GROUND_TRACK_PAST_MS = 45 * 60 * 1000;

/** Ground track duration after current position (45 minutes) */
export const GROUND_TRACK_FUTURE_MS = 45 * 60 * 1000;

/** Ground track calculation step (30 seconds) */
export const GROUND_TRACK_STEP_MS = 30 * 1000;

/** Maximum satellites to display */
export const MAX_SATELLITES = 200;

/** Default map view state */
export const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 20,
  zoom: 1.5,
  pitch: 0,
  bearing: 0,
};

/** Satellite icon sizes */
export const ICON_SIZE = {
  default: 32,
  selected: 48,
};

/** Ground track line styling */
export const GROUND_TRACK_STYLE = {
  color: [255, 140, 0, 200] as [number, number, number, number],
  width: 2,
};

/** MapLibre style URL */
export const MAP_STYLE_URL = 'https://demotiles.maplibre.org/style.json';

/** Icon atlas configuration */
export const ICON_ATLAS_URL = '/icons/satellite-atlas.png';
export const ICON_MAPPING_URL = '/icons/satellite-mapping.json';

/** TLE age thresholds in days */
export const TLE_AGE_THRESHOLDS = {
  /** Data is considered stale after this many days */
  stale: 7,
  /** Data is considered expired after this many days */
  expired: 30,
};

/** Performance thresholds */
export const PERFORMANCE = {
  /** Target frame rate */
  targetFps: 60,
  /** Maximum position update latency in milliseconds */
  maxUpdateLatency: 200,
  /** Initial load timeout in milliseconds */
  loadTimeout: 10000,
};

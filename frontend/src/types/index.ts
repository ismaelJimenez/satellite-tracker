/**
 * Core type definitions for the Satellite Tracker application
 */

/** Classification for filtering and visual differentiation */
export enum SatelliteCategory {
  /** Space stations: ISS, Tiangong, etc. */
  STATION = 'station',
  /** GPS/GLONASS/Galileo navigation satellites */
  NAVIGATION = 'navigation',
  /** Weather/meteorological satellites */
  WEATHER = 'weather',
}

/** Raw TLE data as received from GitHub-hosted file */
export interface TwoLineElement {
  /** Line 0: Satellite name (optional header line) */
  line0?: string;
  /** Line 1: Orbital identification and epoch */
  line1: string;
  /** Line 2: Orbital elements */
  line2: string;
}

/** Geographic coordinates on Earth's surface with altitude */
export interface GeodeticPosition {
  /** Latitude in decimal degrees (-90 to +90) */
  latitude: number;
  /** Longitude in decimal degrees (-180 to +180) */
  longitude: number;
  /** Altitude above Earth's surface in kilometers */
  altitude: number;
  /** Timestamp when position was calculated */
  timestamp: Date;
}

/** Satellite velocity in Earth-Centered Inertial (ECI) frame */
export interface VelocityVector {
  /** Velocity component X (km/s) */
  x: number;
  /** Velocity component Y (km/s) */
  y: number;
  /** Velocity component Z (km/s) */
  z: number;
  /** Computed speed magnitude (km/s) */
  speed: number;
}

/** Keplerian orbital parameters for display and education */
export interface OrbitalElements {
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

/** Data freshness indicator */
export enum DataStatus {
  /** TLE data is current (< 7 days old) */
  CURRENT = 'current',
  /** TLE data is stale (7-30 days old) */
  STALE = 'stale',
  /** TLE data is expired (> 30 days old) */
  EXPIRED = 'expired',
}

/** Represents a tracked space object with TLE data and computed position */
export interface Satellite {
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
  /** Precomputed satellite record for SGP4 propagation */
  satrec: unknown;
}

/** Ground track point for orbital path visualization */
export interface GroundTrackPoint {
  /** Longitude in degrees */
  longitude: number;
  /** Latitude in degrees */
  latitude: number;
  /** Timestamp of this point */
  timestamp: Date;
}

/** Ground track for selected satellite */
export interface GroundTrack {
  /** Satellite NORAD ID */
  noradId: number;
  /** Array of track points */
  points: GroundTrackPoint[];
}

/** Category filter state */
export interface CategoryFilters {
  [SatelliteCategory.STATION]: boolean;
  [SatelliteCategory.NAVIGATION]: boolean;
  [SatelliteCategory.WEATHER]: boolean;
}

/** TLE data file metadata */
export interface TLEMetadata {
  /** ISO 8601 timestamp when file was last updated */
  lastUpdated: string;
  /** Data source attribution */
  source: string;
  /** Schema version for forward compatibility */
  version: string;
  /** Total satellite count across all categories */
  totalCount: number;
}

/** Single satellite TLE entry from data file */
export interface SatelliteTLE {
  /** NORAD Catalog Number */
  noradId: number;
  /** Human-readable name */
  name: string;
  /** TLE Line 1 */
  line1: string;
  /** TLE Line 2 */
  line2: string;
}

/** TLE data file structure */
export interface TLEDataFile {
  /** Metadata about the data file */
  meta: TLEMetadata;
  /** Satellite data grouped by category */
  categories: {
    stations: SatelliteTLE[];
    navigation: SatelliteTLE[];
    weather: SatelliteTLE[];
  };
}

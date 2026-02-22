import { SatelliteCategory } from './index';

/** Icon mapping for deck.gl IconLayer */
export interface IconMapping {
  x: number;
  y: number;
  width: number;
  height: number;
  anchorX?: number;
  anchorY?: number;
  mask?: boolean;
}

/** Icon mapping configuration for satellite categories */
export const SATELLITE_ICON_MAPPING: Record<SatelliteCategory, IconMapping> = {
  [SatelliteCategory.STATION]: {
    x: 0,
    y: 0,
    width: 64,
    height: 64,
    anchorX: 32,
    anchorY: 32,
  },
  [SatelliteCategory.NAVIGATION]: {
    x: 64,
    y: 0,
    width: 64,
    height: 64,
    anchorX: 32,
    anchorY: 32,
  },
  [SatelliteCategory.WEATHER]: {
    x: 128,
    y: 0,
    width: 64,
    height: 64,
    anchorX: 32,
    anchorY: 32,
  },
};

/** Color mapping for satellite categories */
export const CATEGORY_COLORS: Record<SatelliteCategory, [number, number, number]> = {
  [SatelliteCategory.STATION]: [66, 133, 244],     // Blue
  [SatelliteCategory.NAVIGATION]: [52, 168, 83],   // Green
  [SatelliteCategory.WEATHER]: [251, 188, 4],      // Orange/Yellow
};

/** Display names for satellite categories */
export const CATEGORY_LABELS: Record<SatelliteCategory, string> = {
  [SatelliteCategory.STATION]: 'Space Stations',
  [SatelliteCategory.NAVIGATION]: 'Navigation',
  [SatelliteCategory.WEATHER]: 'Weather',
};

/** Emoji icons for satellite categories */
export const CATEGORY_ICONS: Record<SatelliteCategory, string> = {
  [SatelliteCategory.STATION]: '🏠',
  [SatelliteCategory.NAVIGATION]: '🧭',
  [SatelliteCategory.WEATHER]: '🌤️',
};

/** Map category string from API to enum */
export function categoryFromString(category: string): SatelliteCategory {
  switch (category.toLowerCase()) {
    case 'stations':
    case 'station':
      return SatelliteCategory.STATION;
    case 'navigation':
      return SatelliteCategory.NAVIGATION;
    case 'weather':
      return SatelliteCategory.WEATHER;
    default:
      return SatelliteCategory.NAVIGATION; // Default fallback
  }
}

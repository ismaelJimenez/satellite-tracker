import { SatelliteCategory } from '@/types';

/**
 * Icon configuration for deck.gl without atlas
 * Uses individual SVG files for each category
 */
export const SATELLITE_ICONS: Record<SatelliteCategory, string> = {
  [SatelliteCategory.STATION]: '/icons/station.svg',
  [SatelliteCategory.NAVIGATION]: '/icons/navigation.svg',
  [SatelliteCategory.WEATHER]: '/icons/weather.svg',
};

/**
 * Get icon URL for a satellite category
 */
export function getIconUrl(category: SatelliteCategory): string {
  return SATELLITE_ICONS[category];
}

/**
 * Icon mapping for deck.gl IconLayer
 * Used when rendering with atlas texture
 */
export const ICON_MAPPING = {
  station: {
    url: '/icons/station.svg',
    width: 64,
    height: 64,
    anchorY: 32,
  },
  navigation: {
    url: '/icons/navigation.svg',
    width: 64,
    height: 64,
    anchorY: 32,
  },
  weather: {
    url: '/icons/weather.svg',
    width: 64,
    height: 64,
    anchorY: 32,
  },
};

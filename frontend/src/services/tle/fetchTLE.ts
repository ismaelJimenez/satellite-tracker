import type { TLEDataFile, SatelliteTLE, SatelliteCategory } from '@/types';
import { TLE_URL, CACHE_KEY, CACHE_TTL_MS } from '@/lib/constants';

/** Cached TLE data structure */
interface CachedTLEData {
  data: TLEDataFile;
  timestamp: number;
}

/**
 * Fetch TLE data from remote URL with local storage cache fallback
 */
export async function fetchTLEData(): Promise<TLEDataFile> {
  // Try cache first
  const cached = getCachedData();
  if (cached && !isCacheExpired(cached.timestamp)) {
    console.log('Using cached TLE data');
    return cached.data;
  }

  try {
    const response = await fetch(TLE_URL, {
      headers: {
        'Accept': 'application/json',
      },
      // Use cache for repeat visits but revalidate
      cache: 'no-cache',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TLEDataFile = await response.json();
    
    // Validate response structure
    if (!data.meta || !data.categories) {
      throw new Error('Invalid TLE data structure');
    }

    // Cache the successful response
    cacheData(data);
    
    return data;
  } catch (error) {
    console.error('Failed to fetch TLE data:', error);
    
    // Fall back to cached data if available (even if expired)
    if (cached) {
      console.warn('Using expired cache as fallback');
      return cached.data;
    }
    
    // Fall back to local sample data
    return getFallbackData();
  }
}

/**
 * Get all satellites from TLE data file as flat array with category
 */
export function flattenTLEData(data: TLEDataFile): Array<SatelliteTLE & { category: SatelliteCategory }> {
  const result: Array<SatelliteTLE & { category: SatelliteCategory }> = [];
  
  if (data.categories.stations) {
    for (const sat of data.categories.stations) {
      result.push({ ...sat, category: 'station' as SatelliteCategory });
    }
  }
  
  if (data.categories.navigation) {
    for (const sat of data.categories.navigation) {
      result.push({ ...sat, category: 'navigation' as SatelliteCategory });
    }
  }
  
  if (data.categories.weather) {
    for (const sat of data.categories.weather) {
      result.push({ ...sat, category: 'weather' as SatelliteCategory });
    }
  }
  
  return result;
}

/**
 * Get cached data from localStorage
 */
function getCachedData(): CachedTLEData | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) {
      return null;
    }
    return JSON.parse(cached) as CachedTLEData;
  } catch {
    return null;
  }
}

/**
 * Cache data to localStorage
 */
function cacheData(data: TLEDataFile): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    const cacheEntry: CachedTLEData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheEntry));
  } catch (error) {
    console.warn('Failed to cache TLE data:', error);
  }
}

/**
 * Check if cache has expired
 */
function isCacheExpired(timestamp: number): boolean {
  return Date.now() - timestamp > CACHE_TTL_MS;
}

/**
 * Get fallback sample data for development/offline mode
 */
function getFallbackData(): TLEDataFile {
  return {
    meta: {
      lastUpdated: new Date().toISOString(),
      source: 'Sample Data',
      version: '1.0.0',
      totalCount: 3,
    },
    categories: {
      stations: [
        {
          noradId: 25544,
          name: 'ISS (ZARYA)',
          line1: '1 25544U 98067A   24053.50900463  .00003075  00000-0  59442-4 0  9992',
          line2: '2 25544  51.6433  59.2583 0008217  16.4489 347.6017 15.51174618173442',
        },
      ],
      navigation: [
        {
          noradId: 28874,
          name: 'GPS BIIR-2',
          line1: '1 28874U 05038A   24053.18592765 -.00000020  00000-0  00000-0 0  9996',
          line2: '2 28874  55.1247 237.2584 0104234 247.5032 111.4573  2.00569934135467',
        },
      ],
      weather: [
        {
          noradId: 43226,
          name: 'GOES 17',
          line1: '1 43226U 18022A   24053.87506944  .00000091  00000-0  00000-0 0  9995',
          line2: '2 43226   0.0146 271.2658 0001116 139.7856 316.2395  1.00273358 21775',
        },
      ],
    },
  };
}

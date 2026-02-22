import { describe, it, expect } from 'vitest';
import type { TLEDataFile } from '../../src/types';

describe('flattenTLEData', () => {
  it('flattens TLE data into satellite list with categories', async () => {
    const { flattenTLEData } = await import('../../src/services/tle/fetchTLE');

    const tleData: TLEDataFile = {
      metadata: {
        lastUpdated: new Date().toISOString(),
        source: 'Test',
      },
      categories: {
        stations: [
          {
            noradId: 25544,
            name: 'ISS',
            tle: {
              line1: '1 25544U 98067A   26053.50900463  .00003075  00000-0  59442-4 0  9992',
              line2: '2 25544  51.6433  59.2583 0008217  16.4489 347.6017 15.51174618173442',
            },
          },
        ],
        navigation: [
          {
            noradId: 28874,
            name: 'GPS BIIF-1',
            tle: {
              line1: '1 28874U 05038A   26054.47895833 -.00000007  00000-0  00000+0 0  9998',
              line2: '2 28874  55.0467 124.8621 0107153 249.2377 109.6997  2.00556587150887',
            },
          },
        ],
        weather: [
          {
            noradId: 28654,
            name: 'NOAA 18',
            tle: {
              line1: '1 28654U 05018A   26053.90625000  .00000135  00000-0  93166-4 0  9995',
              line2: '2 28654  98.8823 114.8594 0014157 102.5426 257.7309 14.12913689  6879',
            },
          },
        ],
      },
    };

    const result = flattenTLEData(tleData);

    expect(result.length).toBe(3);
    expect(result.find(s => s.noradId === 25544)?.category).toBe('station');
    expect(result.find(s => s.noradId === 28874)?.category).toBe('navigation');
    expect(result.find(s => s.noradId === 28654)?.category).toBe('weather');
  });

  it('handles empty categories', async () => {
    const { flattenTLEData } = await import('../../src/services/tle/fetchTLE');

    const tleData: TLEDataFile = {
      metadata: {
        lastUpdated: new Date().toISOString(),
        source: 'Test',
      },
      categories: {},
    };

    const result = flattenTLEData(tleData);
    expect(result.length).toBe(0);
  });

  it('handles partial categories', async () => {
    const { flattenTLEData } = await import('../../src/services/tle/fetchTLE');

    const tleData: TLEDataFile = {
      metadata: {
        lastUpdated: new Date().toISOString(),
        source: 'Test',
      },
      categories: {
        stations: [
          {
            noradId: 25544,
            name: 'ISS',
            tle: { line1: 'line1', line2: 'line2' },
          },
        ],
        // navigation and weather are missing
      },
    };

    const result = flattenTLEData(tleData);
    expect(result.length).toBe(1);
    expect(result[0].category).toBe('station');
  });
});

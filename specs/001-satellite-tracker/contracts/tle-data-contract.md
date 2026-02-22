# TLE Data Contract

**Version**: 1.0.0  
**Type**: Static File (GitHub-hosted)  
**Consumer**: Satellite Tracker Web App

## Overview

This contract defines the format of the TLE (Two-Line Element) data file that the satellite tracker application fetches from GitHub. The file is populated by a backoffice process and served as a static asset.

---

## Endpoint

```
GET https://raw.githubusercontent.com/{owner}/{repo}/main/data/satellites.json
```

**Content-Type**: `application/json`  
**Cache**: CDN-cached, refresh controlled by backoffice process

---

## Response Schema

```typescript
interface TLEDataFile {
  /** Metadata about the data file */
  meta: TLEMetadata;
  
  /** Satellite data grouped by category */
  categories: {
    stations: SatelliteTLE[];
    navigation: SatelliteTLE[];
    weather: SatelliteTLE[];
  };
}

interface TLEMetadata {
  /** ISO 8601 timestamp when file was last updated */
  lastUpdated: string;
  
  /** Data source attribution */
  source: string;
  
  /** Schema version for forward compatibility */
  version: string;
  
  /** Total satellite count across all categories */
  totalCount: number;
}

interface SatelliteTLE {
  /** NORAD Catalog Number */
  noradId: number;
  
  /** Human-readable name */
  name: string;
  
  /** TLE Line 1 */
  line1: string;
  
  /** TLE Line 2 */
  line2: string;
}
```

---

## Example Response

```json
{
  "meta": {
    "lastUpdated": "2026-02-22T06:00:00Z",
    "source": "CelesTrak",
    "version": "1.0.0",
    "totalCount": 150
  },
  "categories": {
    "stations": [
      {
        "noradId": 25544,
        "name": "ISS (ZARYA)",
        "line1": "1 25544U 98067A   26053.50900463  .00003075  00000-0  59442-4 0  9992",
        "line2": "2 25544  51.6433  59.2583 0008217  16.4489 347.6017 15.51174618173442"
      },
      {
        "noradId": 48274,
        "name": "TIANGONG",
        "line1": "1 48274U 21035A   26053.44352655  .00015842  00000-0  18621-3 0  9995",
        "line2": "2 48274  41.4718 356.0295 0005947 292.5621 198.6894 15.62059878153456"
      }
    ],
    "navigation": [
      {
        "noradId": 28874,
        "name": "GPS BIIR-2",
        "line1": "1 28874U 05038A   26053.18592765 -.00000020  00000-0  00000-0 0  9996",
        "line2": "2 28874  55.1247 237.2584 0104234 247.5032 111.4573  2.00569934135467"
      }
    ],
    "weather": [
      {
        "noradId": 43226,
        "name": "GOES-17",
        "line1": "1 43226U 18022A   26053.10478732 -.00000257  00000-0  00000-0 0  9994",
        "line2": "2 43226   0.0414  67.6158 0000849 315.1647 178.5432  1.00270816 21587"
      }
    ]
  }
}
```

---

## Validation Rules

### TLE Line 1 Format (69 characters)
```
Column  Content
01      Line Number (1)
03-07   Satellite Number (NORAD ID)
08      Classification (U = Unclassified)
10-11   International Designator (Year)
12-14   International Designator (Launch Number)
15-17   International Designator (Piece)
19-20   Epoch Year (2-digit)
21-32   Epoch Day (day of year + fraction)
34-43   First Derivative of Mean Motion
45-52   Second Derivative of Mean Motion
54-61   BSTAR Drag Term
63      Ephemeris Type
65-68   Element Set Number
69      Checksum
```

### TLE Line 2 Format (69 characters)
```
Column  Content
01      Line Number (2)
03-07   Satellite Number (NORAD ID)
09-16   Inclination (degrees)
18-25   Right Ascension of Ascending Node (degrees)
27-33   Eccentricity (decimal assumed)
35-42   Argument of Perigee (degrees)
44-51   Mean Anomaly (degrees)
53-63   Mean Motion (revolutions/day)
64-68   Revolution Number at Epoch
69      Checksum
```

---

## Error Handling

### HTTP Status Codes

| Status | Meaning | Client Action |
|--------|---------|---------------|
| 200 | Success | Parse and display satellites |
| 304 | Not Modified | Use cached data |
| 404 | File not found | Show error, no cache fallback |
| 5xx | Server error | Use cached data if available |

### Client Behavior

```typescript
// Fetch with cache fallback
async function fetchTLEData(): Promise<TLEDataFile> {
  try {
    const response = await fetch(TLE_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    localStorage.setItem('tle_cache', JSON.stringify(data));
    return data;
  } catch (error) {
    const cached = localStorage.getItem('tle_cache');
    if (cached) {
      return { ...JSON.parse(cached), isStale: true };
    }
    throw error;
  }
}
```

---

## Versioning

The `meta.version` field follows semantic versioning:

| Change Type | Version Bump | Example |
|-------------|--------------|---------|
| New field added | MINOR | Adding `launchDate` to SatelliteTLE |
| Field removed | MAJOR | Removing `name` field |
| Format change | MAJOR | Changing `noradId` from number to string |
| Documentation fix | PATCH | Clarifying description |

Clients SHOULD check version and warn on MAJOR version mismatch.

---

## Rate Limiting

- GitHub raw content has no explicit rate limit for public repos
- Recommend client-side fetch interval: once per app load
- TLE data freshness is hours/days, not seconds
- Position updates use cached TLE with SGP4 propagation

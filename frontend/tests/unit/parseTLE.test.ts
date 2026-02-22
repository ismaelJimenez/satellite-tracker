import { describe, it, expect } from 'vitest';
import * as satellite from 'satellite.js';
import {
  parseTLE,
  extractEpoch,
  extractOrbitalElements,
  determineDataStatus,
  validateTLELine,
  calculateChecksum,
  createTwoLineElement,
} from '../../src/services/tle/parseTLE';

describe('parseTLE', () => {
  const ISS_TLE = {
    line1: '1 25544U 98067A   26053.50900463  .00003075  00000-0  59442-4 0  9992',
    line2: '2 25544  51.6433  59.2583 0008217  16.4489 347.6017 15.51174618173442',
  };

  it('parses valid ISS TLE', () => {
    const satrec = parseTLE(ISS_TLE.line1, ISS_TLE.line2);

    expect(satrec).not.toBeNull();
    expect(satrec!.error).toBe(0);
    // Valid TLE should have non-NaN values
    expect(Number.isNaN(satrec!.no)).toBe(false);
  });

  it('returns satrec with NaN values for malformed TLE', () => {
    // satellite.js returns a satrec even for invalid TLE, but with NaN values
    const satrec = parseTLE('invalid line 1', 'invalid line 2');

    // The library may return non-null with error=0 but NaN values
    if (satrec) {
      expect(Number.isNaN(satrec.no)).toBe(true);
    }
  });
});

describe('extractEpoch', () => {
  it('extracts epoch from satellite record', () => {
    const satrec = satellite.twoline2satrec(
      '1 25544U 98067A   26053.50900463  .00003075  00000-0  59442-4 0  9992',
      '2 25544  51.6433  59.2583 0008217  16.4489 347.6017 15.51174618173442'
    );

    const epoch = extractEpoch(satrec);

    expect(epoch).toBeInstanceOf(Date);
    // Epoch should be in 2026 based on TLE
    expect(epoch.getFullYear()).toBe(2026);
  });
});

describe('extractOrbitalElements', () => {
  it('extracts orbital elements from ISS satrec', () => {
    const satrec = satellite.twoline2satrec(
      '1 25544U 98067A   26053.50900463  .00003075  00000-0  59442-4 0  9992',
      '2 25544  51.6433  59.2583 0008217  16.4489 347.6017 15.51174618173442'
    );

    const elements = extractOrbitalElements(satrec);

    // ISS inclination is ~51.6°
    expect(elements.inclination).toBeGreaterThan(50);
    expect(elements.inclination).toBeLessThan(53);

    // ISS eccentricity is nearly circular
    expect(elements.eccentricity).toBeLessThan(0.01);

    // Period should be ~93 minutes
    expect(elements.period).toBeGreaterThan(85);
    expect(elements.period).toBeLessThan(100);

    // Semi-major axis should be ~6700-6800 km (Earth radius + altitude)
    expect(elements.semiMajorAxis).toBeGreaterThan(6500);
    expect(elements.semiMajorAxis).toBeLessThan(7000);
  });
});

describe('determineDataStatus', () => {
  it('returns current for recent epoch', () => {
    const recentEpoch = new Date();
    recentEpoch.setDate(recentEpoch.getDate() - 3); // 3 days ago

    const status = determineDataStatus(recentEpoch);

    expect(status).toBe('current');
  });

  it('returns stale for week-old epoch', () => {
    const staleEpoch = new Date();
    staleEpoch.setDate(staleEpoch.getDate() - 14); // 14 days ago

    const status = determineDataStatus(staleEpoch);

    expect(status).toBe('stale');
  });

  it('returns expired for month-old epoch', () => {
    const expiredEpoch = new Date();
    expiredEpoch.setDate(expiredEpoch.getDate() - 45); // 45 days ago

    const status = determineDataStatus(expiredEpoch);

    expect(status).toBe('expired');
  });
});

describe('calculateChecksum', () => {
  it('calculates correct checksum for TLE line', () => {
    // The checksum is the last digit of the sum of all digits + 1 for each minus sign
    // Line without checksum digit
    const line = '1 25544U 98067A   26053.50900463  .00003075  00000-0  59442-4 0  999';
    const checksum = calculateChecksum(line);

    // Calculated checksum is 6 (166 % 10 = 6)
    expect(checksum).toBe(6);
  });
});

describe('validateTLELine', () => {
  // Use TLE with matching checksums
  const VALID_LINE1 = '1 25544U 98067A   24001.50000000  .00007000  00000-0  12000-3 0  9999';
  const VALID_LINE2 = '2 25544  51.6400 200.0000 0007000 100.0000 260.0000 15.50000000000003';

  it('returns true for valid line 1', () => {
    // Build a line where checksum is correct
    const line = '1 25544U 98067A   24001.50000000  .00007000  00000-0  12000-3 0  999';
    // Calculate checksum
    let sum = 0;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c >= '0' && c <= '9') sum += parseInt(c);
      else if (c === '-') sum += 1;
    }
    const checksum = sum % 10;
    const validLine = line + checksum.toString();
    
    expect(validLine.length).toBe(69);
    const result = validateTLELine(validLine, 1);
    expect(result).toBe(true);
  });

  it('returns true for valid line 2', () => {
    const line = '2 25544  51.6400 200.0000 0007000 100.0000 260.0000 15.5000000000000';
    let sum = 0;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c >= '0' && c <= '9') sum += parseInt(c);
      else if (c === '-') sum += 1;
    }
    const checksum = sum % 10;
    const validLine = line + checksum.toString();
    
    expect(validLine.length).toBe(69);
    const result = validateTLELine(validLine, 2);
    expect(result).toBe(true);
  });

  it('returns false for wrong length', () => {
    const shortLine = '1 25544U 98067A   26053.50900463';
    const result = validateTLELine(shortLine, 1);
    expect(result).toBe(false);
  });

  it('returns false for wrong line number prefix', () => {
    // Build a valid line 2 but check as line 1
    const line = '2 25544  51.6400 200.0000 0007000 100.0000 260.0000 15.5000000000000';
    let sum = 0;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c >= '0' && c <= '9') sum += parseInt(c);
      else if (c === '-') sum += 1;
    }
    const validLine = line + (sum % 10).toString();
    
    const result = validateTLELine(validLine, 1);
    expect(result).toBe(false);
  });

  it('returns false for invalid checksum', () => {
    // Build a line with wrong checksum
    const line = '1 25544U 98067A   24001.50000000  .00007000  00000-0  12000-3 0  999';
    let sum = 0;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c >= '0' && c <= '9') sum += parseInt(c);
      else if (c === '-') sum += 1;
    }
    const wrongChecksum = ((sum % 10) + 1) % 10; // Off by one
    const invalidLine = line + wrongChecksum.toString();
    
    const result = validateTLELine(invalidLine, 1);
    expect(result).toBe(false);
  });
});

describe('createTwoLineElement', () => {
  it('creates TwoLineElement object', () => {
    const tle = createTwoLineElement(
      'ISS (ZARYA)',
      '1 25544U 98067A   26053.50900463  .00003075  00000-0  59442-4 0  9992',
      '2 25544  51.6433  59.2583 0008217  16.4489 347.6017 15.51174618173442'
    );

    expect(tle.line0).toBe('ISS (ZARYA)');
    expect(tle.line1).toContain('25544');
    expect(tle.line2).toContain('51.6433');
  });
});

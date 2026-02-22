import { describe, it, expect } from 'vitest';
import * as satellite from 'satellite.js';
import { propagateSatellite, propagateTrack, isValidSatrec, getOrbitalPeriod } from '../../src/services/propagator/propagate';

describe('propagateSatellite', () => {
  const ISS_TLE = {
    line1: '1 25544U 98067A   26053.50900463  .00003075  00000-0  59442-4 0  9992',
    line2: '2 25544  51.6433  59.2583 0008217  16.4489 347.6017 15.51174618173442',
  };

  const satrec = satellite.twoline2satrec(ISS_TLE.line1, ISS_TLE.line2);

  it('returns valid position for ISS TLE', () => {
    const result = propagateSatellite(satrec, new Date('2026-02-22T12:00:00Z'));

    expect(result).not.toBeNull();
    expect(result!.position.latitude).toBeGreaterThanOrEqual(-90);
    expect(result!.position.latitude).toBeLessThanOrEqual(90);
    expect(result!.position.longitude).toBeGreaterThanOrEqual(-180);
    expect(result!.position.longitude).toBeLessThanOrEqual(180);
  });

  it('returns altitude within expected ISS range', () => {
    const result = propagateSatellite(satrec, new Date('2026-02-22T12:00:00Z'));

    expect(result).not.toBeNull();
    // ISS orbits at ~400-420 km altitude
    expect(result!.position.altitude).toBeGreaterThan(300);
    expect(result!.position.altitude).toBeLessThan(500);
  });

  it('returns velocity within expected ISS range', () => {
    const result = propagateSatellite(satrec, new Date('2026-02-22T12:00:00Z'));

    expect(result).not.toBeNull();
    // ISS moves at ~7.66 km/s
    expect(result!.velocity.speed).toBeGreaterThan(7);
    expect(result!.velocity.speed).toBeLessThan(8.5);
  });

  it('includes timestamp in position', () => {
    const testTime = new Date('2026-02-22T12:00:00Z');
    const result = propagateSatellite(satrec, testTime);

    expect(result).not.toBeNull();
    expect(result!.position.timestamp).toEqual(testTime);
  });
});

describe('propagateTrack', () => {
  const ISS_TLE = {
    line1: '1 25544U 98067A   26053.50900463  .00003075  00000-0  59442-4 0  9992',
    line2: '2 25544  51.6433  59.2583 0008217  16.4489 347.6017 15.51174618173442',
  };

  const satrec = satellite.twoline2satrec(ISS_TLE.line1, ISS_TLE.line2);

  it('generates track with correct number of points', () => {
    const startTime = new Date('2026-02-22T12:00:00Z');
    const endTime = new Date('2026-02-22T12:10:00Z'); // 10 minutes
    const stepMs = 60000; // 1 minute

    const track = propagateTrack(satrec, startTime, endTime, stepMs);

    // Should have 11 points (0, 1, 2, ..., 10 minutes)
    expect(track.length).toBe(11);
  });

  it('generates continuous path without gaps', () => {
    const startTime = new Date('2026-02-22T12:00:00Z');
    const endTime = new Date('2026-02-22T12:05:00Z');
    const stepMs = 30000;

    const track = propagateTrack(satrec, startTime, endTime, stepMs);

    expect(track.length).toBeGreaterThan(0);
    track.forEach((pos) => {
      expect(pos.latitude).toBeDefined();
      expect(pos.longitude).toBeDefined();
      expect(pos.altitude).toBeDefined();
    });
  });
});

describe('isValidSatrec', () => {
  it('returns true for valid TLE', () => {
    const satrec = satellite.twoline2satrec(
      '1 25544U 98067A   26053.50900463  .00003075  00000-0  59442-4 0  9992',
      '2 25544  51.6433  59.2583 0008217  16.4489 347.6017 15.51174618173442'
    );

    expect(isValidSatrec(satrec)).toBe(true);
  });
});

describe('getOrbitalPeriod', () => {
  it('returns period close to 90 minutes for ISS', () => {
    const satrec = satellite.twoline2satrec(
      '1 25544U 98067A   26053.50900463  .00003075  00000-0  59442-4 0  9992',
      '2 25544  51.6433  59.2583 0008217  16.4489 347.6017 15.51174618173442'
    );

    const period = getOrbitalPeriod(satrec);

    // ISS has ~93 minute orbital period
    expect(period).toBeGreaterThan(85);
    expect(period).toBeLessThan(100);
  });
});

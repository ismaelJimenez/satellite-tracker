import { describe, it, expect } from 'vitest';
import * as satellite from 'satellite.js';
import { calculateGroundTrack, getOrbitalPeriodMinutes } from '../../src/services/propagator/groundTrack';
import type { Satellite } from '../../src/types';
import { SatelliteCategory, DataStatus } from '../../src/types';

describe('calculateGroundTrack', () => {
  const createMockSatellite = (): Satellite => {
    const satrec = satellite.twoline2satrec(
      '1 25544U 98067A   26053.50900463  .00003075  00000-0  59442-4 0  9992',
      '2 25544  51.6433  59.2583 0008217  16.4489 347.6017 15.51174618173442'
    );

    return {
      noradId: 25544,
      name: 'ISS (ZARYA)',
      category: SatelliteCategory.STATION,
      tle: {
        line0: 'ISS (ZARYA)',
        line1: '1 25544U 98067A   26053.50900463  .00003075  00000-0  59442-4 0  9992',
        line2: '2 25544  51.6433  59.2583 0008217  16.4489 347.6017 15.51174618173442',
      },
      epoch: new Date('2026-02-22T12:00:00Z'),
      position: {
        latitude: 0,
        longitude: 0,
        altitude: 420,
        timestamp: new Date(),
      },
      velocity: {
        x: 0,
        y: 0,
        z: 0,
        speed: 7.66,
      },
      orbitalElements: {
        inclination: 51.64,
        eccentricity: 0.0008,
        period: 92.87,
        semiMajorAxis: 6794,
        raan: 59.26,
        argumentOfPerigee: 16.45,
      },
      dataStatus: DataStatus.CURRENT,
      satrec,
    };
  };

  it('generates ground track with multiple points', () => {
    const sat = createMockSatellite();
    const track = calculateGroundTrack(sat, new Date('2026-02-22T12:00:00Z'));

    expect(track).not.toBeNull();
    expect(track!.noradId).toBe(25544);
    expect(track!.points.length).toBeGreaterThan(100); // 90 min at 30 sec resolution
  });

  it('includes past and future positions', () => {
    const sat = createMockSatellite();
    const centerTime = new Date('2026-02-22T12:00:00Z');
    const track = calculateGroundTrack(sat, centerTime);

    expect(track).not.toBeNull();
    
    // First point should be ~45 minutes before center
    const firstPoint = track!.points[0];
    if (!isNaN(firstPoint.longitude)) {
      expect(firstPoint.timestamp.getTime()).toBeLessThan(centerTime.getTime());
    }

    // Last point should be ~45 minutes after center
    const lastPoint = track!.points[track!.points.length - 1];
    if (!isNaN(lastPoint.longitude)) {
      expect(lastPoint.timestamp.getTime()).toBeGreaterThan(centerTime.getTime());
    }
  });

  it('returns null for satellite without satrec', () => {
    const sat = createMockSatellite();
    sat.satrec = null;

    const track = calculateGroundTrack(sat);

    expect(track).toBeNull();
  });
});

describe('getOrbitalPeriodMinutes', () => {
  it('returns ~93 minutes for ISS', () => {
    const satrec = satellite.twoline2satrec(
      '1 25544U 98067A   26053.50900463  .00003075  00000-0  59442-4 0  9992',
      '2 25544  51.6433  59.2583 0008217  16.4489 347.6017 15.51174618173442'
    );

    const sat: Satellite = {
      noradId: 25544,
      name: 'ISS',
      category: SatelliteCategory.STATION,
      tle: { line1: '', line2: '' },
      epoch: new Date(),
      position: { latitude: 0, longitude: 0, altitude: 0, timestamp: new Date() },
      velocity: { x: 0, y: 0, z: 0, speed: 0 },
      orbitalElements: {
        inclination: 0,
        eccentricity: 0,
        period: 0,
        semiMajorAxis: 0,
        raan: 0,
        argumentOfPerigee: 0,
      },
      dataStatus: DataStatus.CURRENT,
      satrec,
    };

    const period = getOrbitalPeriodMinutes(sat);

    expect(period).toBeGreaterThan(85);
    expect(period).toBeLessThan(100);
  });

  it('returns 0 for satellite without satrec', () => {
    const sat: Satellite = {
      noradId: 12345,
      name: 'Test',
      category: SatelliteCategory.NAVIGATION,
      tle: { line1: '', line2: '' },
      epoch: new Date(),
      position: { latitude: 0, longitude: 0, altitude: 0, timestamp: new Date() },
      velocity: { x: 0, y: 0, z: 0, speed: 0 },
      orbitalElements: {
        inclination: 0,
        eccentricity: 0,
        period: 0,
        semiMajorAxis: 0,
        raan: 0,
        argumentOfPerigee: 0,
      },
      dataStatus: DataStatus.CURRENT,
      satrec: null,
    };

    const period = getOrbitalPeriodMinutes(sat);

    expect(period).toBe(0);
  });
});

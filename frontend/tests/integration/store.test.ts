import { describe, it, expect, beforeEach } from 'vitest';
import { useSatelliteStore, useSelectedSatellite, useVisibleSatellites } from '../../src/features/satellites/store';
import type { Satellite } from '../../src/types';
import { SatelliteCategory, DataStatus } from '../../src/types';

describe('SatelliteStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useSatelliteStore.getState().clear();
  });

  const createMockSatellite = (id: number, category: SatelliteCategory): Satellite => ({
    noradId: id,
    name: `Satellite ${id}`,
    category,
    tle: { line1: '', line2: '' },
    epoch: new Date(),
    position: { latitude: 0, longitude: 0, altitude: 400, timestamp: new Date() },
    velocity: { x: 0, y: 0, z: 0, speed: 7.66 },
    orbitalElements: {
      inclination: 51,
      eccentricity: 0.001,
      period: 93,
      semiMajorAxis: 6800,
      raan: 0,
      argumentOfPerigee: 0,
    },
    dataStatus: DataStatus.CURRENT,
    satrec: null,
  });

  describe('setSatellites', () => {
    it('sets satellites and clears loading state', () => {
      const satellites = [
        createMockSatellite(1, SatelliteCategory.STATION),
        createMockSatellite(2, SatelliteCategory.NAVIGATION),
      ];

      useSatelliteStore.getState().setSatellites(satellites);

      const state = useSatelliteStore.getState();
      expect(state.satellites.size).toBe(2);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('stores satellites by noradId', () => {
      const satellites = [createMockSatellite(25544, SatelliteCategory.STATION)];

      useSatelliteStore.getState().setSatellites(satellites);

      const sat = useSatelliteStore.getState().satellites.get(25544);
      expect(sat).toBeDefined();
      expect(sat!.name).toBe('Satellite 25544');
    });
  });

  describe('updatePositions', () => {
    it('updates positions for existing satellites', () => {
      const satellites = [createMockSatellite(1, SatelliteCategory.STATION)];
      useSatelliteStore.getState().setSatellites(satellites);

      const newPosition = {
        latitude: 45,
        longitude: 90,
        altitude: 420,
        timestamp: new Date(),
      };

      useSatelliteStore.getState().updatePositions([
        {
          noradId: 1,
          position: newPosition,
          velocity: { x: 1, y: 2, z: 3, speed: 7.7 },
        },
      ]);

      const sat = useSatelliteStore.getState().satellites.get(1);
      expect(sat!.position.latitude).toBe(45);
      expect(sat!.position.longitude).toBe(90);
    });

    it('ignores updates for non-existent satellites', () => {
      const satellites = [createMockSatellite(1, SatelliteCategory.STATION)];
      useSatelliteStore.getState().setSatellites(satellites);

      useSatelliteStore.getState().updatePositions([
        {
          noradId: 999,
          position: { latitude: 0, longitude: 0, altitude: 0, timestamp: new Date() },
          velocity: { x: 0, y: 0, z: 0, speed: 0 },
        },
      ]);

      expect(useSatelliteStore.getState().satellites.size).toBe(1);
    });
  });

  describe('selectSatellite', () => {
    it('sets selectedId', () => {
      useSatelliteStore.getState().selectSatellite(25544);

      expect(useSatelliteStore.getState().selectedId).toBe(25544);
    });

    it('clears selectedId when null', () => {
      useSatelliteStore.getState().selectSatellite(25544);
      useSatelliteStore.getState().selectSatellite(null);

      expect(useSatelliteStore.getState().selectedId).toBeNull();
    });

    it('clears ground track when selection changes', () => {
      useSatelliteStore.getState().setGroundTrack({
        noradId: 1,
        points: [],
      });

      useSatelliteStore.getState().selectSatellite(2);

      expect(useSatelliteStore.getState().groundTrack).toBeNull();
    });
  });

  describe('toggleFilter', () => {
    it('toggles category filter', () => {
      expect(useSatelliteStore.getState().filters.station).toBe(true);

      useSatelliteStore.getState().toggleFilter(SatelliteCategory.STATION);

      expect(useSatelliteStore.getState().filters.station).toBe(false);

      useSatelliteStore.getState().toggleFilter(SatelliteCategory.STATION);

      expect(useSatelliteStore.getState().filters.station).toBe(true);
    });

    it('deselects satellite when its category is hidden', () => {
      const satellites = [createMockSatellite(1, SatelliteCategory.STATION)];
      useSatelliteStore.getState().setSatellites(satellites);
      useSatelliteStore.getState().selectSatellite(1);

      useSatelliteStore.getState().toggleFilter(SatelliteCategory.STATION);

      expect(useSatelliteStore.getState().selectedId).toBeNull();
    });
  });

  describe('setError', () => {
    it('sets error and clears loading', () => {
      useSatelliteStore.getState().setLoading(true);
      useSatelliteStore.getState().setError('Network error');

      const state = useSatelliteStore.getState();
      expect(state.error).toBe('Network error');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('clear', () => {
    it('resets store to initial state', () => {
      const satellites = [createMockSatellite(1, SatelliteCategory.STATION)];
      useSatelliteStore.getState().setSatellites(satellites);
      useSatelliteStore.getState().selectSatellite(1);
      useSatelliteStore.getState().toggleFilter(SatelliteCategory.NAVIGATION);

      useSatelliteStore.getState().clear();

      const state = useSatelliteStore.getState();
      expect(state.satellites.size).toBe(0);
      expect(state.selectedId).toBeNull();
      expect(state.filters.navigation).toBe(true);
      expect(state.isLoading).toBe(true);
    });
  });

  describe('setGroundTrack', () => {
    it('sets ground track', () => {
      const track = {
        noradId: 25544,
        points: [
          { latitude: 0, longitude: 0, timestamp: new Date() },
          { latitude: 10, longitude: 10, timestamp: new Date() },
        ],
      };

      useSatelliteStore.getState().setGroundTrack(track);

      expect(useSatelliteStore.getState().groundTrack).toBe(track);
    });

    it('clears ground track with null', () => {
      useSatelliteStore.getState().setGroundTrack({
        noradId: 1,
        points: [],
      });

      useSatelliteStore.getState().setGroundTrack(null);

      expect(useSatelliteStore.getState().groundTrack).toBeNull();
    });
  });

  describe('setLoading', () => {
    it('sets loading state', () => {
      useSatelliteStore.getState().setLoading(false);
      expect(useSatelliteStore.getState().isLoading).toBe(false);

      useSatelliteStore.getState().setLoading(true);
      expect(useSatelliteStore.getState().isLoading).toBe(true);
    });
  });
});

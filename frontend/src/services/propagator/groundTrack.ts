import * as satellite from 'satellite.js';
import { propagateTrack } from './propagate';
import type { GroundTrack, GroundTrackPoint, Satellite } from '@/types';
import { GROUND_TRACK_PAST_MS, GROUND_TRACK_FUTURE_MS, GROUND_TRACK_STEP_MS } from '@/lib/constants';

/**
 * Calculate ground track for a satellite
 * @param sat - Satellite to calculate track for
 * @param centerTime - Center time for the track (default: now)
 * @returns Ground track with past and future positions
 */
export function calculateGroundTrack(
  sat: Satellite,
  centerTime: Date = new Date()
): GroundTrack | null {
  const satrec = sat.satrec as satellite.SatRec;
  if (!satrec) return null;

  const startTime = new Date(centerTime.getTime() - GROUND_TRACK_PAST_MS);
  const endTime = new Date(centerTime.getTime() + GROUND_TRACK_FUTURE_MS);

  const positions = propagateTrack(satrec, startTime, endTime, GROUND_TRACK_STEP_MS);

  if (positions.length === 0) return null;

  const points: GroundTrackPoint[] = positions.map((pos) => ({
    longitude: pos.longitude,
    latitude: pos.latitude,
    timestamp: pos.timestamp,
  }));

  // Split path into segments at antimeridian crossings
  const segments = splitAtAntimeridian(points);

  return {
    noradId: sat.noradId,
    segments,
  };
}

/**
 * Split a path into segments at antimeridian crossings (±180° longitude).
 * Each segment is a continuous array of points that doesn't cross the boundary.
 */
function splitAtAntimeridian(points: GroundTrackPoint[]): GroundTrackPoint[][] {
  if (points.length === 0) return [];

  const segments: GroundTrackPoint[][] = [];
  let current: GroundTrackPoint[] = [points[0]];

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const pt = points[i];
    const lonDiff = Math.abs(pt.longitude - prev.longitude);

    if (lonDiff > 180) {
      // Antimeridian crossing — start a new segment
      segments.push(current);
      current = [pt];
    } else {
      current.push(pt);
    }
  }

  if (current.length > 0) {
    segments.push(current);
  }

  return segments;
}

/**
 * Get orbital period for display
 */
export function getOrbitalPeriodMinutes(sat: Satellite): number {
  const satrec = sat.satrec as satellite.SatRec;
  if (!satrec) return 0;

  // Mean motion is in radians per minute
  const meanMotion = satrec.no;
  return (2 * Math.PI) / meanMotion;
}

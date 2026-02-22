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

  // Handle antimeridian crossing - split paths that cross ±180°
  const splitPoints = handleAntimeridianCrossing(points);

  return {
    noradId: sat.noradId,
    points: splitPoints,
  };
}

/**
 * Handle paths that cross the antimeridian (±180° longitude)
 * Insert NaN to break the path at crossing points
 */
function handleAntimeridianCrossing(points: GroundTrackPoint[]): GroundTrackPoint[] {
  if (points.length < 2) return points;

  const result: GroundTrackPoint[] = [];
  
  for (let i = 0; i < points.length; i++) {
    const current = points[i];
    result.push(current);

    if (i < points.length - 1) {
      const next = points[i + 1];
      const lonDiff = Math.abs(next.longitude - current.longitude);
      
      // If longitude difference is > 180°, we crossed the antimeridian
      if (lonDiff > 180) {
        // Insert a NaN point to break the path
        result.push({
          longitude: NaN,
          latitude: NaN,
          timestamp: new Date((current.timestamp.getTime() + next.timestamp.getTime()) / 2),
        });
      }
    }
  }

  return result;
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

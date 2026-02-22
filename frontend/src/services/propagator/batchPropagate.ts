import * as satellite from 'satellite.js';
import { propagateSatellite } from './propagate';
import type { Satellite } from '@/types';

/** Result of batch propagation */
export interface BatchPropagationResult {
  noradId: number;
  position: Satellite['position'];
  velocity: Satellite['velocity'];
}

/**
 * Propagate all satellites to a specific time
 * @param satellites - Array of satellites with satrec
 * @param time - Target time for propagation
 * @returns Array of updated positions/velocities
 */
export function batchPropagate(
  satellites: Satellite[],
  time: Date
): BatchPropagationResult[] {
  const results: BatchPropagationResult[] = [];

  for (const sat of satellites) {
    const satrec = sat.satrec as satellite.SatRec;
    if (!satrec) continue;

    const propagation = propagateSatellite(satrec, time);
    if (!propagation) continue;

    results.push({
      noradId: sat.noradId,
      position: propagation.position,
      velocity: propagation.velocity,
    });
  }

  return results;
}

/**
 * Propagate a single satellite (for incremental updates)
 */
export function propagateSingle(
  sat: Satellite,
  time: Date
): BatchPropagationResult | null {
  const satrec = sat.satrec as satellite.SatRec;
  if (!satrec) return null;

  const propagation = propagateSatellite(satrec, time);
  if (!propagation) return null;

  return {
    noradId: sat.noradId,
    position: propagation.position,
    velocity: propagation.velocity,
  };
}

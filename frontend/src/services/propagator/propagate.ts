import * as satellite from 'satellite.js';
import type { GeodeticPosition, VelocityVector } from '@/types';

/** Result of satellite propagation */
export interface PropagationResult {
  position: GeodeticPosition;
  velocity: VelocityVector;
}

/**
 * Propagate a satellite to a specific time using SGP4/SDP4
 * @param satrec - Satellite record from TLE parsing
 * @param time - Target time for propagation
 * @returns Position and velocity or null if propagation failed
 */
export function propagateSatellite(
  satrec: satellite.SatRec,
  time: Date
): PropagationResult | null {
  try {
    // Propagate to the specified time
    const posVel = satellite.propagate(satrec, time);

    // Check for propagation errors
    if (!posVel || !posVel.position || typeof posVel.position === 'boolean') {
      console.warn('Propagation failed: invalid position');
      return null;
    }

    if (!posVel.velocity || typeof posVel.velocity === 'boolean') {
      console.warn('Propagation failed: invalid velocity');
      return null;
    }

    const position = posVel.position as satellite.EciVec3<number>;
    const velocity = posVel.velocity as satellite.EciVec3<number>;

    // Calculate Greenwich Mean Sidereal Time
    const gmst = satellite.gstime(time);

    // Convert ECI position to geodetic coordinates
    const geo = satellite.eciToGeodetic(position, gmst);

    // Extract velocity components
    const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2);

    return {
      position: {
        latitude: satellite.degreesLat(geo.latitude),
        longitude: satellite.degreesLong(geo.longitude),
        altitude: geo.height,
        timestamp: time,
      },
      velocity: {
        x: velocity.x,
        y: velocity.y,
        z: velocity.z,
        speed,
      },
    };
  } catch (error) {
    console.error('Propagation error:', error);
    return null;
  }
}

/**
 * Propagate multiple positions along a time range for ground track
 * @param satrec - Satellite record from TLE parsing
 * @param startTime - Start of time range
 * @param endTime - End of time range
 * @param stepMs - Time step in milliseconds
 * @returns Array of positions
 */
export function propagateTrack(
  satrec: satellite.SatRec,
  startTime: Date,
  endTime: Date,
  stepMs: number
): GeodeticPosition[] {
  const positions: GeodeticPosition[] = [];
  let currentTime = startTime.getTime();
  const endTimeMs = endTime.getTime();

  while (currentTime <= endTimeMs) {
    const time = new Date(currentTime);
    const result = propagateSatellite(satrec, time);
    
    if (result) {
      positions.push(result.position);
    }
    
    currentTime += stepMs;
  }

  return positions;
}

/**
 * Check if a satellite record is valid for propagation
 */
export function isValidSatrec(satrec: satellite.SatRec): boolean {
  return satrec.error === 0;
}

/**
 * Get the satellite's orbital period in minutes
 */
export function getOrbitalPeriod(satrec: satellite.SatRec): number {
  // Mean motion is in radians per minute
  const meanMotion = satrec.no;
  return (2 * Math.PI) / meanMotion;
}

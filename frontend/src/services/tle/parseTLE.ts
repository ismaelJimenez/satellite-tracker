import * as satellite from 'satellite.js';
import type { TwoLineElement, OrbitalElements, DataStatus } from '@/types';

/**
 * Parse TLE lines and create satellite record for propagation
 */
export function parseTLE(line1: string, line2: string): satellite.SatRec | null {
  try {
    const satrec = satellite.twoline2satrec(line1, line2);
    
    // Check for parsing errors
    if (satrec.error !== 0) {
      console.warn(`TLE parsing error code: ${satrec.error}`);
      return null;
    }
    
    return satrec;
  } catch (error) {
    console.error('Failed to parse TLE:', error);
    return null;
  }
}

/**
 * Extract TLE epoch date from satellite record
 */
export function extractEpoch(satrec: satellite.SatRec): Date {
  // satrec.jdsatepoch is Julian date of epoch
  const jd = satrec.jdsatepoch;
  
  // Convert Julian date to JavaScript Date
  // JD 2440587.5 = Unix epoch (Jan 1, 1970)
  const unixTime = (jd - 2440587.5) * 86400000;
  return new Date(unixTime);
}

/**
 * Extract orbital elements from satellite record
 */
export function extractOrbitalElements(satrec: satellite.SatRec): OrbitalElements {
  const RAD_TO_DEG = 180 / Math.PI;
  
  // Calculate orbital period from mean motion (revolutions per day)
  const meanMotion = satrec.no; // radians per minute
  const periodMinutes = (2 * Math.PI) / meanMotion;
  
  // Calculate semi-major axis from mean motion using Kepler's third law
  // a³ = μ / n² where μ = GM (Earth's gravitational parameter)
  // For Earth: μ ≈ 398600.4418 km³/s²
  const MU = 398600.4418;
  const meanMotionRadPerSec = meanMotion / 60;
  const semiMajorAxis = Math.pow(MU / (meanMotionRadPerSec * meanMotionRadPerSec), 1/3);
  
  return {
    inclination: satrec.inclo * RAD_TO_DEG,
    eccentricity: satrec.ecco,
    period: periodMinutes,
    semiMajorAxis,
    raan: satrec.nodeo * RAD_TO_DEG,
    argumentOfPerigee: satrec.argpo * RAD_TO_DEG,
  };
}

/**
 * Determine data freshness based on TLE epoch
 */
export function determineDataStatus(epoch: Date): DataStatus {
  const now = new Date();
  const ageMs = now.getTime() - epoch.getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  
  if (ageDays <= 7) {
    return 'current' as DataStatus;
  } else if (ageDays <= 30) {
    return 'stale' as DataStatus;
  } else {
    return 'expired' as DataStatus;
  }
}

/**
 * Validate TLE line format
 */
export function validateTLELine(line: string, lineNumber: 1 | 2): boolean {
  if (line.length !== 69) {
    return false;
  }
  
  if (!line.startsWith(`${lineNumber} `)) {
    return false;
  }
  
  // Validate checksum
  const checksum = calculateChecksum(line.substring(0, 68));
  const expectedChecksum = parseInt(line[68], 10);
  
  return checksum === expectedChecksum;
}

/**
 * Calculate TLE line checksum
 */
export function calculateChecksum(line: string): number {
  let sum = 0;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char >= '0' && char <= '9') {
      sum += parseInt(char, 10);
    } else if (char === '-') {
      sum += 1;
    }
    // Letters, spaces, plus signs, and decimal points don't contribute
  }
  return sum % 10;
}

/**
 * Create TwoLineElement object from raw lines
 */
export function createTwoLineElement(name: string, line1: string, line2: string): TwoLineElement {
  return {
    line0: name,
    line1,
    line2,
  };
}

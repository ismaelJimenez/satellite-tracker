'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSatelliteStore } from './store';
import { batchPropagate } from '@/services/propagator/batchPropagate';
import { UPDATE_INTERVAL_MS } from '@/lib/constants';

/**
 * Hook to automatically update satellite positions at regular intervals
 */
export function usePositionUpdater() {
  const satellites = useSatelliteStore((state) => state.satellites);
  const updatePositions = useSatelliteStore((state) => state.updatePositions);
  const isLoading = useSatelliteStore((state) => state.isLoading);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateAllPositions = useCallback(() => {
    const satelliteArray = Array.from(satellites.values());
    if (satelliteArray.length === 0) return;

    const now = new Date();
    const results = batchPropagate(satelliteArray, now);
    
    if (results.length > 0) {
      updatePositions(results);
    }
  }, [satellites, updatePositions]);

  useEffect(() => {
    // Don't start updating until initial load is complete
    if (isLoading) return;

    // Start position update loop
    intervalRef.current = setInterval(updateAllPositions, UPDATE_INTERVAL_MS);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isLoading, updateAllPositions]);

  // Return manual update function for testing/debugging
  return { updateNow: updateAllPositions };
}

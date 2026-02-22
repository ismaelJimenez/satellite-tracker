import { useCallback, useEffect, useState } from 'react';
import { useSatelliteStore, useVisibleSatellites, useSelectedSatellite } from './store';
import { fetchTLEData, flattenTLEData } from '@/services/tle/fetchTLE';
import { parseTLE, extractEpoch, extractOrbitalElements, determineDataStatus } from '@/services/tle/parseTLE';
import { propagateSatellite } from '@/services/propagator/propagate';
import type { Satellite, SatelliteCategory } from '@/types';

/**
 * Hook to load and manage satellite data
 */
export function useSatelliteLoader() {
  const setSatellites = useSatelliteStore((state) => state.setSatellites);
  const setError = useSatelliteStore((state) => state.setError);
  const setLoading = useSatelliteStore((state) => state.setLoading);
  const [initialized, setInitialized] = useState(false);

  const loadSatellites = useCallback(async () => {
    if (initialized) return;
    
    setLoading(true);
    
    try {
      const tleData = await fetchTLEData();
      const flatData = flattenTLEData(tleData);
      const now = new Date();
      
      const satellites: Satellite[] = [];
      
      for (const item of flatData) {
        const satrec = parseTLE(item.line1, item.line2);
        if (!satrec) continue;
        
        const epoch = extractEpoch(satrec);
        const orbitalElements = extractOrbitalElements(satrec);
        const dataStatus = determineDataStatus(epoch);
        
        // Skip expired satellites
        if (dataStatus === 'expired') continue;
        
        const propagation = propagateSatellite(satrec, now);
        if (!propagation) continue;
        
        satellites.push({
          noradId: item.noradId,
          name: item.name,
          category: item.category as SatelliteCategory,
          tle: {
            line0: item.name,
            line1: item.line1,
            line2: item.line2,
          },
          epoch,
          position: propagation.position,
          velocity: propagation.velocity,
          orbitalElements,
          dataStatus,
          satrec,
        });
      }
      
      setSatellites(satellites);
      setInitialized(true);
    } catch (error) {
      console.error('Failed to load satellites:', error);
      setError(error instanceof Error ? error.message : 'Failed to load satellite data');
    }
  }, [initialized, setSatellites, setError, setLoading]);

  useEffect(() => {
    loadSatellites();
  }, [loadSatellites]);

  const retry = useCallback(() => {
    setInitialized(false);
    loadSatellites();
  }, [loadSatellites]);

  return { retry };
}

/**
 * Hook for accessing visible satellites
 */
export function useSatellites() {
  return useVisibleSatellites();
}

/**
 * Hook for accessing the selected satellite
 */
export function useSelected() {
  return useSelectedSatellite();
}

/**
 * Hook for satellite selection actions
 */
export function useSatelliteSelection() {
  const selectSatellite = useSatelliteStore((state) => state.selectSatellite);
  const selectedId = useSatelliteStore((state) => state.selectedId);
  
  return {
    selectedId,
    select: selectSatellite,
    deselect: () => selectSatellite(null),
  };
}

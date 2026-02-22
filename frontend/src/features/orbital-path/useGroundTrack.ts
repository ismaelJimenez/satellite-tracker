'use client';

import { useEffect, useCallback } from 'react';
import { useSatelliteStore, useSelectedSatellite } from '@/features/satellites/store';
import { calculateGroundTrack } from '@/services/propagator/groundTrack';

/**
 * Hook to calculate and update ground track for selected satellite
 */
export function useGroundTrack() {
  const selectedSatellite = useSelectedSatellite();
  const setGroundTrack = useSatelliteStore((state) => state.setGroundTrack);
  const groundTrack = useSatelliteStore((state) => state.groundTrack);

  const updateGroundTrack = useCallback(() => {
    if (!selectedSatellite) {
      setGroundTrack(null);
      return;
    }

    const track = calculateGroundTrack(selectedSatellite);
    setGroundTrack(track);
  }, [selectedSatellite, setGroundTrack]);

  // Calculate ground track when selection changes
  useEffect(() => {
    updateGroundTrack();
  }, [updateGroundTrack]);

  return {
    groundTrack,
    refreshTrack: updateGroundTrack,
  };
}

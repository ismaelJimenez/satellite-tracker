'use client';

import { useSatelliteStore } from '@/features/satellites/store';
import type { SatelliteCategory, CategoryFilters } from '@/types';

/**
 * Hook for managing category filters
 */
export function useFilters() {
  const filters = useSatelliteStore((state) => state.filters);
  const toggleFilter = useSatelliteStore((state) => state.toggleFilter);

  const toggle = (category: SatelliteCategory) => {
    toggleFilter(category);
  };

  const isVisible = (category: SatelliteCategory): boolean => {
    return filters[category];
  };

  const activeCount = Object.values(filters).filter(Boolean).length;
  const allActive = activeCount === Object.keys(filters).length;
  const noneActive = activeCount === 0;

  return {
    filters,
    toggle,
    isVisible,
    activeCount,
    allActive,
    noneActive,
  };
}

/**
 * Get default filter state with all categories visible
 */
export function getDefaultFilters(): CategoryFilters {
  return {
    station: true,
    navigation: true,
    weather: true,
  };
}

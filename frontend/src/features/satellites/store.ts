import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { Satellite, SatelliteCategory, CategoryFilters, GroundTrack } from '@/types';

interface SatelliteState {
  /** Map of satellites by NORAD ID */
  satellites: Map<number, Satellite>;
  /** Currently selected satellite ID */
  selectedId: number | null;
  /** Category filter states */
  filters: CategoryFilters;
  /** Loading state */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Ground track for selected satellite */
  groundTrack: GroundTrack | null;
}

interface SatelliteActions {
  /** Set all satellites (initial load) */
  setSatellites: (satellites: Satellite[]) => void;
  /** Update positions for existing satellites */
  updatePositions: (updates: Array<{ noradId: number; position: Satellite['position']; velocity: Satellite['velocity'] }>) => void;
  /** Select a satellite */
  selectSatellite: (id: number | null) => void;
  /** Toggle a category filter */
  toggleFilter: (category: SatelliteCategory) => void;
  /** Set loading state */
  setLoading: (loading: boolean) => void;
  /** Set error state */
  setError: (error: string | null) => void;
  /** Set ground track for selected satellite */
  setGroundTrack: (track: GroundTrack | null) => void;
  /** Clear all data (for reset/refresh) */
  clear: () => void;
}

type SatelliteStore = SatelliteState & SatelliteActions;

const initialState: SatelliteState = {
  satellites: new Map(),
  selectedId: null,
  filters: {
    station: true,
    navigation: true,
    weather: true,
  },
  isLoading: true,
  error: null,
  groundTrack: null,
};

export const useSatelliteStore = create<SatelliteStore>((set, get) => ({
  ...initialState,

  setSatellites: (satellites) => {
    const satelliteMap = new Map<number, Satellite>();
    for (const sat of satellites) {
      satelliteMap.set(sat.noradId, sat);
    }
    set({ satellites: satelliteMap, isLoading: false, error: null });
  },

  updatePositions: (updates) => {
    const { satellites } = get();
    const newSatellites = new Map(satellites);
    
    for (const update of updates) {
      const existing = newSatellites.get(update.noradId);
      if (existing) {
        newSatellites.set(update.noradId, {
          ...existing,
          position: update.position,
          velocity: update.velocity,
        });
      }
    }
    
    set({ satellites: newSatellites });
  },

  selectSatellite: (id) => {
    set({ selectedId: id, groundTrack: null });
  },

  toggleFilter: (category) => {
    const { filters, selectedId, satellites } = get();
    const newFilters = { ...filters, [category]: !filters[category] };
    
    // If selected satellite's category is now hidden, deselect it
    let newSelectedId = selectedId;
    if (selectedId) {
      const selectedSat = satellites.get(selectedId);
      if (selectedSat && !newFilters[selectedSat.category]) {
        newSelectedId = null;
      }
    }
    
    set({ filters: newFilters, selectedId: newSelectedId });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error, isLoading: false }),

  setGroundTrack: (track) => set({ groundTrack: track }),

  clear: () => set(initialState),
}));

// Selector hooks for fine-grained subscriptions
export const useSelectedSatellite = () => {
  return useSatelliteStore((state) => {
    if (!state.selectedId) return null;
    return state.satellites.get(state.selectedId) ?? null;
  });
};

export const useVisibleSatellites = () => {
  return useSatelliteStore(
    useShallow((state) => {
      const { satellites, filters } = state;
      return Array.from(satellites.values()).filter(
        (sat) => filters[sat.category]
      );
    })
  );
};

export const useFilters = () => {
  return useSatelliteStore((state) => state.filters);
};

export const useIsLoading = () => {
  return useSatelliteStore((state) => state.isLoading);
};

export const useError = () => {
  return useSatelliteStore((state) => state.error);
};

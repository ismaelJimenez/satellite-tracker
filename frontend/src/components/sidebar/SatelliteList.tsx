'use client';

import { useSatelliteStore } from '@/features/satellites/store';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/types/category';

/**
 * List of satellites in sidebar for easy selection
 */
export function SatelliteList() {
  const satellites = useSatelliteStore((state) => state.satellites);
  const filters = useSatelliteStore((state) => state.filters);
  const selectedId = useSatelliteStore((state) => state.selectedId);
  const selectSatellite = useSatelliteStore((state) => state.selectSatellite);

  // Filter satellites based on active category filters
  const filteredSatellites = Array.from(satellites.values()).filter(
    (sat) => filters[sat.category]
  );

  if (filteredSatellites.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
        No satellites visible. Enable category filters above.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto" data-testid="satellite-list">
      <div className="px-4 py-2">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Satellites ({filteredSatellites.length})
        </h2>
      </div>
      <ul className="divide-y divide-gray-100 dark:divide-gray-800">
        {filteredSatellites.map((satellite) => {
          const isSelected = selectedId === satellite.noradId;
          const color = CATEGORY_COLORS[satellite.category];
          const icon = CATEGORY_ICONS[satellite.category];

          return (
            <li key={satellite.noradId}>
              <button
                onClick={() => selectSatellite(satellite.noradId)}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                }`}
                data-testid="satellite-item"
              >
                <span
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: `rgb(${color.join(',')})` }}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    isSelected 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {satellite.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    NORAD: {satellite.noradId} • Alt: {satellite.position?.altitude?.toFixed(0) ?? '---'} km
                  </p>
                </div>
                <span className="text-lg" role="img" aria-label={satellite.category}>
                  {icon}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

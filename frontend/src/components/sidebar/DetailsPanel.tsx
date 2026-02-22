'use client';

import { useSelectedSatellite } from '@/features/satellites/store';
import { useSatelliteStore } from '@/features/satellites/store';
import { CATEGORY_LABELS } from '@/types/category';

/**
 * Details panel showing selected satellite information
 */
export function DetailsPanel() {
  const satellite = useSelectedSatellite();
  const selectSatellite = useSatelliteStore((state) => state.selectSatellite);

  if (!satellite) {
    return null;
  }

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toFixed(decimals);
  };

  const formatCoordinate = (value: number, type: 'lat' | 'lng') => {
    const abs = Math.abs(value);
    const direction = type === 'lat' 
      ? (value >= 0 ? 'N' : 'S')
      : (value >= 0 ? 'E' : 'W');
    return `${formatNumber(abs, 4)}° ${direction}`;
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4" data-testid="details-panel">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
            data-testid="satellite-name"
          >
            {satellite.name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            NORAD ID: {satellite.noradId}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {CATEGORY_LABELS[satellite.category]}
          </p>
        </div>
        <button
          onClick={() => selectSatellite(null)}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Close details"
          data-testid="close-details"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Position section */}
      <section className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Current Position
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Latitude</span>
            <p className="font-mono text-gray-900 dark:text-gray-100">
              {formatCoordinate(satellite.position.latitude, 'lat')}
            </p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Longitude</span>
            <p className="font-mono text-gray-900 dark:text-gray-100">
              {formatCoordinate(satellite.position.longitude, 'lng')}
            </p>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500 dark:text-gray-400">Altitude</span>
            <p className="font-mono text-gray-900 dark:text-gray-100">
              {formatNumber(satellite.position.altitude, 1)} km
            </p>
          </div>
        </div>
      </section>

      {/* Velocity section */}
      <section className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Velocity
        </h3>
        <div className="text-sm">
          <span className="text-gray-500 dark:text-gray-400">Speed</span>
          <p className="font-mono text-gray-900 dark:text-gray-100">
            {formatNumber(satellite.velocity.speed, 3)} km/s
          </p>
        </div>
      </section>

      {/* Orbital Elements section */}
      <section>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Orbital Elements
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Inclination</span>
            <p className="font-mono text-gray-900 dark:text-gray-100">
              {formatNumber(satellite.orbitalElements.inclination, 2)}°
            </p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Eccentricity</span>
            <p className="font-mono text-gray-900 dark:text-gray-100">
              {formatNumber(satellite.orbitalElements.eccentricity, 6)}
            </p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Period</span>
            <p className="font-mono text-gray-900 dark:text-gray-100">
              {formatNumber(satellite.orbitalElements.period, 1)} min
            </p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Semi-major Axis</span>
            <p className="font-mono text-gray-900 dark:text-gray-100">
              {formatNumber(satellite.orbitalElements.semiMajorAxis, 1)} km
            </p>
          </div>
        </div>
      </section>

      {/* Data status */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          TLE Epoch: {satellite.epoch.toISOString().split('T')[0]}
        </p>
        <p className={`text-xs mt-1 ${
          satellite.dataStatus === 'current' ? 'text-green-500' :
          satellite.dataStatus === 'stale' ? 'text-yellow-500' : 'text-red-500'
        }`}>
          Data Status: {satellite.dataStatus}
        </p>
      </div>
    </div>
  );
}

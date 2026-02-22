'use client';

import { useSatelliteStore } from '@/features/satellites/store';
import { SatelliteCategory } from '@/types';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types/category';

/**
 * Filter panel for toggling satellite category visibility
 */
export function FilterPanel() {
  const filters = useSatelliteStore((state) => state.filters);
  const toggleFilter = useSatelliteStore((state) => state.toggleFilter);

  const categories = Object.values(SatelliteCategory);

  return (
    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700" data-testid="filter-panel">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
        Satellite Categories
      </h2>
      <div className="space-y-2">
        {categories.map((category) => {
          const color = CATEGORY_COLORS[category];
          const isActive = filters[category];
          
          return (
            <label
              key={category}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => toggleFilter(category)}
                className="sr-only"
                data-testid={`filter-${category}`}
              />
              <span
                className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
                  isActive
                    ? 'border-transparent'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                style={{
                  backgroundColor: isActive ? `rgb(${color.join(',')})` : 'transparent',
                }}
              >
                {isActive && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </span>
              <span className={`text-sm ${isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                {CATEGORY_LABELS[category]}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

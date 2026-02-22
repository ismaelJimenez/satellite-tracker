'use client';

import { useState } from 'react';
import { useSatelliteStore } from '@/features/satellites/store';
import { DetailsPanel } from './DetailsPanel';
import { FilterPanel } from './FilterPanel';
import { SatelliteList } from './SatelliteList';

/**
 * Collapsible sidebar for satellite details and filters
 */
export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const selectedId = useSatelliteStore((state) => state.selectedId);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-4 right-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
        data-testid="sidebar-toggle"
      >
        <svg
          className="w-6 h-6 text-gray-600 dark:text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar panel */}
      <aside
        className={`absolute top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        data-testid="sidebar"
      >
        <div className="h-full flex flex-col pt-16 pb-4">
          {/* Filter panel */}
          <FilterPanel />

          {/* Satellite list or details panel */}
          {selectedId ? <DetailsPanel /> : <SatelliteList />}
        </div>
      </aside>
    </>
  );
}

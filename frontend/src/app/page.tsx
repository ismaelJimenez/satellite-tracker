'use client';

import dynamic from 'next/dynamic';
import { useSatelliteLoader } from '@/features/satellites/hooks';
import { usePositionUpdater } from '@/features/satellites/usePositionUpdater';
import { useGroundTrack } from '@/features/orbital-path/useGroundTrack';
import { useSatelliteStore } from '@/features/satellites/store';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorBanner } from '@/components/common/ErrorBanner';

// Load map client-side only (deck.gl needs browser APIs)
const SatelliteMap = dynamic(
  () => import('@/components/map/SatelliteMap').then((mod) => mod.SatelliteMap),
  {
    ssr: false,
    loading: () => <LoadingSpinner overlay />,
  }
);

// Lazy load Sidebar (US3+)
const Sidebar = dynamic(
  () => import('@/components/sidebar/Sidebar').then((mod) => mod.Sidebar),
  { ssr: false }
);

export default function Home() {
  const { retry } = useSatelliteLoader();
  usePositionUpdater(); // Real-time position updates (US2)
  useGroundTrack(); // Ground track calculation (US5)
  const isLoading = useSatelliteStore((state) => state.isLoading);
  const error = useSatelliteStore((state) => state.error);

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      {/* Map */}
      <SatelliteMap />

      {/* Loading overlay */}
      {isLoading && <LoadingSpinner overlay />}

      {/* Error banner */}
      {error && (
        <ErrorBanner
          message={error}
          onRetry={retry}
          type="error"
        />
      )}

      {/* Sidebar for details and filters */}
      <Sidebar />
    </main>
  );
}

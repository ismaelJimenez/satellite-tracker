'use client';

import { useMemo, useCallback, useState, useEffect } from 'react';
import Map, { useControl } from 'react-map-gl/maplibre';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { IconLayer, PathLayer } from '@deck.gl/layers';
import type { PickingInfo } from '@deck.gl/core';
import { useSatelliteStore, useVisibleSatellites } from '@/features/satellites/store';
import { INITIAL_VIEW_STATE, MAP_STYLE_URL, ICON_SIZE, TRANSITION_DURATION_MS, GROUND_TRACK_STYLE } from '@/lib/constants';
import { CATEGORY_COLORS } from '@/types/category';
import type { Satellite, GroundTrackPoint } from '@/types';
import 'maplibre-gl/dist/maplibre-gl.css';

/**
 * Bridge component that injects deck.gl layers into MapLibre's GL context
 * via MapboxOverlay, avoiding luma.gl's standalone canvas + ResizeObserver.
 */
function DeckGLOverlay({
  layers,
  onClick,
}: {
  layers: (IconLayer | PathLayer)[];
  onClick: (info: PickingInfo) => void;
}) {
  const overlay = useControl<MapboxOverlay>(
    () =>
      new MapboxOverlay({
        layers,
        onClick,
        interleaved: false,
      })
  );

  overlay.setProps({ layers, onClick });

  return null;
}

export function SatelliteMap() {
  const [isMounted, setIsMounted] = useState(false);
  const satellites = useVisibleSatellites();
  const selectedId = useSatelliteStore((state) => state.selectedId);
  const groundTrack = useSatelliteStore((state) => state.groundTrack);
  const selectSatellite = useSatelliteStore((state) => state.selectSatellite);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle satellite click
  const onClick = useCallback(
    (info: PickingInfo) => {
      if (info.object) {
        const sat = info.object as Satellite;
        selectSatellite(sat.noradId);
      } else {
        selectSatellite(null);
      }
    },
    [selectSatellite]
  );

  // Create deck.gl layers
  const layers = useMemo(() => {
    const result: (IconLayer | PathLayer)[] = [];

    result.push(
      new IconLayer<Satellite>({
        id: 'satellites',
        data: satellites,
        getPosition: (d) => [d.position.longitude, d.position.latitude, d.position.altitude * 100],
        getIcon: (d) => ({
          url: `/icons/${d.category}.svg`,
          width: 64,
          height: 64,
          anchorY: 32,
        }),
        getSize: (d) => (d.noradId === selectedId ? ICON_SIZE.selected : ICON_SIZE.default),
        getColor: (d) => [...CATEGORY_COLORS[d.category], 255] as [number, number, number, number],
        sizeScale: 1,
        billboard: true,
        pickable: true,
        transitions: {
          getPosition: TRANSITION_DURATION_MS,
        },
        updateTriggers: {
          getSize: [selectedId],
        },
      })
    );

    if (groundTrack && groundTrack.segments.length > 0) {
      result.push(
        new PathLayer<GroundTrackPoint[]>({
          id: 'ground-track',
          data: groundTrack.segments,
          getPath: (segment) => segment.map((p) => [p.longitude, p.latitude] as [number, number]),
          getColor: GROUND_TRACK_STYLE.color,
          widthMinPixels: GROUND_TRACK_STYLE.width,
          jointRounded: true,
          capRounded: true,
        })
      );
    }

    return result;
  }, [satellites, selectedId, groundTrack]);

  if (!isMounted) {
    return (
      <div className="absolute inset-0 bg-gray-900" data-testid="satellite-map" />
    );
  }

  return (
    <div className="absolute inset-0" data-testid="satellite-map">
      <Map
        initialViewState={INITIAL_VIEW_STATE}
        mapStyle={MAP_STYLE_URL}
        style={{ width: '100%', height: '100%' }}
        cursor="grab"
      >
        <DeckGLOverlay layers={layers} onClick={onClick} />
      </Map>
    </div>
  );
}

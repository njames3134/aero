import { useMemo, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import polyline from "polyline";
import "leaflet/dist/leaflet.css";

interface MiniMapProps {
  encoded: string;
  className?: string;
}

export function MiniMap({
  encoded,
  className = "",
}: MiniMapProps) {
  const coordinates = useMemo(() => {
    if (!encoded) return [];
    return polyline.decode(encoded) as [number, number][];
  }, [encoded]);

  const bounds = useMemo(() => {
    if (!coordinates.length) return undefined;
    return L.latLngBounds(coordinates);
  }, [coordinates]);

  if (!coordinates.length || !bounds) {
    return null;
  }

  return (
    <div className={className}>
      <MapContainer
        bounds={bounds}
        className="h-full w-full"
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
        attributionControl={false}
        preferCanvas={true}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <Polyline
          positions={coordinates}
          pathOptions={{
            color: "#ff4d00",
            weight: 5,
            opacity: 0.15,
          }}
        />
        <Polyline
          positions={coordinates}
          pathOptions={{
            color: '#fc4c02',
            weight: 2,
            opacity: 0.9,
          }}
        />
      </MapContainer>
    </div>
  );
}

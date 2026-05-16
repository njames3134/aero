import { useMemo, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import polyline from "polyline";
import "leaflet/dist/leaflet.css";

interface MiniMapProps {
  encoded: string;
  className?: string;
}

function FitBounds({ bounds }: { bounds: L.LatLngBounds | null }) {
  const map = useMap();
  const hasFitted = useRef(false);

  useEffect(() => {
    if (hasFitted.current || !bounds) return;
    map.fitBounds(bounds, { padding: [5, 5] });
    hasFitted.current = true;
  }, [map, bounds]);

  return null;
}

export function MiniMap({ encoded, className = "" }: MiniMapProps) {
  const coordinates = useMemo(() => {
    if (!encoded) return [];
    try {
      return polyline.decode(encoded) as [number, number][];
    } catch {
      return [];
    }
  }, [encoded]);

  const bounds = useMemo(() => {
    if (!coordinates.length) return null;
    const b = L.latLngBounds(coordinates);
    return b.isValid() ? b : null;
  }, [coordinates]);

  const center = useMemo((): [number, number] => {
    if (!bounds) return [0, 0];
    const c = bounds.getCenter();
    return [c.lat, c.lng];
  }, [bounds]);

  if (!coordinates.length || !bounds) return null;

  return (
    <div className={`overflow-hidden ${className}`}>
      <MapContainer
        center={center}
        zoom={12}
        className="h-full w-full"
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <FitBounds bounds={bounds} />
        <Polyline
          positions={coordinates}
          pathOptions={{ color: "#fc4c02", weight: 2, opacity: 0.9 }}
        />
      </MapContainer>
    </div>
  );
}

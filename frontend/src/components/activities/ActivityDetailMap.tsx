import { useMemo, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import polyline from "polyline";
import "leaflet/dist/leaflet.css";

interface Props {
  polyline: string | null | undefined;
}

function FitBounds({ bounds }: { bounds: L.LatLngBounds | null }) {
  const map = useMap();
  const hasFitted = useRef(false);

  useEffect(() => {
    if (hasFitted.current || !bounds) return;
    map.fitBounds(bounds, { padding: [24, 24] });
    hasFitted.current = true;
  }, [map, bounds]);

  return null;
}

export function ActivityDetailMap({ polyline: encoded }: Props) {
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

  if (!coordinates.length || !bounds) {
    return (
      <div className="bg-[#0d1117] border border-[#1a1a1a] rounded-xl h-full min-h-[420px] flex flex-col items-center justify-center gap-2">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2a2a2a" strokeWidth="1.5">
          <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/>
        </svg>
        <span className="text-xs text-zinc-800">No GPS data</span>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#1a1a1a] h-full min-h-[420px]">
      <MapContainer
        center={center}
        zoom={13}
        className="h-full w-full"
        zoomControl={true}
        dragging={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <FitBounds bounds={bounds} />
        <Polyline
          positions={coordinates}
          pathOptions={{ color: "#fc4c02", weight: 3, opacity: 0.9 }}
        />
      </MapContainer>
    </div>
  );
}

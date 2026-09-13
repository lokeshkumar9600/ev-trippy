import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

type MapViewProps = {
  center?: [number, number];
  zoom?: number;
};

function MapView({
  center = [-0.1276, 51.5072],
  zoom = 12,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
  if (!mapContainer.current) return;

  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

  map.current = new mapboxgl.Map({
    container: mapContainer.current,
    style: "mapbox://styles/mapbox/streets-v12",
    center,
    zoom,
    pitch: 55,
    bearing: -20,
  });

  map.current.addControl(
    new mapboxgl.NavigationControl(),
    "top-right",
  );

  map.current.on("style.load", () => {
    map.current?.addSource("mapbox-dem", {
      type: "raster-dem",
      url: "mapbox://mapbox.mapbox-terrain-dem-v1",
      tileSize: 512,
      maxzoom: 14,
    });

    map.current?.setTerrain({
      source: "mapbox-dem",
      exaggeration: 1.2,
    });
  });

  return () => {
    map.current?.remove();
    map.current = null;
  };
}, []);

  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "75vh",
        minHeight: "600px",
        borderRadius: "16px",
        overflow: "hidden",
 }}
    />
  );
}

export default MapView;
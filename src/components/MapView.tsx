import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import polyline from "@mapbox/polyline";

type RouteLeg = {
  type?: string;
  station?: {
    station_id?: string | null;
  } | null;
  destination?: {
    geometry?: {
      coordinates?: number[];
    } | null;
    properties?: {
      name?: string | null;
    } | null;
  } | null;
};

type MapViewProps = {
  routePolyline?: string | null;
  routeLegs?: RouteLeg[];
  center?: [number, number];
  zoom?: number;
};

function MapView({
  routePolyline,
  routeLegs = [],
  center = [-0.1276, 51.5072],
  zoom = 9,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

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
      markers.current.forEach((marker) => marker.remove());
      markers.current = [];

      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !routePolyline) return;

    const mapInstance = map.current;

    const drawRoute = () => {
  const coordinates = polyline
    .decode(routePolyline)
    .map(([latitude, longitude]) => [
      longitude,
      latitude,
    ] as [number, number]);

  const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates,
    },
  };

  if (mapInstance.getSource("route")) {
    (
      mapInstance.getSource("route") as mapboxgl.GeoJSONSource
    ).setData(geojson);
  } else {
    mapInstance.addSource("route", {
      type: "geojson",
      data: geojson,
    });

    mapInstance.addLayer({
      id: "route",
      type: "line",
      source: "route",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-width": 6,
        "line-opacity": 0.9,
      },
    });
  }

  // Fit the map to the entire route
  const bounds = coordinates.reduce(
    (bounds, coordinate) => {
      return bounds.extend(coordinate);
    },
    new mapboxgl.LngLatBounds(
      coordinates[0],
      coordinates[0],
    ),
  );

  mapInstance.fitBounds(bounds, {
    padding: 80,
    duration: 1200,
    maxZoom: 12,
  });
};

     

    if (mapInstance.isStyleLoaded()) {
      drawRoute();
    } else {
      mapInstance.once("load", drawRoute);
    }
  }, [routePolyline]);

  useEffect(() => {
    if (!map.current || routeLegs.length === 0) return;

    const mapInstance = map.current;

    // Remove old markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    routeLegs.forEach((leg) => {
      if (!leg.station) return;

      const coordinates =
        leg.destination?.geometry?.coordinates;

      if (!coordinates || coordinates.length < 2) return;

      const [longitude, latitude] = coordinates;

      const element = document.createElement("div");

      element.innerHTML = "⚡";
      element.style.width = "38px";
      element.style.height = "38px";
      element.style.borderRadius = "50%";
      element.style.background = "white";
      element.style.display = "flex";
      element.style.alignItems = "center";
      element.style.justifyContent = "center";
      element.style.fontSize = "22px";
      element.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
      element.style.border = "2px solid #228be6";
      element.style.cursor = "pointer";

      const popup = new mapboxgl.Popup({
        offset: 25,
      }).setHTML(`
        <strong>Charging stop</strong>
        <br />
        ${leg.destination?.properties?.name ?? "EV charging station"}
      `);

      const marker = new mapboxgl.Marker({
        element,
      })
        .setLngLat([longitude, latitude])
        .setPopup(popup)
        .addTo(mapInstance);

      markers.current.push(marker);
    });
  }, [routeLegs]);

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
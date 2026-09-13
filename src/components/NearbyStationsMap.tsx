
import { useEffect, useRef } from "react";
import Map, {
  Marker,
  NavigationControl,
  type MapRef,
} from "react-map-gl/mapbox";

import "mapbox-gl/dist/mapbox-gl.css";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type Station = {
  id: string;
  name: string;
  location: {
    coordinates: [number, number];
  };
};

type NearbyStationsMapProps = {
  coordinates: Coordinates | null;
  stations: Station[];
  selectedStationId: string | null;
  onSelectStation: (stationId: string) => void;
};

export default function NearbyStationsMap({
  coordinates,
  stations,
  selectedStationId,
  onSelectStation,
}: NearbyStationsMapProps) {
  const mapRef = useRef<MapRef | null>(null);

  /*
   * Move the map to the user's location whenever it changes.
   */
  useEffect(() => {
    if (!coordinates || !mapRef.current) {
      return;
    }

    mapRef.current.flyTo({
      center: [
        coordinates.longitude,
        coordinates.latitude,
      ],
      zoom: 12,
      duration: 1000,
    });
  }, [coordinates]);

  /*
   * Move the map to a selected charging station.
   */
  useEffect(() => {
    if (!selectedStationId || !mapRef.current) {
      return;
    }

    const station = stations.find(
      (item) => item.id === selectedStationId,
    );

    if (!station) {
      return;
    }

    const [longitude, latitude] =
      station.location.coordinates;

    mapRef.current.flyTo({
      center: [longitude, latitude],
      zoom: 15,
      duration: 800,
    });
  }, [selectedStationId, stations]);

  if (!coordinates) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          minHeight: 650,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#eef2f3",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <strong>Waiting for your location</strong>
          <p
            style={{
              marginTop: 8,
              color: "#6b7280",
            }}
          >
            Allow location access to show nearby
            charging stations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude: coordinates.longitude,
        latitude: coordinates.latitude,
        zoom: 12,
      }}
      mapboxAccessToken={
        import.meta.env.VITE_MAPBOX_TOKEN
      }
      mapStyle="mapbox://styles/mapbox/streets-v12"
      style={{
        width: "100%",
        height: "100%",
        minHeight: 650,
      }}
    >
      <NavigationControl
        position="top-right"
      />

      {/* User location */}
      <Marker
        longitude={coordinates.longitude}
        latitude={coordinates.latitude}
        anchor="center"
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#2563eb",
            border: "3px solid white",
            boxShadow:
              "0 2px 8px rgba(0,0,0,0.3)",
          }}
          title="Your location"
        />
      </Marker>

      {/* Charging stations */}
      {stations.map((station) => {
        const [longitude, latitude] =
          station.location.coordinates;

        const selected =
          selectedStationId === station.id;

        return (
          <Marker
            key={station.id}
            longitude={longitude}
            latitude={latitude}
            anchor="bottom"
            onClick={(event) => {
              event.originalEvent.stopPropagation();
              onSelectStation(station.id);
            }}
          >
            <div
              title={station.name}
              style={{
                width: selected ? 38 : 32,
                height: selected ? 38 : 32,
                borderRadius: "50% 50% 50% 0",
                transform: "rotate(-45deg)",
                background: selected
                  ? "#111827"
                  : "#16a34a",
                border: "3px solid white",
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 150ms ease",
              }}
            >
              <span
                style={{
                  transform: "rotate(45deg)",
                  color: "white",
                  fontSize: selected ? 18 : 15,
                  fontWeight: 700,
                }}
              >
                ⚡
              </span>
            </div>
          </Marker>
        );
      })}
    </Map>
  );
}


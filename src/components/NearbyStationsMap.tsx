import { useEffect, useRef, useState } from "react";
import Map, { Marker, NavigationControl, Popup, type MapRef } from "react-map-gl/mapbox";

import "mapbox-gl/dist/mapbox-gl.css";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type PowerInfo = {
  total: number;
  available: number;
};

type Station = {
  id: string;
  name: string;
  location: {
    coordinates: [number, number];
  };
  physical_address?: {
    city?: string | null;
    formatted_address?: string[];
  };
  power: Record<string, PowerInfo>;
};

type NearbyStationsMapProps = {
  coordinates: Coordinates | null;
  stations: Station[];
  selectedStationId: string | null;
  onSelectStation: (stationId: string) => void;
};

function getPowerInfo(power: Record<string, PowerInfo>) {
  let total = 0;
  let available = 0;
  let maxPower = 0;

  for (const [powerValue, info] of Object.entries(power ?? {})) {
    const kw = Number(powerValue);

    if (!Number.isNaN(kw)) {
      maxPower = Math.max(maxPower, kw);
    }

    total += info?.total ?? 0;
    available += info?.available ?? 0;
  }

  return {
    total,
    available,
    maxPower,
  };
}

export default function NearbyStationsMap({
  coordinates,
  stations,
  selectedStationId,
  onSelectStation,
}: NearbyStationsMapProps) {
  const mapRef = useRef<MapRef | null>(null);

  const [popupStationId, setPopupStationId] = useState<string | null>(null);

  useEffect(() => {
    if (!coordinates || !mapRef.current) {
      return;
    }

    mapRef.current.flyTo({
      center: [coordinates.longitude, coordinates.latitude],
      zoom: 12,
      duration: 1000,
    });
  }, [coordinates]);

  useEffect(() => {
    if (!selectedStationId || !mapRef.current) {
      return;
    }

    const station = stations.find((item) => item.id === selectedStationId);

    if (!station) {
      return;
    }

    const [longitude, latitude] = station.location.coordinates;

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
            Allow location access to show nearby charging stations.
          </p>
        </div>
      </div>
    );
  }

  const popupStation = stations.find((station) => station.id === popupStationId);

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude: coordinates.longitude,
        latitude: coordinates.latitude,
        zoom: 12,
      }}
      mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      style={{
        width: "100%",
        height: "100%",
        minHeight: 650,
      }}
    >
      <NavigationControl position="top-right" />

      <Marker longitude={coordinates.longitude} latitude={coordinates.latitude} anchor="center">
        <div
          title="Your location"
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#2563eb",
            border: "3px solid white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        />
      </Marker>

      {stations.map((station) => {
        const [longitude, latitude] = station.location.coordinates;

        const selected = selectedStationId === station.id;

        return (
          <Marker
            key={station.id}
            longitude={longitude}
            latitude={latitude}
            anchor="bottom"
            onClick={(event) => {
              event.originalEvent.stopPropagation();
              setPopupStationId(station.id);
              onSelectStation(station.id);
            }}
          >
            <div
              title={station.name}
              style={{
                width: selected ? 40 : 32,
                height: selected ? 40 : 32,
                borderRadius: "50% 50% 50% 0",
                transform: "rotate(-45deg)",
                background: selected ? "#111827" : "#16a34a",
                border: "3px solid white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
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

      {popupStation && (
        <Popup
          longitude={popupStation.location.coordinates[0]}
          latitude={popupStation.location.coordinates[1]}
          anchor="bottom"
          closeOnClick={false}
          onClose={() => setPopupStationId(null)}
          maxWidth="320px"
        >
          {(() => {
            const power = getPowerInfo(popupStation.power);

            const address = popupStation.physical_address?.formatted_address
              ?.filter(Boolean)
              .join(", ");

            return (
              <div
                style={{
                  minWidth: 230,
                  padding: 4,
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    marginBottom: 6,
                  }}
                >
                  {popupStation.name}
                </div>

                {address && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "#6b7280",
                      marginBottom: 12,
                      lineHeight: 1.4,
                    }}
                  >
                    {address}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                    marginBottom: 12,
                  }}
                >
                  <span
                    style={{
                      padding: "4px 7px",
                      borderRadius: 6,
                      background: "#f0fdf4",
                      color: "#15803d",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {power.maxPower > 0 ? `${power.maxPower} kW` : "Charger"}
                  </span>

                  <span
                    style={{
                      padding: "4px 7px",
                      borderRadius: 6,
                      background: "#f3f4f6",
                      color: "#374151",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {power.total} charger
                    {power.total !== 1 ? "s" : ""}
                  </span>

                  <span
                    style={{
                      padding: "4px 7px",
                      borderRadius: 6,
                      background: power.available > 0 ? "#eff6ff" : "#f3f4f6",
                      color: power.available > 0 ? "#2563eb" : "#6b7280",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {power.available} available
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectStation(popupStation.id);
                    setPopupStationId(null);
                  }}
                  style={{
                    width: "100%",
                    border: "none",
                    borderRadius: 7,
                    padding: "8px 10px",
                    background: "#111827",
                    color: "white",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  View station
                </button>
              </div>
            );
          })()}
        </Popup>
      )}
    </Map>
  );
}

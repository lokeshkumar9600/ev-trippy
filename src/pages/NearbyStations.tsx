import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import {
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Paper,
  Slider,
  ScrollArea,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconCurrentLocation, IconMapPin, IconPlug, IconRefresh } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

import { GET_STATIONS_AROUND } from "../graphql/queries";
import NearbyStationsMap from "../components/NearbyStationsMap";

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
  external_id: string;
  name: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  elevation: number | null;
  physical_address: {
    continent: string | null;
    country: string | null;
    county: string | null;
    city: string | null;
    street: string | null;
    number: string | null;
    postal_code: string | null;
    what_3_words: string | null;
    formatted_address: string[];
  };
  amenities: Record<string, number>;
  power: Record<string, PowerInfo>;
};

type StationsData = {
  stationAround: Station[];
};

function getPowerInfo(power: Record<string, PowerInfo>) {
  const entries = Object.entries(power ?? {});

  let total = 0;
  let available = 0;
  let maxPower = 0;

  for (const [powerValue, info] of entries) {
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

export default function NearbyStations() {
  const navigate = useNavigate();

  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

  const [locationLoading, setLocationLoading] = useState(true);

  const [locationError, setLocationError] = useState<string | null>(null);

  const [distanceKm, setDistanceKm] = useState(5);

  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setLocationLoading(false);
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        console.log("Location found:", {
          latitude,
          longitude,
          accuracy: position.coords.accuracy,
        });

        setCoordinates({
          latitude,
          longitude,
        });

        /*
         * IMPORTANT:
         * Clear any previous error after a successful
         * location request.
         */
        setLocationError(null);
        setLocationLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error.code, error.message);

        setLocationLoading(false);

        if (error.code === error.PERMISSION_DENIED) {
          setLocationError(
            "Location permission was denied. Please allow location access for this site.",
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationError("Your location could not be determined. Please try again.");
        } else if (error.code === error.TIMEOUT) {
          setLocationError("Location request timed out. Please try again.");
        } else {
          setLocationError("Unable to get your location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      },
    );
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  const variables = useMemo(() => {
    if (!coordinates) {
      return undefined;
    }

    return {
      filter: {
        location: {
          type: "Point",
          coordinates: [coordinates.longitude, coordinates.latitude],
        },
        distance: distanceKm * 1000,
      },
      size: 20,
      page: 0,
    };
  }, [coordinates, distanceKm]);

  const {
    data,
    loading: stationsLoading,
    error: stationsError,
    refetch,
  } = useQuery<StationsData>(GET_STATIONS_AROUND, {
    variables,
    skip: !variables,
  });

  const stations = data?.stationAround ?? [];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f9fa",
        padding: "24px",
      }}
    >
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Text size="sm" c="dimmed" fw={600} tt="uppercase">
              EV Trip Planner
            </Text>

            <Title order={1}>Nearby charging stations</Title>

            <Text c="dimmed" mt={4}>
              Find chargers around your current location.
            </Text>
          </div>

          <Group>
            <Button
              variant="default"
              leftSection={<IconCurrentLocation size={18} />}
              loading={locationLoading}
              onClick={getUserLocation}
            >
              Use my location
            </Button>

            <Button
              variant="light"
              leftSection={<IconRefresh size={18} />}
              onClick={() => refetch()}
              disabled={!coordinates}
            >
              Refresh
            </Button>

            <Button variant="subtle" onClick={() => navigate("/")}>
              Back
            </Button>
          </Group>
        </Group>

        {/* Only show an error if we REALLY don't have coordinates */}
        {locationError && !coordinates && (
          <Paper withBorder radius="md" p="md">
            <Group justify="space-between">
              <div>
                <Text fw={600}>Could not get your location</Text>

                <Text size="sm" c="dimmed">
                  {locationError}
                </Text>
              </div>

              <Button size="sm" onClick={getUserLocation} loading={locationLoading}>
                Try again
              </Button>
            </Group>
          </Paper>
        )}

        {/* Radius */}
        <Paper withBorder radius="md" p="md">
          <Group align="flex-end" justify="space-between">
            <div
              style={{
                flex: 1,
                maxWidth: 500,
              }}
            >
              <Text fw={600} mb={4}>
                Search radius
              </Text>

              <Text size="sm" c="dimmed" mb="md">
                Showing charging stations within <strong>{distanceKm} km</strong>.
              </Text>

              <Slider
                min={1}
                max={10}
                step={1}
                value={distanceKm}
                onChange={setDistanceKm}
                label={(value) => `${value} km`}
                thumbSize={18}
                marks={[
                  { value: 1, label: "1 km" },
                  { value: 5, label: "5 km" },
                  { value: 10, label: "10 km" },
                ]}
              />
            </div>

            <Badge size="lg" variant="light" leftSection={<IconMapPin size={15} />}>
              {coordinates
                ? `${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`
                : "Locating..."}
            </Badge>
          </Group>
        </Paper>

        {/* Main layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.4fr) minmax(340px, 0.8fr)",
            gap: "20px",
            alignItems: "stretch",
          }}
        >
          {/* MAP */}
          <Paper
            withBorder
            radius="lg"
            style={{
              minHeight: 650,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <NearbyStationsMap
              coordinates={coordinates}
              stations={stations}
              selectedStationId={selectedStationId}
              onSelectStation={setSelectedStationId}
            />
          </Paper>

          {/* STATION LIST */}
          <Paper
            withBorder
            radius="lg"
            p="md"
            style={{
              minHeight: 650,
            }}
          >
            <Group justify="space-between" mb="md">
              <div>
                <Text fw={700} size="lg">
                  Chargers nearby
                </Text>

                <Text size="sm" c="dimmed">
                  {stations.length} stations found
                </Text>
              </div>

              {stationsLoading && <Loader size="sm" />}
            </Group>

            {stationsError && (
              <Paper withBorder radius="md" p="md">
                <Text fw={600}>Failed to load stations</Text>

                <Text size="sm" c="dimmed" mt={4}>
                  {stationsError.message}
                </Text>
              </Paper>
            )}

            {!stationsLoading && !stationsError && coordinates && stations.length === 0 && (
              <Paper withBorder radius="md" p="lg">
                <Stack align="center" gap="xs">
                  <IconPlug size={32} />

                  <Text fw={600}>No stations found</Text>

                  <Text size="sm" c="dimmed" ta="center">
                    Try increasing the search radius.
                  </Text>
                </Stack>
              </Paper>
            )}

            {stations.length > 0 && (
              <ScrollArea h={570} offsetScrollbars>
                <Stack gap="sm">
                  {stations.map((station) => {
                    const power = getPowerInfo(station.power);

                    const address = station.physical_address?.formatted_address
                      ?.filter(Boolean)
                      .join(", ");

                    const isSelected = selectedStationId === station.id;

                    return (
                      <Card
                        key={station.id}
                        withBorder
                        radius="md"
                        p="md"
                        style={{
                          cursor: "pointer",
                          borderWidth: isSelected ? 2 : 1,
                          transition: "all 150ms ease",
                        }}
                        onClick={() => {
                          setSelectedStationId(station.id);
                        }}
                      >
                        <Stack gap="sm">
                          <Group justify="space-between" align="flex-start">
                            <div
                              style={{
                                flex: 1,
                                minWidth: 0,
                              }}
                            >
                              <Text fw={700} lineClamp={2}>
                                {station.name}
                              </Text>

                              {address && (
                                <Text size="sm" c="dimmed" mt={4} lineClamp={2}>
                                  {address}
                                </Text>
                              )}
                            </div>

                            <Badge variant="light" leftSection={<IconPlug size={13} />}>
                              {power.maxPower > 0 ? `${power.maxPower} kW` : "Charger"}
                            </Badge>
                          </Group>

                          <Group gap="xs">
                            <Badge variant="default">
                              {power.total} charger
                              {power.total !== 1 ? "s" : ""}
                            </Badge>

                            <Badge variant={power.available > 0 ? "light" : "default"}>
                              {power.available} available
                            </Badge>

                            {station.physical_address?.city && (
                              <Badge variant="default">{station.physical_address.city}</Badge>
                            )}
                          </Group>

                          <Text size="xs" c="dimmed">
                            {station.location.coordinates[1].toFixed(5)},{" "}
                            {station.location.coordinates[0].toFixed(5)}
                          </Text>
                        </Stack>
                      </Card>
                    );
                  })}
                </Stack>
              </ScrollArea>
            )}
          </Paper>
        </div>
      </Stack>

      <style>
        {`
          @media (max-width: 900px) {
            .nearby-main-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
}

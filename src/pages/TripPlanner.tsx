import { useQuery, skipToken, useMutation } from "@apollo/client/react";
import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Container,
  Stack,
  Title,
  Text,
  Button,
  Grid,
  TextInput,
} from "@mantine/core";

import {
  CREATE_ROUTE,
  GET_VEHICLE_DETAILS,
  GET_ROUTE,
  GET_STATION
} from "../graphql/queries";

import MapView from "../components/MapView";
import { geocodeLocation } from "../lib/geocoding";

function TripPlanner() {
  const navigate = useNavigate();
  const { vehicleId } = useParams();

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [routeId, setRouteId] = useState<string | null>(null);

  const routeStatusRef = useRef<string | null>(null);

  const [createRoute, { loading: routeLoading, error: routeError }] =
    useMutation(CREATE_ROUTE);

  const {
    data: routeData,
    loading: routeQueryLoading,
    error: routeQueryError,
  } = useQuery(
    GET_ROUTE,
    routeId
      ? {
          variables: { routeId },
          pollInterval: 2000,
          skipPollAttempt: () => routeStatusRef.current === "done",
        }
      : skipToken,
  );

  const stationId =
  routeData?.getRoute?.recommended?.legs?.find(
    (leg: any) => leg.station?.station_id,
  )?.station?.station_id ?? null;

  const {
  data: stationData,
  loading: stationLoading,
  error: stationError,
} = useQuery(
  GET_STATION,
  stationId
    ? {
        variables: { stationId },
      }
    : skipToken,
);

const station = stationData?.station;

  routeStatusRef.current = routeData?.getRoute?.status ?? null;

  const { data, loading, error } = useQuery(
    GET_VEHICLE_DETAILS,
    vehicleId
      ? {
          variables: { vehicleId },
        }
      : skipToken,
  );

  const vehicle = data?.vehicle;

  const handlePlanJourney = async () => {
    if (!vehicleId || !origin || !destination) return;

    try {
      const [originCoordinates, destinationCoordinates] = await Promise.all(
        [geocodeLocation(origin), geocodeLocation(destination)],
      );

      if (!originCoordinates) {
        console.error("Could not find origin:", origin);
        return;
      }

      if (!destinationCoordinates) {
        console.error("Could not find destination:", destination);
        return;
      }

      console.log("Origin coordinates:", originCoordinates);
      console.log("Destination coordinates:", destinationCoordinates);

      const result = await createRoute({
        variables: {
          vehicleId,
          originName: origin,
          originLongitude: originCoordinates.longitude,
          originLatitude: originCoordinates.latitude,
          destinationName: destination,
          destinationLongitude: destinationCoordinates.longitude,
          destinationLatitude: destinationCoordinates.latitude,
        },
      });

      const newRouteId = result.data?.createRoute;

      if (newRouteId) {
        setRouteId(newRouteId);
      }

      console.log("Route created:", newRouteId);
    } catch (error) {
      console.error("Failed to create route:", error);
    }
  };

  return (
    <Container size="xl" py="md">
      <Stack gap="xl">
        <Button
          variant="subtle"
          onClick={() => navigate("/")}
          style={{ alignSelf: "flex-start" }}
        >
          ← Back to vehicles
        </Button>

        <div>
          <Title order={1}>Plan your EV trip</Title>

          {loading ? (
            <Text c="dimmed">Loading vehicle...</Text>
          ) : error ? (
            <Text c="red">Failed to load vehicle.</Text>
          ) : vehicle ? (
            <Text c="dimmed">
              {vehicle.naming?.make} {vehicle.naming?.model}
              {" · "}
              {vehicle.naming?.chargetrip_version || "Version not specified"}
            </Text>
          ) : (
            <Text c="red">Vehicle not found.</Text>
          )}
        </div>

        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              <div>
                <Text fw={600}>Trip details</Text>
                <Text size="sm" c="dimmed" mt="xs">
                  Enter your starting point and destination.
                </Text>
              </div>

              <TextInput
                label="From"
                placeholder="e.g. London"
                value={origin}
                onChange={(event) =>
                  setOrigin(event.currentTarget.value)
                }
              />

              <TextInput
                label="To"
                placeholder="e.g. Birmingham"
                value={destination}
                onChange={(event) =>
                  setDestination(event.currentTarget.value)
                }
              />

              <Button
                disabled={!origin || !destination || !vehicleId}
                loading={routeLoading}
                size="md"
                onClick={handlePlanJourney}
              >
                Plan journey
              </Button>

              {routeLoading && <Text c="dimmed">Creating route...</Text>}

              {routeQueryLoading && (
                <Text c="dimmed">Calculating route...</Text>
              )}

              {routeError && <Text c="red">Failed to create route.</Text>}

              {routeQueryError && (
                <Text c="red">Failed to fetch route.</Text>
              )}

              {routeData?.getRoute && (
                <Stack gap="xs">
                  <Text fw={600}>
                    Route status: {routeData.getRoute.status}
                  </Text>

                  {routeData.getRoute.status === "processing" && (
                    <Text size="sm" c="dimmed">
                      We're calculating the best route for your EV...
                    </Text>
                  )}

                  {routeData.getRoute.status === "done" &&
                    routeData.getRoute.recommended && (
                      <>
                        <Text size="sm">
                          Distance:{" "}
                          {Math.round(
                            routeData.getRoute.recommended.distance / 1000,
                          )}{" "}
                          km
                        </Text>

                        <Text size="sm">
                          Duration:{" "}
                          {Math.round(
                            routeData.getRoute.recommended.durations.total /
                              3600,
                          )}{" "}
                          hours
                        </Text>

                        <Text size="sm">
                          Charging stops:{" "}
                          {routeData.getRoute.recommended.charges}
                        </Text>
                      </>
                    )}
                </Stack>
              )}
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 8 }}>
            <MapView
              routePolyline={
                routeData?.getRoute?.recommended?.polyline ?? null
              }
              routeLegs={
                routeData?.getRoute?.recommended?.legs ?? []
              }
            />
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}

export default TripPlanner;

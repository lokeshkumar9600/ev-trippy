import { Container, Stack, Title, Text, Button, Grid } from "@mantine/core";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, skipToken } from "@apollo/client/react";
import { GET_VEHICLE_DETAILS } from "../graphql/queries";
import MapView from "../components/MapView";

function TripPlanner() {
  const navigate = useNavigate();
  const { vehicleId } = useParams();

  const { data, loading, error } = useQuery(
    GET_VEHICLE_DETAILS,
    vehicleId ? { variables: { vehicleId } } : skipToken
  );
  const vehicle = data?.vehicle;

  return (
    <Container size="xl" py="xl">
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
        <div>
            <Text fw={600}>Trip details</Text>
            <Text size="sm" c="dimmed" mt="xs">
            Your journey controls will go here.
            </Text>
        </div>
        </Grid.Col>

        <Grid.Col span={12}>
        <MapView />
        </Grid.Col>
    </Grid>
    </Stack>
    </Container>
  );
}

export default TripPlanner;
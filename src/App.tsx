import { useQuery, skipToken } from "@apollo/client/react";
import { LIST_VEHICLES, GET_VEHICLE_DETAILS } from "./graphql/queries";
import VehicleCard from "./components/VehicleCard";
import VehicleDetailsModal from "./components/VehicleDetailsModal";
import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Stack,
  Group,
  TextInput,
  Button,
} from "@mantine/core";
import { useState, useEffect } from "react";

function App() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [isPlanningTrip, setIsPlanningTrip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  const { data, previousData, loading, error } = useQuery(LIST_VEHICLES, {
    variables: { page, size: 10, search: debouncedSearch },
  });

  const { data: vehicleDetailsData, loading: vehicleDetailsLoading, error: vehicleDetailsError } = useQuery(
    GET_VEHICLE_DETAILS,
    selectedVehicle ? { variables: { vehicleId: selectedVehicle } } : skipToken
  );

  const vehicles = data?.vehicleList ?? [];
  const hasNextPage = (data?.vehicleList?.length ?? 0) === 10;
  const selectedVehicleData = vehicleDetailsData?.vehicle;

  if (loading && !data && !previousData) {
    return (
      <Container size="xl" py="xl">
        <Text>Loading vehicles...</Text>
      </Container>
    );
  }

  if (error && (!data || data.vehicleList.length === 0)) {
    return (
      <Container size="xl" py="xl">
        <Text c="red">Error: {error.message}</Text>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1}>Explore Electric Vehicles</Title>

          <TextInput
            placeholder="Search by make or model..."
            value={search}
            onChange={(event) => {
              setSearch(event.currentTarget.value);
              setPage(0);
            }}
          />

          <Text c="dimmed" mt="xs">
            Choose your EV before planning your journey.
          </Text>

          {loading && <Text size="sm" c="dimmed" mt="xs">
            Updating results...
          </Text>}
        </div>

        {vehicles.length > 0 ? (
          <>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
              {vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onSelect={() => setSelectedVehicle(vehicle.id)}
                />
              ))}
            </SimpleGrid>

            <Group justify="center" mt="md">
              <Button
                variant="default"
                disabled={page === 0 || loading}
                onClick={() => setPage((currentPage) => currentPage - 1)}
              >
                ← Previous
              </Button>
              <Text fw={500}> Page {page + 1} </Text>
              <Button
                disabled={!hasNextPage || loading}
                onClick={() => setPage((currentPage) => currentPage + 1)}
              >
                Next →
              </Button>
            </Group>
          </>
        ) : (
          <Stack align="center" gap="sm" py="xl">
            <Text size="xl" fw={600}>
              No vehicles found
            </Text>
            <Text c="dimmed">
              We couldn't find any vehicles matching "{search}".
            </Text>
            <Button
              onClick={() => {
                setSearch("");
                setPage(0);
              }}
            >
              Clear search
            </Button>
          </Stack>
        )}
      </Stack>

      <VehicleDetailsModal
        opened={!!selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
        vehicle={selectedVehicleData}
        onPlanTrip={() => {
          setSelectedVehicle(null);
          setIsPlanningTrip(true);
        }}
      />
    </Container>
  );
}

export default App;
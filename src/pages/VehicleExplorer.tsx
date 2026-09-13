import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, skipToken } from "@apollo/client/react";
import {
  Container,
  Stack,
  Title,
  Text,
  TextInput,
  SimpleGrid,
  Button,
  Group,
  Paper,
  ThemeIcon,
  Box,
  Pagination,
  Center,
  Loader,
  Alert,
  Divider,
} from "@mantine/core";
import { IconBolt, IconMapPin, IconSearch, IconArrowRight } from "@tabler/icons-react";

import { LIST_VEHICLES, GET_VEHICLE_DETAILS } from "../graphql/queries";
import VehicleCard from "../components/VehicleCard";
import VehicleDetailsModal from "../components/VehicleDetailsModal";

function VehicleExplorer() {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  const pageSize = 10;

  const { data, loading, error } = useQuery(LIST_VEHICLES, {
    variables: {
      page: page - 1,
      size: pageSize,
      search: search || undefined,
    },
  });

  const vehicles = (data as any)?.vehicleList ?? [];
  const hasNextPage = vehicles.length === pageSize;

  const {
    data: vehicleDetailsData,
    // loading: vehicleDetailsLoading,
    // error: vehicleDetailsError,
  } = useQuery(
    GET_VEHICLE_DETAILS,
    selectedVehicle
      ? {
          variables: {
            vehicleId: selectedVehicle,
          },
        }
      : skipToken,
  );

  const selectedVehicleDetails = (vehicleDetailsData as any)?.vehicle;

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSearch = (value: string) => {
    setSearchInput(value);
  };

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
      }}
    >
      <Container size="xl" py={{ base: 24, sm: 36 }}>
        <Stack gap={{ base: 32, sm: 44 } as any}>
          {/* Header */}
          <Group justify="space-between">
            <Group gap="sm">
              <ThemeIcon size={40} radius="md" color="green" variant="filled">
                <IconBolt size={22} />
              </ThemeIcon>

              <div>
                <Text fw={800} size="lg" lh={1.1}>
                  EV Trip Planner
                </Text>
                <Text size="xs" c="dimmed" mt={3}>
                  Smarter journeys, better charging
                </Text>
              </div>
            </Group>
          </Group>

          {/* Hero */}
          <Paper
            radius="xl"
            p={{ base: 28, sm: 44, md: 52 }}
            withBorder
            style={{
              position: "relative",
              overflow: "hidden",
              background: "white",
            }}
          >
            <Box
              style={{
                position: "relative",
                zIndex: 1,
                maxWidth: 720,
              }}
            >
              <Text size="sm" fw={700} c="green" tt="uppercase" style={{ letterSpacing: "0.08em" }}>
                Electric mobility
              </Text>

              <Title
                order={1}
                mt="sm"
                style={{
                  fontSize: "clamp(2.2rem, 5vw, 4rem)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.045em",
                }}
              >
                Go further.
                <br />
                <Text component="span" inherit c="green">
                  Charge smarter.
                </Text>
              </Title>

              <Text
                size="lg"
                c="dimmed"
                mt="lg"
                style={{
                  maxWidth: 600,
                  lineHeight: 1.6,
                }}
              >
                Plan EV-aware journeys, find charging stops and explore charging stations along the
                way.
              </Text>
            </Box>

            <Box
              style={{
                position: "absolute",
                width: 320,
                height: 320,
                borderRadius: "50%",
                background: "rgba(34, 197, 94, 0.07)",
                right: -120,
                top: -140,
              }}
            />

            <Box
              style={{
                position: "absolute",
                width: 180,
                height: 180,
                borderRadius: "50%",
                background: "rgba(34, 197, 94, 0.05)",
                right: 100,
                bottom: -120,
              }}
            />
          </Paper>

          {/* Main actions */}
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            <Paper
              withBorder
              radius="lg"
              p={{ base: "lg", sm: "xl" }}
              style={{
                background: "white",
                cursor: "pointer",
                transition: "transform 150ms ease, box-shadow 150ms ease",
              }}
              onClick={() =>
                document.getElementById("vehicles")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <Group align="flex-start" wrap="nowrap">
                <ThemeIcon size={48} radius="md" color="green" variant="light">
                  <IconBolt size={25} />
                </ThemeIcon>

                <Box style={{ flex: 1 }}>
                  <Title order={3}>Plan a trip</Title>

                  <Text size="sm" c="dimmed" mt={6} lh={1.5}>
                    Choose your EV and plan a route with charging stops calculated for your vehicle.
                  </Text>

                  <Button mt="lg" color="green" rightSection={<IconArrowRight size={16} />}>
                    Choose an EV
                  </Button>
                </Box>
              </Group>
            </Paper>

            <Paper
              withBorder
              radius="lg"
              p={{ base: "lg", sm: "xl" }}
              style={{
                background: "white",
                cursor: "pointer",
                transition: "transform 150ms ease, box-shadow 150ms ease",
              }}
              onClick={() => navigate("/nearby")}
            >
              <Group align="flex-start" wrap="nowrap">
                <ThemeIcon size={48} radius="md" color="blue" variant="light">
                  <IconMapPin size={25} />
                </ThemeIcon>

                <Box style={{ flex: 1 }}>
                  <Title order={3}>Find charging stations</Title>

                  <Text size="sm" c="dimmed" mt={6} lh={1.5}>
                    Explore charging stations near a location and check their power, availability
                    and operator.
                  </Text>

                  <Button
                    mt="lg"
                    color="blue"
                    variant="light"
                    rightSection={<IconArrowRight size={16} />}
                  >
                    Explore stations
                  </Button>
                </Box>
              </Group>
            </Paper>
          </SimpleGrid>

          <Divider />

          {/* Vehicle Explorer */}
          <Box id="vehicles">
            <Stack gap="lg">
              <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
                <div>
                  <Text
                    size="sm"
                    fw={700}
                    c="green"
                    tt="uppercase"
                    style={{ letterSpacing: "0.06em" }}
                  >
                    Vehicle explorer
                  </Text>

                  <Title order={2} mt={4}>
                    Choose your EV
                  </Title>

                  <Text size="sm" c="dimmed" mt={5}>
                    Select a vehicle to see its specifications and plan a journey.
                  </Text>
                </div>

                <TextInput
                  w={{ base: "100%", sm: 300 }}
                  size="sm"
                  radius="md"
                  placeholder="Search make or model..."
                  leftSection={<IconSearch size={17} />}
                  value={searchInput}
                  onChange={(event) => handleSearch(event.currentTarget.value)}
                />
              </Group>

              {loading && (
                <Center py={60}>
                  <Loader />
                </Center>
              )}

              {error && (
                <Alert color="red" title="Unable to load vehicles">
                  Something went wrong while loading the vehicles. Please try again.
                </Alert>
              )}

              {!loading && !error && vehicles.length === 0 && (
                <Paper withBorder radius="lg" p={50} bg="white">
                  <Center>
                    <Stack align="center" gap={5}>
                      <Text fw={600}>No vehicles found</Text>
                      <Text size="sm" c="dimmed">
                        Try a different make or model.
                      </Text>
                    </Stack>
                  </Center>
                </Paper>
              )}

              {!loading && !error && vehicles.length > 0 && (
                <>
                  <SimpleGrid cols={{ base: 1, sm: 2, md: 3, xl: 4 }} spacing="lg">
                    {vehicles.map((vehicle: any) => (
                      <VehicleCard
                        key={vehicle.id}
                        vehicle={vehicle}
                        onSelect={() => setSelectedVehicle(vehicle.id)}
                      />
                    ))}
                  </SimpleGrid>

                  <Center mt="md">
                    <Pagination
                      value={page}
                      onChange={setPage}
                      total={hasNextPage ? page + 1 : page}
                    />
                  </Center>
                </>
              )}
            </Stack>
          </Box>
        </Stack>
      </Container>

      <VehicleDetailsModal
        opened={selectedVehicle !== null}
        onClose={() => setSelectedVehicle(null)}
        vehicle={selectedVehicleDetails}
        onPlanTrip={() => {
          if (!selectedVehicle) return;

          navigate(`/plan-trip/${selectedVehicle}`);
          setSelectedVehicle(null);
        }}
      />
    </Box>
  );
}

export default VehicleExplorer;

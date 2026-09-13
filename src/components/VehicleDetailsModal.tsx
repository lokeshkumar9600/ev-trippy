
import {
  Modal,
  Image,
  Text,
  Title,
  Stack,
  Group,
  SimpleGrid,
  Badge,
  Divider,
  Button,
} from "@mantine/core";

type VehicleDetailsModalProps = {
  opened: boolean;
  onClose: () => void;
  vehicle: any;
  onPlanTrip: () => void;
};

function VehicleDetailsModal({
  opened,
  onClose,
  vehicle,
  onPlanTrip,
}: VehicleDetailsModalProps) {
  if (!vehicle) {
    return null;
  }

  const image = vehicle.media?.image?.url;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <div>
          <Title order={2}>
            {vehicle.naming?.make} {vehicle.naming?.model}
          </Title>

          <Text size="sm" c="dimmed">
            {vehicle.naming?.chargetrip_version || "Version not specified"}
          </Text>
        </div>
      }
      size="lg"
      centered
      scrollAreaComponent="div"
    >
      <Stack gap="lg">

        {image && (
          <Image
            src={image}
            h={250}
            fit="contain"
            alt={`${vehicle.naming?.make} ${vehicle.naming?.model}`}
          />
        )}

        <div>
          <Title order={4}>Battery & Range</Title>

          <SimpleGrid cols={{ base: 2, sm: 3 }} mt="sm">
            <div>
              <Text size="sm" c="dimmed">
                Usable battery
              </Text>
              <Text fw={600}>
                {vehicle.battery?.usable_kwh ?? "N/A"} kWh
              </Text>
            </div>

            <div>
              <Text size="sm" c="dimmed">
                Combined range
              </Text>
              <Text fw={600}>
                {vehicle.range?.best?.combined ?? "N/A"} km
              </Text>
            </div>

            <div>
              <Text size="sm" c="dimmed">
                City range
              </Text>
              <Text fw={600}>
                {vehicle.range?.best?.city ?? "N/A"} km
              </Text>
            </div>

            <div>
              <Text size="sm" c="dimmed">
                Highway range
              </Text>
              <Text fw={600}>
                {vehicle.range?.best?.highway ?? "N/A"} km
              </Text>
            </div>
          </SimpleGrid>
        </div>

        <Divider />

        <div>
          <Title order={4}>Performance</Title>

          <SimpleGrid cols={{ base: 2, sm: 3 }} mt="sm">
            <div>
              <Text size="sm" c="dimmed">
                Top speed
              </Text>
              <Text fw={600}>
                {vehicle.performance?.top_speed ?? "N/A"} km/h
              </Text>
            </div>

            <div>
              <Text size="sm" c="dimmed">
                Acceleration
              </Text>
              <Text fw={600}>
                {vehicle.performance?.acceleration ?? "N/A"} s
              </Text>
            </div>
          </SimpleGrid>
        </div>

        <Divider />

        <div>
          <Title order={4}>Charging</Title>

          <Stack gap="xs" mt="sm">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Fast charging
              </Text>

              <Badge
                color={
                  vehicle.routing?.fast_charging_support
                    ? "green"
                    : "gray"
                }
              >
                {vehicle.routing?.fast_charging_support
                  ? "Supported"
                  : "Not supported"}
              </Badge>
            </Group>

            <div>
              <Text size="sm" c="dimmed">
                Connectors
              </Text>

              <Text fw={600}>
                {vehicle.connectors
                  ?.map((connector: any) => connector.standard)
                  .filter(Boolean)
                  .join(", ") || "N/A"}
              </Text>
            </div>
          </Stack>
        </div>

        <Divider />

        <Button
          fullWidth
          size="md"
          onClick={onPlanTrip}
        >
          Plan this trip →
        </Button>

      </Stack>
    </Modal>
  );
}

export default VehicleDetailsModal;


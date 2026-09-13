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
  Paper,
} from "@mantine/core";

type VehicleDetailsModalProps = {
  opened: boolean;
  onClose: () => void;
  vehicle: any;
  onPlanTrip: () => void;
};

function VehicleDetailsModal({ opened, onClose, vehicle, onPlanTrip }: VehicleDetailsModalProps) {
  if (!vehicle) {
    return null;
  }

  const image = vehicle.media?.image?.url;

  const batteryKwh = vehicle.battery?.usable_kwh;
  const rangeBest = vehicle.range?.best;
  const rangeWorst = vehicle.range?.worst;
  const routing = vehicle.routing;
  const connectors = vehicle.connectors;
  const perf = vehicle.performance;

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
    >
      <Stack gap="lg">
        {image && (
          <Image
            src={image}
            h={250}
            fit="contain"
            alt={`${vehicle.naming?.make} ${vehicle.naming?.model}`}
            radius="md"
          />
        )}

        {/* Battery & Range */}
        <Paper withBorder p="md" radius="md">
          <Title order={4} mb="xs">
            Battery & Range
          </Title>
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs">
            <div>
              <Text size="xs" c="dimmed">
                Usable battery
              </Text>
              <Text fw={600} size="sm">
                {batteryKwh != null ? `${batteryKwh} kWh` : "N/A"}
              </Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">
                Combined range
              </Text>
              <Text fw={600} size="sm">
                {rangeBest?.combined != null ? `${rangeBest.combined} km` : "N/A"}
              </Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">
                City range
              </Text>
              <Text fw={600} size="sm">
                {rangeBest?.city != null ? `${rangeBest.city} km` : "N/A"}
              </Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">
                Highway range
              </Text>
              <Text fw={600} size="sm">
                {rangeBest?.highway != null ? `${rangeBest.highway} km` : "N/A"}
              </Text>
            </div>
          </SimpleGrid>
        </Paper>

        <Divider />

        {/* Performance */}
        <Paper withBorder p="md" radius="md">
          <Title order={4} mb="xs">
            Performance
          </Title>
          <SimpleGrid cols={{ base: 2, sm: 2 }} spacing="xs">
            <div>
              <Text size="xs" c="dimmed">
                Top speed
              </Text>
              <Text fw={600} size="sm">
                {perf?.top_speed != null ? `${perf.top_speed} km/h` : "N/A"}
              </Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">
                Acceleration
              </Text>
              <Text fw={600} size="sm">
                {perf?.acceleration != null ? `${perf.acceleration} s` : "N/A"}
              </Text>
            </div>
          </SimpleGrid>
        </Paper>

        <Divider />

        {/* Charging */}
        <Paper withBorder p="md" radius="md">
          <Title order={4} mb="xs">
            Charging
          </Title>
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                Fast charging
              </Text>
              <Badge color={routing?.fast_charging_support ? "green" : "gray"} variant="light">
                {routing?.fast_charging_support ? "Supported" : "Not supported"}
              </Badge>
            </Group>
            <div>
              <Text size="xs" c="dimmed">
                Connectors
              </Text>
              <Text fw={600} size="sm">
                {connectors
                  ?.map((c: any) => c.standard)
                  .filter(Boolean)
                  .join(", ") || "N/A"}
              </Text>
            </div>
          </Stack>
        </Paper>

        <Button fullWidth size="md" onClick={onPlanTrip} mt="md">
          Plan this trip →
        </Button>
      </Stack>
    </Modal>
  );
}

export default VehicleDetailsModal;

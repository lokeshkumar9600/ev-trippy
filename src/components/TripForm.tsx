import { Stack, Text, Button, TextInput } from "@mantine/core";

interface TripFormProps {
  origin: string;
  destination: string;
  setOrigin: (v: string) => void;
  setDestination: (v: string) => void;
  vehicleId?: string;
  routeLoading: boolean;
  onPlanJourney: () => void;
}

export default function TripForm({
  origin,
  destination,
  setOrigin,
  setDestination,
  vehicleId,
  routeLoading,
  onPlanJourney,
}: TripFormProps) {
  return (
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
        onChange={(event) => setOrigin(event.currentTarget.value)}
      />

      <TextInput
        label="To"
        placeholder="e.g. Birmingham"
        value={destination}
        onChange={(event) => setDestination(event.currentTarget.value)}
      />

      <Button
        disabled={!origin || !destination || !vehicleId}
        loading={routeLoading}
        size="md"
        onClick={onPlanJourney}
      >
        Plan journey
      </Button>
    </Stack>
  );
}

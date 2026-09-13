import { Stack, Text } from "@mantine/core";

interface RouteStatusProps {
  status?: string | null;
  loading?: boolean;
  error?: Error | null;
  queryLoading?: boolean;
  queryError?: Error | null;
  distance?: number;
  duration?: number;
  charges?: number;
}

export default function RouteStatus({
  status,
  loading,
  error,
  queryLoading,
  queryError,
  distance,
  duration,
  charges,
}: RouteStatusProps) {
  return (
    <Stack gap="xs">
      {loading && (
        <Text c="dimmed">Creating route...</Text>
      )}

      {queryLoading && (
        <Text c="dimmed">Calculating route...</Text>
      )}

      {error && (
        <Text c="red">Failed to create route.</Text>
      )}

      {queryError && (
        <Text c="red">Failed to fetch route.</Text>
      )}

      {status && (
        <Stack gap="xs">
          <Text fw={600}>Route status: {status}</Text>

          {status === "processing" && (
            <Text size="sm" c="dimmed">
              We're calculating the best route for your EV...
            </Text>
          )}

          {status === "done" && distance !== undefined && duration !== undefined && (
            <>
              <Text size="sm">Distance: {Math.round(distance / 1000)} km</Text>
              <Text size="sm">Duration: {Math.round(duration / 3600)} hours</Text>
              <Text size="sm">Charging stops: {charges ?? 0}</Text>
            </>
          )}
        </Stack>
      )}
    </Stack>
  );
}

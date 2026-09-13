import {
  Card,
  Image,
  Text,
  Badge,
  Button,
  Stack,
  Group,
  Box,
} from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";

type VehicleCardProps = {
  vehicle: {
    id: string;
    naming: {
      make: string;
      model: string;
      chargetrip_version: string | null;
    };
    media: {
      image: {
        thumbnail_url: string | null;
      } | null;
    };
  };
  onSelect: () => void;
};

function VehicleCard({ vehicle, onSelect }: VehicleCardProps) {
  const image = vehicle.media?.image?.thumbnail_url;

  return (
    <Card
      padding={0}
      radius="lg"
      withBorder
      style={{
        overflow: "hidden",
        background: "white",
        height: "100%",
        transition:
          "transform 150ms ease, box-shadow 150ms ease",
      }}
    >
      {/* Vehicle image */}
      <Box
        style={{
          background: "#f5f7f8",
          height: 190,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 18,
        }}
      >
        {image ? (
          <Image
            src={image}
            h={155}
            w="100%"
            fit="contain"
            alt={`${vehicle.naming.make} ${vehicle.naming.model}`}
          />
        ) : (
          <Text size="sm" c="dimmed">
            No image available
          </Text>
        )}
      </Box>

      {/* Details */}
      <Stack
        gap="sm"
        p="lg"
        style={{
          flex: 1,
        }}
      >
        <Group justify="space-between" align="flex-start" gap="xs">
          <div style={{ flex: 1 }}>
            <Text fw={700} size="lg" lh={1.2}>
              {vehicle.naming.make} {vehicle.naming.model}
            </Text>

            <Text size="sm" c="dimmed" mt={5} lineClamp={1}>
              {vehicle.naming.chargetrip_version ||
                "Version not specified"}
            </Text>
          </div>

          <Badge
            color="green"
            variant="light"
            size="sm"
            radius="sm"
          >
            Electric
          </Badge>
        </Group>

        <Button
          fullWidth
          mt="auto"
          variant="light"
          color="dark"
          radius="md"
          rightSection={<IconArrowRight size={16} />}
          onClick={onSelect}
        >
          View vehicle
        </Button>
      </Stack>
    </Card>
  );
}

export default VehicleCard;

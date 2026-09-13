
import { Card, Image, Text, Badge, Button, Group } from "@mantine/core";
type VehicleCardProps = {
  vehicle: {
    id: string;
    naming: { make: string; model: string; version: string | null; };
    media: { image: { thumbnail_url: string | null; } | null; };
  };
  onSelect: ()=> void;
};

function VehicleCard({ vehicle , onSelect }: VehicleCardProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
    {vehicle.media?.image?.thumbnail_url && (
      <Card.Section>
        <Image
          src={vehicle.media.image.thumbnail_url}
          height={200}
          alt={`${vehicle.naming.make} ${vehicle.naming.model}`}
        />
      </Card.Section>
    )}

    <Group justify="space-between" mt="md" mb="xs">
      <Text fw={700} size="lg">
        {vehicle.naming.make} {vehicle.naming.model}
      </Text>

      <Badge color="green" variant="light">
        Electric
      </Badge>
    </Group>

    <Text size="sm" c="dimmed">
      {vehicle.naming.version || "Version not specified"}
    </Text>

    <Button fullWidth mt="md" radius="md" onClick={onSelect}>
      View vehicle
    </Button>
  </Card>
  );
}

export default VehicleCard;

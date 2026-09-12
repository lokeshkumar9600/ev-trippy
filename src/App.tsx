import { useQuery } from "@apollo/client/react";
import { LIST_VEHICLES } from "./graphql/queries";
import VehicleCard from "./components/VehicleCard";
import { Container, Title, Text , SimpleGrid, Stack, TextInput } from "@mantine/core";
import { useState } from "react";

function App() {
  const { data, loading, error } = useQuery(LIST_VEHICLES);



   const [search, setSearch] = useState("");


   
  const filteredVehicles = data?.vehicleList.filter((vehicle)=>{
     const query = search.toLowerCase();
     return vehicle.naming.make.toLowerCase().includes(query) || vehicle.naming.model.toLowerCase().includes(query);
    
  }) ?? [];

 

  if (loading) {
    return <p>Loading vehicles...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
  <Container size="xl" py="xl">
    <Stack gap="xl">
      <div>
        <Title order={1}>
          Explore Electric Vehicles
        </Title>

        <TextInput
  placeholder="Search by make or model..."
  value={search}
  onChange={(event)=> setSearch(event.currentTarget.value)}/>

        <Text c="dimmed" mt="xs">
          Choose your EV before planning your journey.
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {filteredVehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
          />
        ))}
      </SimpleGrid>
    </Stack>
  </Container>
);
}

export default App;
type Coordinates = {
  longitude: number;
  latitude: number;
};

export async function geocodeLocation(
  query: string,
): Promise<Coordinates | null> {
  const token = import.meta.env.VITE_MAPBOX_TOKEN;

  const response = await fetch(
    `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(
      query,
    )}&access_token=${token}&limit=1`,
  );

  if (!response.ok) {
    throw new Error("Failed to find location");
  }

  const data = await response.json();

  const coordinates =
    data.features?.[0]?.geometry?.coordinates;

  if (!coordinates) {
    return null;
  }

  return {
    longitude: coordinates[0],
    latitude: coordinates[1],
  };
}
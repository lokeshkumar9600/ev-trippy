import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import polyline from "@mapbox/polyline";

import { apolloClient } from "../lib/apollo";
import { GET_STATION } from "../graphql/queries";

type RouteLeg = {
  type?: string;
  station?: {
    station_id?: string | null;
  } | null;
  destination?: {
    geometry?: {
      coordinates?: number[];
    } | null;
    properties?: {
      name?: string | null;
    } | null;
  } | null;
};

type MapViewProps = {
  routePolyline?: string | null;
  routeLegs?: RouteLeg[];
  center?: [number, number];
  zoom?: number;
};

function MapView({
  routePolyline,
  routeLegs = [],
  center = [-0.1276, 51.5072],
  zoom = 9,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center,
      zoom,
      pitch: 55,
      bearing: -20,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("style.load", () => {
      if (!map.current) return;

      map.current.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });

      map.current.setTerrain({
        source: "mapbox-dem",
        exaggeration: 1.2,
      });
    });

    return () => {
      markers.current.forEach((marker) => marker.remove());
      markers.current = [];

      map.current?.remove();
      map.current = null;
    };
  }, []);

  /*
   * Draw route
   */
  useEffect(() => {
    if (!map.current || !routePolyline) return;

    const mapInstance = map.current;

    const drawRoute = () => {
      const coordinates = polyline
        .decode(routePolyline)
        .map(([latitude, longitude]) => [longitude, latitude] as [number, number]);

      const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates,
        },
      };

      if (mapInstance.getSource("route")) {
        (mapInstance.getSource("route") as mapboxgl.GeoJSONSource).setData(geojson);
      } else {
        mapInstance.addSource("route", {
          type: "geojson",
          data: geojson,
        });

        mapInstance.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-width": 6,
            "line-opacity": 0.9,
          },
        });
      }

      /*
       * Automatically fit the map to the route
       */
      if (coordinates.length > 0) {
        const bounds = coordinates.reduce(
          (bounds, coordinate) => {
            return bounds.extend(coordinate);
          },
          new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]),
        );

        mapInstance.fitBounds(bounds, {
          padding: 80,
          duration: 1200,
          maxZoom: 12,
        });
      }
    };

    if (mapInstance.isStyleLoaded()) {
      drawRoute();
    } else {
      mapInstance.once("load", drawRoute);
    }
  }, [routePolyline]);

  /*
   * Charging station markers
   */
  useEffect(() => {
    if (!map.current || routeLegs.length === 0) return;

    const mapInstance = map.current;

    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    routeLegs.forEach((leg) => {
      if (!leg.station?.station_id) return;

      const stationId = leg.station.station_id;

      const coordinates = leg.destination?.geometry?.coordinates;

      if (!coordinates || coordinates.length < 2) return;

      const [longitude, latitude] = coordinates;

      /*
       * Create charging marker
       */
      const element = document.createElement("div");

      element.innerHTML = "⚡";

      element.style.width = "38px";
      element.style.height = "38px";
      element.style.borderRadius = "50%";
      element.style.background = "white";
      element.style.display = "flex";
      element.style.alignItems = "center";
      element.style.justifyContent = "center";
      element.style.fontSize = "22px";
      element.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
      element.style.border = "2px solid #228be6";
      element.style.cursor = "pointer";

      /*
       * Create popup container
       */
      const popupContainer = document.createElement("div");

      popupContainer.style.width = "280px";
      popupContainer.style.padding = "4px";

      popupContainer.innerHTML = `
        <div style="font-family: system-ui, sans-serif;">
          <div style="font-size: 16px; font-weight: 700; margin-bottom: 6px;">
            Charging station
          </div>

          <div style="font-size: 13px; color: #666;">
            Loading station details...
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({
        offset: 25,
        maxWidth: "320px",
      }).setDOMContent(popupContainer);

      /*
       * Fetch station details when popup opens
       */
      popup.on("open", async () => {
        console.log("Fetching station:", stationId);

        try {
          const result = await apolloClient.query({
            query: GET_STATION,
            variables: {
              stationId,
            },
            fetchPolicy: "network-only",
          });

          console.log("Station response:", result.data);

          const station = result.data?.station;

          if (!station) {
            popupContainer.innerHTML = `
              <div style="font-family: system-ui, sans-serif;">
                <div style="font-weight: 700; margin-bottom: 6px;">
                  Charging station
                </div>

                <div style="font-size: 13px; color: #d63939;">
                  Station details unavailable.
                </div>
              </div>
            `;

            return;
          }

          const chargers =
            station.chargers
              ?.map(
                (charger: any) => `
                  <div style="
                    display: flex;
                    justify-content: space-between;
                    margin-top: 4px;
                  ">
                    <span>
                      ${charger.standard || "Unknown"}
                    </span>

                    <span>
                      ${charger.power != null ? `${charger.power} kW` : "N/A"}
                    </span>
                  </div>
                `,
              )
              .join("") || "";

          popupContainer.innerHTML = `
            <div style="
              font-family: system-ui, sans-serif;
              color: #212529;
            ">

              <div style="
                font-size: 17px;
                font-weight: 700;
                margin-bottom: 4px;
              ">
                ${station.name || "Charging station"}
              </div>

              ${
                station.operator?.name
                  ? `
                    <div style="
                      font-size: 13px;
                      color: #666;
                      margin-bottom: 10px;
                    ">
                      ${station.operator.name}
                    </div>
                  `
                  : ""
              }

              ${
                station.address
                  ? `
                    <div style="
                      font-size: 13px;
                      margin-bottom: 10px;
                    ">
                      ${station.address}
                      ${station.city ? `, ${station.city}` : ""}
                    </div>
                  `
                  : ""
              }

              <div style="
                border-top: 1px solid #eee;
                padding-top: 10px;
              ">

                ${
                  station.power
                    ? `
                      <div style="
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 6px;
                      ">
                        <span style="color: #666;">
                          Max power
                        </span>

                        <strong>
                          ${Math.max(...Object.keys(station.power).map(Number))} kW
                        </strong>
                      </div>
                    `
                    : ""
                }

                ${
                  station.speed
                    ? `
                      <div style="
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 6px;
                      ">
                        <span style="color: #666;">
                          Speed
                        </span>

                        <strong>
                          ${station.speed}
                        </strong>
                      </div>
                    `
                    : ""
                }

                ${
                  station.status
                    ? `
                      <div style="
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 8px;
                      ">
                        <span style="color: #666;">
                          Status
                        </span>

                        <strong>
                          ${station.status}
                        </strong>
                      </div>
                    `
                    : ""
                }

              </div>

              ${
                chargers
                  ? `
                    <div style="
                      border-top: 1px solid #eee;
                      padding-top: 10px;
                      margin-top: 8px;
                    ">

                      <div style="
                        font-weight: 600;
                        margin-bottom: 6px;
                      ">
                        Chargers
                      </div>

                      ${chargers}

                    </div>
                  `
                  : ""
              }

              ${
                station.review?.rating != null
                  ? `
                    <div style="
                      border-top: 1px solid #eee;
                      padding-top: 10px;
                      margin-top: 10px;
                      font-size: 13px;
                    ">
                      Rating:
                      <strong>
                        ${station.review.rating}
                      </strong>
                      ${station.review.count != null ? ` (${station.review.count} reviews)` : ""}
                    </div>
                  `
                  : ""
              }

            </div>
          `;
        } catch (error) {
          console.error("Failed to fetch station details:", error);

          popupContainer.innerHTML = `
            <div style="
              font-family: system-ui, sans-serif;
            ">
              <div style="
                font-weight: 700;
                margin-bottom: 6px;
              ">
                Charging station
              </div>

              <div style="
                font-size: 13px;
                color: #d63939;
              ">
                Failed to load station details.
              </div>
            </div>
          `;
        }
      });

      /*
       * Create marker
       */
      const marker = new mapboxgl.Marker({
        element,
      })
        .setLngLat([longitude, latitude])
        .setPopup(popup)
        .addTo(mapInstance);

      markers.current.push(marker);
    });
  }, [routeLegs]);

  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "75vh",
        minHeight: "600px",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    />
  );
}

export default MapView;

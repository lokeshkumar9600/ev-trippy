import { gql } from "@apollo/client";

export const LIST_VEHICLES = gql`
  query ListVehicles($page: Int, $size: Int, $search: String) {
    vehicleList(page: $page, size: $size, search: $search) {
      id
      naming {
        make
        model
        chargetrip_version
      }
      media {
        image {
          thumbnail_url
        }
      }
    }
  }
`;

export const GET_VEHICLE_DETAILS = gql`
  query GetVehicleDetails($vehicleId: ID!) {
    vehicle(id: $vehicleId) {
      naming {
        make
        model
        chargetrip_version
      }
      media {
        image {
          url
        }
        brand {
          thumbnail_url
        }
      }
      battery {
        usable_kwh
      }
      range {
        best {
          highway
          city
          combined
        }
        worst {
          highway
          city
          combined
        }
        chargetrip_range {
          best
          worst
        }
      }
      routing {
        fast_charging_support
      }
      connectors {
        standard
      }
      performance {
        acceleration
        top_speed
      }
    }
  }
`;

export const CREATE_ROUTE = gql`
  mutation CreateRoute(
    $vehicleId: ID!
    $originName: String!
    $originLongitude: Float!
    $originLatitude: Float!
    $destinationName: String!
    $destinationLongitude: Float!
    $destinationLatitude: Float!
  ) {
    createRoute(
      input: {
        vehicle: {
          id: $vehicleId
          battery: {
            state_of_charge: {
              value: 42
              type: percentage
            }
          }
          climate: true
        }

        origin: {
          type: Feature
          properties: {
            location: {
              name: $originName
            }
            vehicle: {
              occupants: 1
            }
          }
          geometry: {
            type: Point
            coordinates: [$originLongitude, $originLatitude]
          }
        }

        destination: {
          type: Feature
          properties: {
            location: {
              name: $destinationName
            }
          }
          geometry: {
            type: Point
            coordinates: [$destinationLongitude, $destinationLatitude]
          }
        }
      }
    )
  }
`;



export const GET_ROUTE = gql`
  query GetRoute($routeId: ID!) {
    getRoute(id: $routeId) {
      id
      status

      recommended {
        id
        charges

        distance(unit: meter)

        durations {
          total
          charging
          driving
          stopover
          ferry
        }

        consumption
        range_at_origin(unit: kilometer)
        range_at_destination(unit: kilometer)

        polyline(decimals: five)

        legs {
          type
          distance(unit: meter)

          durations {
            total
            charging
            driving
            stopover
            ferry
          }

          consumption

          origin {
            geometry {
              type
              coordinates
            }
            properties {
              name
              station_id
              external_station_id
              duration
              occupants
            }
          }

          destination {
            geometry {
              type
              coordinates
            }
            properties {
              name
              station_id
              external_station_id
              duration
              occupants
            }
          }

          station {
            station_id
          }

          polyline(decimals: five)
          tags
        }
      }
    }
  }
`;

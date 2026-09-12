import { gql } from '@apollo/client';

export const LIST_VEHICLES = gql`
  query ListVehicles {
    vehicleList(size: 9, page: 0) {
      id

      naming {
        make
        model
        version
        edition
      }

      connectors {
        standard
      }

      media {
        image {
          id
          type
          thumbnail_url
          thumbnail_height
          thumbnail_width
        }

        make {
          id
          type
          thumbnail_url
          thumbnail_height
          thumbnail_width
        }
      }
    }
  }
`;
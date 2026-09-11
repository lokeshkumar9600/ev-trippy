import { ApolloClient, HttpLink, InMemoryCache, gql } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";


const httpLink = new HttpLink({
  uri: "https://api.chargetrip.io/graphql",
  headers: {
    "x-client-id": import.meta.env.VITE_CHARGETRIP_CLIENT_ID,
    "x-app-id": import.meta.env.VITE_CHARGETRIP_APP_ID,
  },
});


export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});


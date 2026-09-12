import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ApolloProvider } from "@apollo/client/react";
import { apolloClient } from './lib/apollo.ts';
import './index.css'
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <MantineProvider>
        <ApolloProvider client={apolloClient}>
      <App />
    </ApolloProvider>
     </MantineProvider>
  </StrictMode>,
)

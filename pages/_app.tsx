import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { LivepeerConfig } from "@livepeer/react";
import { ThemeProvider } from "../utils";
import { Toaster } from "react-hot-toast";
import { ApolloProvider } from "@apollo/client";
import { apolloClient, LivePeerClient } from '../clients';
import { WagmiConfig } from "wagmi";
import { AuthContextProvider } from "../context/auth";
import { RainbowAuthProvider } from "../context/RainbowAuthProvider";
import {client as wagmiClient} from '../constants/config'
import { NextUIProvider } from '@nextui-org/react';

function MyApp({ Component, pageProps }) {
  
  return (

    <ApolloProvider client={apolloClient}>
    <AuthContextProvider>
      <WagmiConfig client={wagmiClient}>
          <ThemeProvider>
        <RainbowAuthProvider>
              <LivepeerConfig client={LivePeerClient}>
                <NextUIProvider>
                  <Component {...pageProps} />
                  </NextUIProvider>
                <Toaster />
              </LivepeerConfig>
        </RainbowAuthProvider>
          </ThemeProvider>
      </WagmiConfig>
    </AuthContextProvider>
            </ApolloProvider>
  );
}

export default MyApp;

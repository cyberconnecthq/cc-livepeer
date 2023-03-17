import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { LivepeerConfig } from "@livepeer/react";
import { ThemeProvider } from "../utils";
import { Toaster } from "react-hot-toast";
import { ApolloProvider } from "@apollo/client";
import { apolloClient, LivePeerClient } from "../clients";
import { WagmiConfig } from "wagmi";
import { AuthContextProvider } from "../context/auth";
import { RainbowAuthProvider } from "../context/RainbowAuthProvider";
import { client as wagmiClient } from "../constants/config";
import { NextUIProvider } from "@nextui-org/react";

function MyApp({ Component, pageProps }) {
  return (
    //  ApolloProvider is a wrapper around the Apollo Client
    <ApolloProvider client={apolloClient}>
      {/* AuthContextProvider is a wrapper around the Wagmi AuthContext */}
      <AuthContextProvider>
        {/* WagmiConfig is a wrapper around the Wagmi client */}
        <WagmiConfig client={wagmiClient}>
          {/* ThemeProvider is a wrapper around the theme context */}
          <ThemeProvider>
            {/* RainbowAuthProvider is a wrapper around the RainbowKitAuthenticationProvider */}
            <RainbowAuthProvider>
              {/* LivepeerConfig is a wrapper around the Livepeer client */}
              <LivepeerConfig client={LivePeerClient}>
                <NextUIProvider>
                  <Component {...pageProps} />
                </NextUIProvider>
                {/* Toaster is a wrapper around the react-hot-toast library */}
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

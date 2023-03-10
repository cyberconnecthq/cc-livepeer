import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { LivepeerConfig } from "@livepeer/react";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  trustWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { ThemeProvider } from "../utils";
import { Toaster } from "react-hot-toast";
import { ApolloProvider } from "@apollo/client";
import { apolloClient, LivePeerClient } from '../clients';

import { Chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { mainnet, goerli, bsc, bscTestnet } from "wagmi/chains";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { publicProvider } from "wagmi/providers/public";
import { AuthContextProvider } from "../context/auth";
import { RainbowAuthProvider } from "../context/RainbowAuthProvider";
import {chains, client as wagmiClient} from '../constants/config'
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

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

export const availableChains = [bsc, bscTestnet]; // mainnet, goerli

const NODEREAL_RPCS = {
  [mainnet.id]: {
    http: `https://eth-mainnet.nodereal.io/v1/${process.env.NEXT_PUBLIC_NODEREAL_API_KEY}`,
  },
  [goerli.id]: {
    http: `https://eth-goerli.nodereal.io/v1/${process.env.NEXT_PUBLIC_NODEREAL_API_KEY}`,
  },
  [bsc.id]: {
    http: `https://bsc-mainnet.nodereal.io/v1/${process.env.NEXT_PUBLIC_NODEREAL_API_KEY}`,
  },
  [bscTestnet.id]: {
    http: `https://bsc-testnet.nodereal.io/v1/${process.env.NEXT_PUBLIC_NODEREAL_API_KEY}`,
  },
};
const rpc = {
  // [mainnet.id]: NODEREAL_RPCS[mainnet.id].http,
  [goerli.id]: NODEREAL_RPCS[goerli.id].http,
  [bsc.id]: NODEREAL_RPCS[bsc.id].http,
  // [bscTestnet.id]: NODEREAL_RPCS[bscTestnet.id].http,
};

const providers = [
  jsonRpcProvider({
    rpc: (chain) => {
      if (
        chain.id === mainnet.id ||
        chain.id === goerli.id ||
        chain.id === bsc.id ||
        chain.id === bscTestnet.id
      ) {
        return {
          http: NODEREAL_RPCS[chain.id].http,
        };
      }
      return null;
    },
  }),
  publicProvider(),
];

export const { chains, provider, webSocketProvider } = configureChains(
  availableChains,
  providers
);

const connectors = connectorsForWallets([
  {
    groupName: "Suggested",
    wallets: [
      injectedWallet({ chains }),
      metaMaskWallet({ chains }),
      walletConnectWallet({ chains }),
      rainbowWallet({ chains }),
      coinbaseWallet({ chains, appName: "CyberConnect" }),
      // argentWallet({ chains }),
      trustWallet({ chains }),
    ],
  },
]);

export const CONNECTOR_MAP = {
  MetaMask: new MetaMaskConnector({
    chains,
    options: { shimDisconnect: false, shimChainChangedDisconnect: true },
  }),
  WalletConnect: new WalletConnectConnector({
    chains,
    options: {
      qrcode: true,
      rpc,
    },
  }),
  Injected: new InjectedConnector({
    chains,
    options: {
      name: "Injected",
    },
  }),
};

export const wagmiClient = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
  connectors,
});

function MyApp({ Component, pageProps }) {
  return (

            <ApolloProvider client={apolloClient}>
    <AuthContextProvider>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains}>
          <ThemeProvider>
              <LivepeerConfig client={LivePeerClient}>
                <Component {...pageProps} />
                <Toaster />
              </LivepeerConfig>
          </ThemeProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </AuthContextProvider>
            </ApolloProvider>
  );
}

export default MyApp;

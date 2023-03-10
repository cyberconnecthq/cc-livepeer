import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  trustWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { Chain, configureChains, createClient } from 'wagmi'
import { mainnet, goerli, bsc, bscTestnet } from 'wagmi/chains'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { publicProvider } from 'wagmi/providers/public'

// bsc.name = 'BNB Chain'
export const availableChains = [bsc, bscTestnet]; // mainnet, goerli

const NODEREAL_RPCS = {
  [mainnet.id]: {
    http: `https://eth-mainnet.nodereal.io/v1/${process.env.NEXT_PUBLIC_NODEREAL_API_KEY}`,
    // webSocket: `wss://eth-mainnet.nodereal.io/ws/v1/${process.env.NEXT_PUBLIC_NODEREAL_API_KEY}`,
  },
  [goerli.id]: {
    http: `https://eth-goerli.nodereal.io/v1/${process.env.NEXT_PUBLIC_NODEREAL_API_KEY}`,
    // webSocket: `wss://eth-goerli.nodereal.io/ws/v1/${process.env.NEXT_PUBLIC_NODEREAL_API_KEY}`,
  },
  [bsc.id]: {
    http: `https://bsc-mainnet.nodereal.io/v1/${process.env.NEXT_PUBLIC_NODEREAL_API_KEY}`,
    // webSocket: `wss://bsc-mainnet.nodereal.io/ws/v1/${process.env.NEXT_PUBLIC_NODEREAL_API_KEY}`,
  },
  [bscTestnet.id]: {
    http: `https://bsc-testnet.nodereal.io/v1/${process.env.NEXT_PUBLIC_NODEREAL_API_KEY}`,
    // webSocket: `wss://bsc-testnet.nodereal.io/ws/v1/${process.env.NEXT_PUBLIC_NODEREAL_API_KEY}`,
  },
}
const rpc = {
  // [mainnet.id]: NODEREAL_RPCS[mainnet.id].http,
  // [goerli.id]: NODEREAL_RPCS[goerli.id].http,
  [bsc.id]: NODEREAL_RPCS[bsc.id].http,
  [bscTestnet.id]: NODEREAL_RPCS[bscTestnet.id].http,
}

const providers = [
  jsonRpcProvider({
    rpc: (chain: Chain) => {
      if (chain.id === mainnet.id || chain.id === goerli.id || chain.id === bsc.id || chain.id === bscTestnet.id) {
        return {
          http: NODEREAL_RPCS[chain.id].http,
        }
      }
      return null
    },
  }),
  publicProvider(),
]
// @ts-ignore: Unreachable code error
export const { chains, provider, webSocketProvider } = configureChains(availableChains, providers)

const connectors = connectorsForWallets([
  {
    groupName: 'Suggested',
    wallets: [
      injectedWallet({ chains }),
      metaMaskWallet({ chains }),
      walletConnectWallet({ chains }),
      rainbowWallet({ chains }),
      coinbaseWallet({ chains, appName: 'CyberConnect' }),
      // argentWallet({ chains }),
      trustWallet({ chains }),
    ],
  },
])

export const CONNECTOR_MAP = {
  MetaMask: new MetaMaskConnector({
    chains,
    options: { shimDisconnect: false, shimChainChangedDisconnect: true },
  }),
  WalletConnect: new WalletConnectConnector({
    chains,
    options: {
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
      showQrModal: true,
      // rpc,
    },
  }),
  Injected: new InjectedConnector({
    chains,
    options: {
      name: 'Injected',
    },
  }),
}

export const client = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
  connectors,
})
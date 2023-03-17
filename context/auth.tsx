import { ReactNode, createContext, useState, useEffect } from "react";
import { Web3Provider } from "@ethersproject/providers";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import { ExternalProvider } from "@ethersproject/providers";
import { IAuthContext, IPrimaryProfileCard, IPostCard } from "../types";
import { PRIMARY_PROFILE, RELAY_ACTION_STATUS } from "../graphql";
import { useCancellableQuery } from "../hooks/useCancellableQuery";
import { useLazyQuery } from "@apollo/client";
import { useAccount } from "wagmi";
import { ACCESS_TOKEN_KEY, WALLET_KEY } from "../constants";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

// This AuthContext is used to store the authentication state as well as the indexing state of essences and connected profiles
export const AuthContext = createContext<IAuthContext>({
  address: undefined,
  accessToken: undefined,
  primaryProfile: undefined,
  indexingPosts: [],
  setAccessToken: () => {},
  setPrimaryProfile: () => {},
  setIndexingPosts: () => {},
  connectWallet: async () => new Promise(() => {}),
  checkNetwork: async () => new Promise(() => {}),
  isLoggedIn: false,
  setIsLoggedIn: () => {},
});
AuthContext.displayName = "AuthContext";

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  // Hooks
  /* Hook to get the account */
  const { address: wagmiAddress, status } = useAccount({
    onConnect() {
      setAddress(wagmiAddress);
    },
    onDisconnect() {
      setIsLoggedIn(false);
    },
  });

  /* Hook to get the router */
  const router = useRouter();
  /* State variable to store the provider */
  const [provider, setProvider] = useState<Web3Provider | undefined>(undefined);
  /* State variable to store the address */
  const [address, setAddress] = useState<string | undefined>(wagmiAddress);
  /* State variable to store the access token */
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
  /* State variable to store the primary profile */
  const [primaryProfile, setPrimaryProfile] = useState<
    IPrimaryProfileCard | undefined
  >(undefined);
  /* State variable to store indexing posts */
  const [indexingPosts, setIndexingPosts] = useState<IPostCard[]>([]);
  /* State variable to store indexing accounts */
  const [getRelayActionStatus] = useLazyQuery(RELAY_ACTION_STATUS);
  /* State variable to store the logged in state */
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    setIsLoggedIn(
      address &&
        status === "connected" &&
        !!window.localStorage[ACCESS_TOKEN_KEY] &&
        window.localStorage[WALLET_KEY] == address
    );
  }, [address, status]);

  useEffect(() => {
    let _indexingPosts = indexingPosts;

    async function sync(indexingPostsParam) {
      indexingPostsParam.forEach(async (post: any) => {
        const res = await getRelayActionStatus({
          variables: { relayActionId: post.relayActionId },
          fetchPolicy: "network-only",
        });

        console.log("res 3000", res.data.relayActionStatus);

        if (res.data.relayActionStatus.txStatus === "SUCCESS") {
          toast.success("Post successfully relayed");
          console.log("indexingPostsParam", indexingPostsParam);
          _indexingPosts = [];
          const filtered = indexingPostsParam.filter(
            (item: any) => item.relayActionId !== post.relayActionId
          );
          console.log("filtered", filtered);
          setIndexingPosts([]);
          router.push(`/profile`);
        } else if (res.data.relayActionStatus?.reason) {
          toast.error(res.data.relayActionStatus?.reason);
          const filtered = indexingPostsParam.filter(
            (item: any) => item.relayActionId !== post.relayActionId
          );
          console.log("filtered", filtered);
          setIndexingPosts([]);
        }

        if (_indexingPosts?.length > 0) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          console.log("length of indexing posts", _indexingPosts.length);
          console.log("indexing posts", _indexingPosts);
          await sync(_indexingPosts);
        }
      });
    }

    if (address && indexingPosts?.length > 0) {
      sync(_indexingPosts);
    }
  }, [indexingPosts, address]);

  
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const address = localStorage.getItem("address");
    console.log("setting access token and address", accessToken, address);
    if (accessToken && address) {
      setAccessToken(accessToken);
    }
  }, []);

  useEffect(() => {
    /* Check if the user connected with wallet */
    if (!(provider && address)) return;

    try {
      /* Function to check if the network is the correct one */
      checkNetwork(provider);
    } catch (error) {
      /* Display error message */
      alert(error.message);
    }
  }, [provider, address]);

  useEffect(() => {
    if (!(address && accessToken)) return;
    let query: any;

    const fetch = async () => {
      try {
        /* Fetch primary profile */
        query = useCancellableQuery({
          query: PRIMARY_PROFILE,
          variables: {
            address: address,
          },
        });
        const res = await query;

        /* Get the primary profile */
        const primaryProfile = res?.data?.address?.wallet?.primaryProfile;

        /* Set the primary profile */
        setPrimaryProfile(primaryProfile);
      } catch (error) {
        /* Display error message */
        console.error(error);
      }
    };
    fetch();

    return () => {
      query.cancel();
    };
  }, [address, accessToken]);

  /* Function to connect with MetaMask wallet */
  const connectWallet = async () => {
    try {
      /* Function to detect most providers injected at window.ethereum */
      const detectedProvider =
        (await detectEthereumProvider()) as ExternalProvider;

      /* Check if the Ethereum provider exists */
      if (!detectedProvider) {
        throw new Error("Please install MetaMask!");
      }

      /* Ethers Web3Provider wraps the standard Web3 provider injected by MetaMask */
      const web3Provider = new ethers.providers.Web3Provider(
        detectedProvider,
        "any"
      );
      // const provider = getProvider() as ExternalProvider
      // provider.send
      // web3Provider = markRaw(web3Provider)
      /* Connect to Ethereum. MetaMask will ask permission to connect user accounts */
      await web3Provider.send("eth_requestAccounts", []);

      /* Get the signer from the provider */
      const signer = web3Provider.getSigner();

      /* Get the address of the connected wallet */
      const address = await signer.getAddress();

      /* Set the providers in the state variables */
      setProvider(web3Provider);

      /* Set the address in the state variable */
      // setAddress(address);
      localStorage.setItem("address", address);

      return web3Provider;
    } catch (error) {
      /* Throw the error */
      throw error;
    }
  };

  /* Function to check if the network is the correct one */
  const checkNetwork = async (provider: Web3Provider) => {
    try {
      /* Get the network from the provider */
      const network = await provider.getNetwork();

      /* Check if the network is the correct one */
      if (network.chainId !== (Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 0)) {
        /* Switch network if the chain id doesn't correspond to Goerli Testnet Network */
        await provider.send("wallet_switchEthereumChain", [
          {
            chainId:
              "0x" + Number(process.env.NEXT_PUBLIC_CHAIN_ID)?.toString(16),
          },
        ]);

        /* Trigger a page reload */
        window.location.reload();
      }
    } catch (error) {
      /* This error code indicates that the chain has not been added to MetaMask */
      if (error.code === 4902) {
        await provider.send("wallet_addEthereumChain", [
          {
            chainId:
              "0x" + Number(process.env.NEXT_PUBLIC_CHAIN_ID)?.toString(16),
            rpcUrls: ["https://goerli.infura.io/v3/"],
          },
        ]);

        /* Trigger a page reload */
        window.location.reload();
      } else {
        /* Throw the error */
        throw error;
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        address,
        accessToken,
        primaryProfile,
        indexingPosts,
        setAccessToken,
        setPrimaryProfile,
        setIndexingPosts,
        checkNetwork,
        connectWallet,
        isLoggedIn,
        setIsLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

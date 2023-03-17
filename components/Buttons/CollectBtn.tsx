import { useContext, useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_COLLECT_ESSENCE_TYPED_DATA, RELAY } from "../../graphql";
import { AuthContext } from "../../context/auth";
import { Button, Spacer, Loading } from "@nextui-org/react";
import { Address, erc20ABI, erc721ABI, useAccount, useContractReads, useContractWrite, useNetwork, usePrepareContractWrite, useSigner, useWaitForTransaction } from 'wagmi';
import  ABI from '../../constants/ABI.json';
import { BigNumber } from 'ethers';
import toast from "react-hot-toast";
import { CC_PROFILE_CONTRACT_ADDRESS } from "../../constants/config";
import { BUSD_CONTRACT_ADDRESS } from "../../constants";
import handleCollectEntryError from "../../utils/functions";

function CollectBtn({
	profileID,
	essenceID,
	isCollectedByMe,
	collectMw,
	nftAddress
}: {
	profileID: number;
	essenceID: number;
	isCollectedByMe: boolean;
	collectMw: Record<string, any>;
	nftAddress: Address;
}) {
	const { accessToken, connectWallet, checkNetwork, setIndexingPosts, indexingPosts ,primaryProfile } = useContext(AuthContext);
	const [createCollectEssenceTypedData] = useMutation(
		CREATE_COLLECT_ESSENCE_TYPED_DATA
	);
	const [relay] = useMutation(RELAY);
	const [stateCollect, setStateCollect] = useState(isCollectedByMe);
	const [loading, setLoading] = useState(false);	
	// const [totalCollected, setTotalCollected] = useState<BigNumber>();
	// const [isUserCollected, setIsUserCollected] = useState(false);
	// const [readContractsLoading, setReadContractsLoading] = useState(true);
	const [erc20UserBalance, setErc20UserBalance] = useState<BigNumber>();

	const { chain } = useNetwork()
	const { address: loggedInAddress } = useAccount()
	let paidCurrency= BUSD_CONTRACT_ADDRESS as Address;
	let paidAmount = "1000000000000000000";

	if (collectMw?.type !== "COLLECT_FREE") {
		const collectMwData = JSON.parse(collectMw?.data)
		paidCurrency = collectMwData?.Currency
		paidAmount = collectMwData?.Amount
	}
	  const erc20UserBalanceContract = {
		address: paidCurrency as Address,
		abi: erc20ABI,
		functionName: 'balanceOf' as const,
		chainId: chain.id,
		args: [loggedInAddress] as [Address],
	  };
	  const contracts = [erc20UserBalanceContract]; //nftAddress ? [totalCollectedContract, isUserCollectedContract, erc20UserBalanceContract] : 
	  const { data: readsData, refetch: refetchRead } = useContractReads({
		contracts: contracts,
		onSuccess(data) {
		  const _erc20UserBalance = data[0];
		  setErc20UserBalance(_erc20UserBalance)
		},
	  });
	  
	const { config: erc20Config, error } = usePrepareContractWrite({
		address: paidCurrency,
		abi: erc20ABI,
		functionName: 'approve',
		// @ts-ignore: Unreachable code error
		args: [collectMw.contractAddress, BigNumber.from(paidAmount), {
			gasLimit: 1300000,
		}],
		
	  })
	const { write: writeAllowance, data: erc20Data, isLoading: erc20IsLoading, isSuccess: erc20IsSuccess} = useContractWrite(erc20Config)
	const { isLoading, isSuccess } = useWaitForTransaction({
		hash: erc20Data?.hash,
	  })
	const { config: collectConfig } = usePrepareContractWrite({
		address: CC_PROFILE_CONTRACT_ADDRESS[chain.id] as Address,
		abi: ABI,
		functionName: 'collect',
		// chainId: chain.id,
		args: [{ collector: loggedInAddress, profileId: profileID, essenceId: essenceID}, '0x', '0x',{
			gasLimit: 1300000,
		},],
		onError: async function (error) {
		  const message = handleCollectEntryError(error);
		  toast.error(message);
		  setLoading(false);
		  return;
		},
	  });
	  const {
		data: collectData,
		write: writeCollect,
		writeAsync: writeCollectAsync,
		isSuccess: collectIsSuccess,
		isLoading: contractWriteLoading,
	  } = useContractWrite({
		...collectConfig,
		async onMutate(data) {
			console.log('Mutate data ', data)
		  },
		async onSettled(data, error) {
		  console.log('Settled', { data, error })
		  setLoading(false);
		},
		async onSuccess(data) {
		  console.log('Success', data);
		  setLoading(true);
		  await data.wait();
		  await refetchRead();
		  setLoading(false);
	  	},
		  async onError(error) {
			console.log('CollectWrite Error', error);
		}});

	useEffect(() => {
		/* Set the state to true */	
		setStateCollect(true);
		setLoading(false);
	}, [collectIsSuccess]);

	const handleOnClick = async () => {
		try {
			/* Check if the user logged in */
			if (!accessToken) {
				throw Error("You need to Sign in.");
			}
			setLoading(true);
			/* Connect wallet and get provider */
			const provider = await connectWallet();

			/* Check if the network is the correct one */
			await checkNetwork(provider);

			/* Get the signer from the provider */
			const signer = provider.getSigner();

			/* Get the address from the provider */
			const address = await signer.getAddress();
			
			if (collectMw?.type == "COLLECT_PAID") {
				await refetchRead();
				if (erc20UserBalance?.lt(BigNumber.from(paidAmount))) {
					throw Error("You don't have enough balance to collect this essence.");
				}
				writeAllowance?.()
				console.log("calling writeCollect")
				writeCollect?.()

			} else {
				/* Get the network from the provider */
				const network = await provider.getNetwork();
	
				/* 1. Create typed data in a readable format */
				const typedDataResult = await createCollectEssenceTypedData({
					variables: {
						input: {
							collector: address,
							profileID: profileID,
							essenceID: essenceID,
						},
					},
				});
				const typedData =
					typedDataResult.data?.createCollectEssenceTypedData?.typedData;
				const message = typedData.data;
				const typedDataID = typedData.id;
	
				/* 2. Get the signature for the message signed with the wallet */
				const params = [address, message];
				const method = "eth_signTypedData_v4";
				const signature = await signer.provider.send(method, params);
	
				/* 3. Call the relay to broadcast the transaction */
				const relayResult = await relay({
					variables: {
						input: {
							typedDataID: typedDataID,
							signature: signature,
						},
					},
				});
				const relayActionId = relayResult.data.relay.relayActionId;
	
				const relayingPost = {
					createdBy: {
						handle: primaryProfile?.handle,
						avatar: primaryProfile?.avatar,
						metadata: primaryProfile?.metadata,
						profileID: primaryProfile?.profileID,
					},
					essenceID: 0, // Value will be updated once it's indexed
					tokenURI: undefined,
					isIndexed: false,
					isCollectedByMe: false,
					collectMw: undefined,
					   metadata_id: undefined,
					relayActionId: relayActionId,
				};
	
				localStorage.setItem(
					"indexingPosts",
					JSON.stringify([...indexingPosts, relayingPost])
				);
				/* Set the indexingPosts in the state variables */
				setIndexingPosts([...indexingPosts, relayingPost]);
				/* Display success message */
				  toast("Your essence is being relayed...", {icon:'⏳'})
	
				/* Set the state to true */
				setStateCollect(true);
				setLoading(false);
	
				/* Display success message */
				toast.success("Post was collected!");
			}
	

		} catch (error) {
			/* Display error message */
			const message = error.message as string;
			toast.error(message)
			
		}
	};
	const { isLoading: waitCollectIsLoading, isSuccess: waitCollectIsSuccess } = useWaitForTransaction({
		hash: collectData?.hash,
	  })

	return (
		<Button
			onClick={handleOnClick}
			disabled={stateCollect}
			auto
		>
			{loading ? <Loading color="currentColor" size="sm" /> : stateCollect ? "Collected" : "Collect"}
		</Button>
	);
}

export default CollectBtn;

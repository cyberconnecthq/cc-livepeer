import { useContext, useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_COLLECT_ESSENCE_TYPED_DATA, RELAY } from "../../graphql";
import { AuthContext } from "../../context/auth";
import { Button, Spacer, Loading } from "@nextui-org/react";
import { Address, erc20ABI, erc721ABI, useAccount, useContractReads, useContractWrite, useNetwork, usePrepareContractWrite, useSigner } from 'wagmi';
import  ABI from '../../constants/ABI.json';
import { BigNumber } from 'ethers';
import toast from "react-hot-toast";
import { CC_PROFILE_CONTRACT_ADDRESS } from "../../constants/config";
import handleCollectEntryError from "../../utils/functions";
import { BUSD_CONTRACT_ADDRESS } from "../../constants";

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
	const { accessToken, connectWallet, checkNetwork, setIndexingPosts, indexingPosts, primaryProfile } = useContext(AuthContext);
	const [createCollectEssenceTypedData] = useMutation(
		CREATE_COLLECT_ESSENCE_TYPED_DATA
	);
	const [relay] = useMutation(RELAY);
	const [stateCollect, setStateCollect] = useState(isCollectedByMe);
	const [loading, setLoading] = useState(false);	
	const [totalCollected, setTotalCollected] = useState<BigNumber>();
	const [isUserCollected, setIsUserCollected] = useState(false);
	const [readContractsLoading, setReadContractsLoading] = useState(true);
	const { chain } = useNetwork()
	const { address: loggedInAddress } = useAccount()
	let paidCurrency= "" as Address;
	let paidAmount = BigNumber.from(0);

	const collectMwData = JSON.parse(collectMw?.data)
	if (collectMw?.type !== "COLLECT_FREE") {
		paidCurrency = collectMwData?.Currency
		paidAmount = BigNumber.from(collectMwData?.Amount);
	}
	const totalCollectedContract = {
		address: nftAddress,
		abi: erc721ABI,
		functionName: 'totalSupply' as const,
		chainId: chain.id,
	  };
	const isUserCollectedContract = {
		address: nftAddress,
		abi: erc721ABI,
		functionName: 'balanceOf' as const,
		chainId: chain.id,
		args: [loggedInAddress] as [Address],
		};
	const userBusdBalance = {
		address: paidCurrency as Address,
		abi: erc20ABI,
		functionName: 'balanceOf' as const,
		chainId: chain.id,
		args: [loggedInAddress] as [Address],
		};
	const essencePaidCollect = {
		address: paidCurrency as Address,
		abi: erc20ABI,
		functionName: 'balanceOf' as const,
		chainId: chain.id,
		args: [loggedInAddress] as [Address],
		};
	console.log("totalCollectedContract", totalCollectedContract);
	console.log("isUserCollectedContract", isUserCollectedContract);
	console.log("userBusdBalance", userBusdBalance);
	const { data: readsData, refetch: refetchRead } = useContractReads({
	contracts: [totalCollectedContract, isUserCollectedContract, userBusdBalance],
	onSuccess(data) {
		console.log("data", data);
		setReadContractsLoading(false);
		const _totalCollected = data[0];
		const _isUserCollected = data[1]?.toNumber() > 0;
		const _userBusdBalance = data[2];
		console.log("totalCollected", _totalCollected.toString());
		console.log("isUserCollected", _isUserCollected);
		console.log("userBusdBalance", _userBusdBalance.toString());
		setTotalCollected(_totalCollected);
		setIsUserCollected(_isUserCollected);
	},
	});
	// Allowance 
	const { config: erc20Config, error } = usePrepareContractWrite({
		address: paidCurrency,
		abi: erc20ABI,
		functionName: 'approve',
		args: [collectMw.contractAddress, paidAmount],
		
	  })
	const { write: writeAllowance, data, isLoading, isSuccess: allowanceIsSuccess} = useContractWrite(erc20Config)
	// Collect
	const { config } = usePrepareContractWrite({
		address: CC_PROFILE_CONTRACT_ADDRESS[chain.id] as Address,
		abi: ABI,
		functionName: 'collect',
		chainId: chain.id,
		args: [{ collector: loggedInAddress, profileID, essenceID }, '0x', '0x'],
		onError: async function (error) {
		  const message = handleCollectEntryError(error);
		  toast.error(message);
		  setLoading(false);
		  return;
		},
	  });
	  const {
		data: txData,
		write: writeCollect,
		isSuccess: isCollectSuccess,
		isLoading: contractWriteLoading,
	  } = useContractWrite({
		...config,
		async onSuccess(data) {
		  console.log('Success', data);
		  setLoading(true);
		  await data.wait();
		  await refetchRead();
		  setLoading(false);
		},
	  });
	// console.log('readsData', readsData);
	

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

				writeAllowance?.()				
				if (allowanceIsSuccess) {
					console.log("allowanceIsSuccess", allowanceIsSuccess)
					writeCollect?.()
					console.log("isCollectSuccess", isCollectSuccess)
					
				}
				
			}
	
			/* Get the network from the provider */
			const network = await provider.getNetwork();

			/* Create typed data in a readable format */
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

			/* Get the signature for the message signed with the wallet */
			const params = [address, message];
			const method = "eth_signTypedData_v4";
			const signature = await signer.provider.send(method, params);

			/* Call the relay to broadcast the transaction */
			const relayResult = await relay({
				variables: {
					input: {
						typedDataID: typedDataID,
						signature: signature,
					},
				},
			});

			const relayActionId = relayResult.data.relay.relayActionId;

			/* Close Post Modal */
			// handleModal(null, "");

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
				"collectingPosts",
				JSON.stringify([...indexingPosts, relayingPost])
			);
			/* Set the collectingPosts in the state variables */
			setIndexingPosts([...indexingPosts, relayingPost]);

			/* Display success message */
      		toast("Your essence is being relayed...", {icon:'⏳'}) //info("Your essence is being relayed.");

			/* Set the state to true */
			setStateCollect(true);
			setLoading(false);

			/* Display success message */
			toast.success("Post was collected!");
		} catch (error) {
			/* Display error message */
			const message = error.message as string;
			toast.error(message)
			
		}
	};

	return (
		<Button
			// className="collect-btn"
			onClick={handleOnClick}
			disabled={stateCollect}
			auto
		>
			{loading ? <Loading color="currentColor" size="sm" /> : stateCollect ? "Collected" : "Collect"}
		</Button>
	);
}

export default CollectBtn;

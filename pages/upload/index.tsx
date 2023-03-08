import React, { useState, useEffect,useContext, useRef } from 'react'
import { Sidebar, Header } from '../../layout'
import { BiCloud, BiPlus } from 'react-icons/bi'
import { useAsset, useCreateAsset } from '@livepeer/react'
import { UploadInput, Background } from '../../components'
import { pinFileToIPFS } from '../../utils'
import toast from 'react-hot-toast'
import RegisterEssence from '../../hooks/createEssence'
import { IEssenceMetadata, IRegisterEssenceVideo, Media, Attribute} from '../../types'
import { useMutation, useLazyQuery } from "@apollo/client";
import { pinJSONToIPFS, getEssenceSVGData } from "../../utils";
import {
	CREATE_REGISTER_ESSENCE_TYPED_DATA,
	RELAY,
	RELAY_ACTION_STATUS,
} from "../../graphql";
import { randPhrase } from "@ngneat/falso";
import { AuthContext } from "../../context/auth";
import { v4 as uuidv4 } from "uuid";
import { ESSENCE_APP_ID } from "../../constants";
import getImage from "../../lib/getImage";

export default function Upload() {
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [category, setCategory] = useState<string>('')
  const [location, setLocation] = useState<string>('')
  const [thumbnail, setThumbnail] = useState<File>()
  const [uploadData, setUploadData] = useState({})
  const [video, setVideo] = useState<File>()
  const [videoProgress, setVideoProgress] = useState([]);
  const [thumbnailCID, setThumbnailCID] = useState<string>('');
  const thumbnailRef = useRef<HTMLInputElement>(null);
  ////////////////////////////////////////////////////////////
  const {
		primaryProfile,
		indexingPosts,
		connectWallet,
		checkNetwork,
    accessToken
	} = useContext(AuthContext);
  // let accessToken = null;
	// if (typeof window !== 'undefined') {
	// 	// Perform localStorage action
	// 	const accessToken = localStorage.getItem("accessToken");
	//   }
	const [createRegisterEssenceTypedData] = useMutation(
		CREATE_REGISTER_ESSENCE_TYPED_DATA
	);
	const [getRelayActionStatus] = useLazyQuery(RELAY_ACTION_STATUS);
	const [relay] = useMutation(RELAY);
  const [relayActionId, setRelayActionId] = useState<string | null>(null);
  // sign in 
  // console.log("access token", accessToken)


	const registerEssence = async ({ livepeerId, video, title, description, location, category, thumbnail, UploadedDate, middleware }: IRegisterEssenceVideo) => {
		try {
			/* Check if the user logged in */
			// if (!accessToken) {
      //   console.log("no access token")
			// 	throw Error("You need to Sign in.");
			// }

			/* Check if the has signed up */
			if (!primaryProfile?.profileID) {
				throw Error("Youn need to mint a profile.");
			}

			/* Connect wallet and get provider */
			const provider = await connectWallet();

			/* Check if the network is the correct one */
			await checkNetwork(provider);

			/* Function to render the svg data for the NFT */
			/* (default if the user doesn't pass a image url) */
			const svg_data = getEssenceSVGData();
            const category_attribute: Attribute = {
                trait_type: "category",
                value: category,
                display_type: "string"
            }
            const livepeer_id_attribute: Attribute = {
                trait_type: "livepeer_id",
                value: livepeerId,
                display_type: "string"
            }
            const media: Media = {
                media_type: "video/mp4",
                media_url: video,
                alt_tag: title,
                preview_image_url: thumbnail,
            }
			/* Construct the metadata object for the Essence NFT */
			const metadata: IEssenceMetadata = {
				metadata_id: uuidv4(),
				version: "1.0.0",
				app_id: ESSENCE_APP_ID,
				lang: "en",
				issue_date: new Date().toISOString(),
				content: description || randPhrase(),
				media: [media],
				tags: ['video', 'livepeer'],
				image: thumbnail ? getImage(thumbnail) : "",
				image_data: !thumbnail ? svg_data : "",
				name: `@${primaryProfile?.handle}'s post`,
				description: `@${primaryProfile?.handle}'s post on CyberConnect Content app`,
				animation_url: "",
				external_url: "",
				attributes: [category_attribute, livepeer_id_attribute],
			};

			/* Upload metadata to IPFS */
			const ipfsHash = await pinJSONToIPFS(metadata);

			/* Get the signer from the provider */
			const signer = provider.getSigner();

			/* Get the address from the provider */
			const address = await signer.getAddress();

			/* Get the network from the provider */
			const network = await provider.getNetwork();

			/* Create typed data in a readable format */
			const typedDataResult = await createRegisterEssenceTypedData({
				variables: {
					input: {
						/* The profile id under which the Essence is registered */
						profileID: primaryProfile?.profileID,
						/* Name of the Essence */
						name: title,
						/* Symbol of the Essence */
						symbol: "POST",
						/* URL for the json object containing data about content and the Essence NFT */
						tokenURI: `https://cyberconnect.mypinata.cloud/ipfs/${ipfsHash}`,
						/* Middleware that allows users to collect the Essence NFT for free */
						middleware:
							middleware === "free"
								? { collectFree: true }
								: {
									collectPaid: {
										/* Address that will receive the amount */
										recipient: address,
										/* Number of times the Essence can be collected */
										totalSupply: "1000",
										/* Amount that needs to be paid to collect essence */
										amount: "1000000000000000000",
										/* The currency for the  amount. Chainlink token contract on Goerli */
										currency: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
										/* If it require that the collector is also subscribed */
										subscribeRequired: false,
									},
								},
						/* Set if the Essence should be transferable or not */
						transferable: true,
					},
				},
			});

			const typedData =
				typedDataResult.data?.createRegisterEssenceTypedData?.typedData;
			const message = typedData.data;
			const typedDataID = typedData.id;

			/* Get the signature for the message signed with the wallet */
			const fromAddress = await signer.getAddress();
			const params = [fromAddress, message];
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
				tokenURI: `https://cyberconnect.mypinata.cloud/ipfs/${ipfsHash}`,
				isIndexed: false,
				isCollectedByMe: false,
				collectMw: undefined,
				relayActionId: relayActionId,
			};

			localStorage.setItem(
				"relayingPosts",
				JSON.stringify([...indexingPosts, relayingPost])
			);
			/* Set the indexingPosts in the state variables */
			// setIndexingPosts([...indexingPosts, relayingPost]);

			/* Display success message */
            toast.success("Post was created!");
		} catch (error) {
			/* Set the indexingPosts in the state variables */
			// setIndexingPosts([...indexingPosts]);

			/* Display error message */
			const message = error.message as string;
			toast.error(message);
		}
	};
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const {
    mutate: createAsset,
    data: assets,
    status,
    progress,
    error,
  } = useCreateAsset(
    video
      ? {
          sources: [{ name: title, file: video }],
        }
      : null
  );

  console.log('assets:', assets);
  console.log('status:', status);
  console.log('error', error);
  console.log('progress:', progress);

  useEffect(() => {
    if (progress && progress.length) setVideoProgress(progress[0]);
  }, [progress]);
 // UseEffect to save the video to the blockchain
  useEffect(() => {
    const asyncSaveVideo = async () => {
    // check if the uploadData is not empty
    // if (Object.keys(uploadData).length !== 0) {
    if (assets) {
      let data: IRegisterEssenceVideo = {
        livepeerId: assets[0]?.id,
        video: assets[0]?.playbackUrl,
        title,
        description,
        location,
        category,
        thumbnail: thumbnailCID?.ipfshash || "",
        UploadedDate: Date.now().toString(),
        middleware: "free"
      };
      console.log("register essence data:", data)
      // Calling the saveVideo function and passing the metadata object
      // console.log('data:', data);
      // setUploadData(data);
      const relayActionId = await registerEssence(data);
      console.log('uploadData:', uploadData);
      console.log('relayActionId:', relayActionId);
    }};
    asyncSaveVideo();
  }, [assets]);


  const goBack = () => {
    window.history.back();
  };
  useEffect(() => {
    if (status === 'success') {
      toast.success('Video uploaded successfully');

    }}, [status]);

  // When a user clicks on the upload button
  const handleSubmit = async () => {
    console.log('title:', title);
    console.log('file:', video);
    // Calling the upload video function
    // await uploadVideo();
    const createAssetResponse = await createAsset?.();
    console.log('createAssetResponse:', createAssetResponse);

    // Calling the upload thumbnail function and getting the CID
    const thumbnailCID = await uploadThumbnail();
    
    console.log('thumbnailCID:', thumbnailCID);
    if (thumbnailCID) {
      setThumbnailCID(thumbnailCID);
    }
    
    // Creating a object to store the metadata
    // let data: IRegisterEssenceVideo = {
    //   video: assets?.playbackUrl,
    //   title,
    //   description,
    //   location,
    //   category,
    //   thumbnail: String(thumbnailCID),
    //   UploadedDate: Date.now().toString(),
    //   middleware: "free"
    // };
    // console.log("register essence data:", data)
    // // Calling the saveVideo function and passing the metadata object
    // console.log('data:', data);
    // setUploadData(data);
    // await saveVideo(data);
  };

  // Function to upload the video to IPFS
  const uploadThumbnail = async () => {
    // Passing the file to the pinFileToIPFS function and getting the CID
    const cid = await pinFileToIPFS(thumbnail);
    // Returning the CID
    return cid;
  };

  // Function to upload the video to Livepeer
  const uploadVideo = async () => {
    // Calling the createAsset function from the useCreateAsset hook to upload the video
    createAsset?.();
  };

  // Function to save the video to the Contract
  // const saveVideo = async (data: IRegisterEssenceVideo) => {    
  //   // Upload the video to the contract
  //   const relayActionId = await RegisterEssence(data);
  //   return relayActionId
  // };

  return (
    <Background>
      <p className="text-2xl font-bold text-white">
        {videoProgress && videoProgress.progress * 100}
      </p>
      <div className="flex h-screen w-full flex-row">
        <Sidebar updateCategory={(e) => setCategory(e)} />
        <div className="flex flex-1 flex-col">
          <Header />
          <div className="mt-5 mr-10 flex  justify-end">
            <div className="flex items-center">
              <button
                className="mr-6  rounded-lg border border-gray-600 bg-transparent py-2  px-6  dark:text-[#9CA3AF]"
                onClick={() => {
                  goBack();
                }}
              >
                Discard
              </button>
              <button
                onClick={handleSubmit}
                className="flex flex-row items-center  justify-between  rounded-lg bg-blue-500 py-2 px-4 text-white hover:bg-blue-700"
              >
                <BiCloud />
                <p className="ml-2">{progress?.[0]
            ? `${progress?.[0]?.phase} - ${(
                progress?.[0]?.progress * 100
              ).toFixed()}%`
            : "Upload"}</p>
              </button>
              {assets?.map((asset) => (
                  <div key={asset.id}>
                    <div>
                      <div>Asset Name: {asset?.name}</div>
                      <div>Playback URL: {asset?.playbackUrl}</div>
                      <div>IPFS CID: {asset?.storage?.ipfs?.cid ?? 'None'}</div>
                    </div>
                  </div>
                ))}
                {error && <div>{error.message}</div>}
            </div>
          </div>
          <div className="m-10 mt-5 flex 	flex-col  lg:flex-row">
            <div className="flex flex-col lg:w-3/4 ">
              <label className="text-sm text-gray-600  dark:text-[#9CA3AF]">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Rick Astley - Never Gonna Give You Up (Official Music Video)"
                className="border-borderWhiteGray mt-2  h-12  w-[90%] rounded-md border bg-transparent p-2 focus:outline-none dark:border-[#444752]  dark:text-white dark:placeholder:text-gray-600"
              />
              <label className="mt-10 text-sm text-gray-600 dark:text-[#9CA3AF]">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Never Gonna Give You Up was a global smash on its release in July 1987, topping the charts in 25 countries including Rick’s native UK and the US Billboard Hot 100.  It also won the Brit Award for Best single in 1988. Stock Aitken and Waterman wrote and produced the track which was the lead-off single and lead track from Rick’s debut LP “Whenever You Need Somebody."
                className="border-borderWhiteGray mt-2  h-32 w-[90%] rounded-md  border bg-transparent p-2 focus:outline-none dark:border-[#444752]  dark:text-white dark:placeholder:text-gray-600"
              />

              <div className="mt-10 flex w-[90%] flex-row  justify-between">
                <div className="flex w-2/5 flex-col	">
                  <label className="text-sm text-gray-600  dark:text-[#9CA3AF]">Location</label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    type="text"
                    placeholder="Bali - Indonesia"
                    className="border-borderWhiteGray mt-2 h-12 rounded-md  border bg-transparent p-2 focus:outline-none dark:border-[#444752]  dark:text-white dark:placeholder:text-gray-600"
                  />
                </div>
                <div className="flex w-2/5 flex-col	">
                  <label className="text-sm text-gray-600  dark:text-[#9CA3AF]">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className=" border-borderWhiteGray mt-2 h-12  rounded-md border bg-transparent p-2 focus:outline-none dark:border-gray-600  dark:text-white dark:text-[#9CA3AF]"
                  >
                    <option>Music</option>
                    <option>Sports</option>
                    <option>Gaming</option>
                    <option>News</option>
                    <option>Entertainment</option>
                    <option>Education</option>
                    <option>Science & Technology</option>
                    <option>Travel</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <label className="mt-10 text-sm  text-gray-600 dark:text-[#9CA3AF]">Thumbnail</label>

              <div
                onClick={() => {
                  thumbnailRef.current.click();
                }}
                className="border-borderWhiteGray mt-2 flex  h-36 w-64 items-center justify-center rounded-md  border-2 border-dashed p-2 dark:border-gray-600"
              >
                {thumbnail ? (
                  <img
                    onClick={() => {
                      thumbnailRef.current.click();
                    }}
                    src={URL.createObjectURL(thumbnail)}
                    alt="thumbnail"
                    className="h-full rounded-md"
                  />
                ) : (
                  <BiPlus size={40} color="gray" />
                )}
              </div>

              <input
                type="file"
                className="hidden"
                ref={thumbnailRef}
                onChange={(e) => {
                  setThumbnail(e.target.files[0]);
                }}
              />
            </div>

            <UploadInput isAudio={false} setVideo={setVideo} />
          </div>
        </div>
      </div>
    </Background>
  );
}

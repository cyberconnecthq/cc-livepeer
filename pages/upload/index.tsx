import React, { useState, useEffect, useContext, useRef } from "react";
import { Sidebar, Header } from "../../layout";
import { BiCloud, BiPlus } from "react-icons/bi";
import { AiOutlineDollarCircle } from "react-icons/ai";
import { useCreateAsset } from "@livepeer/react";
import { UploadInput, Background } from "../../components";
import { pinFileToIPFS } from "../../utils";
import toast from "react-hot-toast";
import {
  IEssenceMetadata,
  IRegisterEssenceVideo,
  Media,
  Attribute,
  IMiddlewareProps,
} from "../../types";
import { useMutation, useLazyQuery } from "@apollo/client";
import { pinJSONToIPFS, getEssenceSVGData } from "../../utils";
import { CREATE_REGISTER_ESSENCE_TYPED_DATA, RELAY } from "../../graphql";
import { randPhrase } from "@ngneat/falso";
import { AuthContext } from "../../context/auth";
import { v4 as uuidv4 } from "uuid";
import {
  ESSENCE_APP_ID,
  MIN_MINT_PRICE,
  MAX_MINT_PRICE,
  BUSD_CONTRACT_ADDRESS,
} from "../../constants";
import getImage from "../../lib/getImage";
import { Input, Switch } from "@nextui-org/react";

export default function Upload() {
  const {
    primaryProfile,
    indexingPosts,
    setIndexingPosts,
    connectWallet,
    checkNetwork,
    address,
    accessToken,
  } = useContext(AuthContext);

  const defaultMiddleware: IMiddlewareProps = {
    recipient: address,
    totalSupply: "1000",
    amount: "1000000000000000000",
    currency: BUSD_CONTRACT_ADDRESS,
    subscribeRequired: false,
  };

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [thumbnail, setThumbnail] = useState<File>();
  const [video, setVideo] = useState<File>();

  const [videoProgress, setVideoProgress] = useState<any>([]);
  const [thumbnailCID, setThumbnailCID] = useState<any>("");
  const thumbnailRef = useRef<HTMLInputElement>(null);
  const [showMiddleware, setShowMiddleware] = useState<boolean>(false);
  const [middleware, setMiddleware] =
    useState<IMiddlewareProps>(defaultMiddleware);
  ////////////////////////////////////////////////////////////

  const [createRegisterEssenceTypedData] = useMutation(
    CREATE_REGISTER_ESSENCE_TYPED_DATA
  );
  const [relay] = useMutation(RELAY);

  const handleAmountChange = (event) => {
    let value = Number(event.target.value);
    if (isNaN(value)) {
      value = 0.01;
    } else if (value > MAX_MINT_PRICE) {
      value = MAX_MINT_PRICE;
    } else if (value < MIN_MINT_PRICE) {
      value = MIN_MINT_PRICE;
    }
    setMiddleware({ ...middleware, amount: String(value * 10 ** 18) });
  };

  const registerEssence = async ({
    livepeerId,
    video,
    title,
    description,
    location,
    category,
    thumbnail,
    UploadedDate,
  }: IRegisterEssenceVideo) => {
    try {
      /* Check if the user logged in */
      if (!accessToken) {
        console.log("no access token");
        throw Error("You need to Sign in.");
      }

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

      /* Construct the attributes for the Essence NFT */
      const category_attribute: Attribute = {
        trait_type: "category",
        value: category,
        display_type: "string",
      };
      const livepeer_id_attribute: Attribute = {
        trait_type: "livepeer_id",
        value: livepeerId,
        display_type: "string",
      };
      /* Construct the media object for the Essence NFT */
      const media: Media = {
        media_type: "video/mp4",
        media_url: video,
        alt_tag: title,
        preview_image_url: thumbnail,
      };
      /* Construct the metadata object for the Essence NFT */
      const metadata: IEssenceMetadata = {
        metadata_id: uuidv4(),
        version: "1.0.0",
        app_id: ESSENCE_APP_ID,
        lang: "en",
        issue_date: new Date().toISOString(),
        content: description || randPhrase(),
        media: [media],
        tags: ["video", "livepeer"],
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

      /* Create typed data in a readable format */
      const typedDataResult = await createRegisterEssenceTypedData({
        variables: {
          input: {
            /* The profile id under which the Essence is registered */
            profileID: primaryProfile?.profileID,
            /* Name of the Essence */
            name: title,
            /* Symbol of the Essence */
            symbol: "VIDEO",
            /* URL for the json object containing data about content and the Essence NFT */
            tokenURI: `https://cyberconnect.mypinata.cloud/ipfs/${ipfsHash}`,
            /* Middleware that allows users to collect the Essence NFT for free */
            middleware: !showMiddleware
              ? { collectFree: true }
              : { collectPaid: middleware },
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
        metadata_id: undefined,
        relayActionId: relayActionId,
      };

      /* Set the indexingPosts in the state variables */
      setIndexingPosts([...indexingPosts, relayingPost]);

      /* Display success message */
      toast("Your essence is being relayed...", { icon: "⏳" }); //info("Your essence is being relayed.");
    } catch (error) {
      /* Set the indexingPosts in the state variables */
      setIndexingPosts([...indexingPosts]);
      /* Display error message */
      const message = error.message as string;
      toast.error(message);
    }
  };
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  // Hook to Upload video to Livepeer
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

  console.log("assets:", assets);
  console.log("status:", status);
  console.log("error", error);
  console.log("progress:", progress);

  useEffect(() => {
    if (progress && progress.length) setVideoProgress(progress?.[0]);
  }, [progress]);

  useEffect(() => {
    const asyncSaveVideo = async () => {
      // check if the assets are available
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
        };
        console.log("register essence data:", data);
        await registerEssence(data);
      }
    };
    asyncSaveVideo();
  }, [assets]);

  const goBack = () => {
    window.history.back();
  };
  useEffect(() => {
    if (status === "success") {
      toast.success("Video uploaded successfully");
    }
  }, [status]);

  // Function to upload the thumbnail to IPFS
  const uploadThumbnail = async () => {
    // Passing the file to the pinFileToIPFS function and getting the CID
    const cid = await pinFileToIPFS(thumbnail);
    // Returning the CID
    return cid;
  };

  // When a user clicks on the upload button
  const handleSubmit = async () => {
    // Calling the create asset function from Livepeer SDK
    const createAssetResponse = await createAsset?.();
    console.log("createAssetResponse:", createAssetResponse);
    // Calling the upload thumbnail function and getting the CID
    const thumbnailCID = await uploadThumbnail();
    if (thumbnailCID) {
      setThumbnailCID(thumbnailCID);
    }
  };


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
                <p className="ml-2">
                  {progress?.[0]
                    ? `${progress?.[0]?.phase} - ${(
                        progress?.[0]?.progress * 100
                      ).toFixed()}%`
                    : "Upload"}
                </p>
              </button>
              {error && <div>{error.message}</div>}
            </div>
          </div>
          <div className="m-10 mt-5 flex 	flex-col  lg:flex-row">
            <div className="flex flex-col lg:w-3/4 ">
              <label className="text-sm text-gray-600  dark:text-[#9CA3AF]">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Rick Astley - Never Gonna Give You Up (Official Music Video)"
                className="border-borderWhiteGray mt-2  h-12  w-[90%] rounded-md border bg-transparent p-2 focus:outline-none dark:border-[#444752]  dark:text-white dark:placeholder:text-gray-600"
              />
              <label className="mt-10 text-sm text-gray-600 dark:text-[#9CA3AF]">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Never Gonna Give You Up was a global smash on its release in July 1987, topping the charts in 25 countries including Rick’s native UK and the US Billboard Hot 100.  It also won the Brit Award for Best single in 1988. Stock Aitken and Waterman wrote and produced the track which was the lead-off single and lead track from Rick’s debut LP “Whenever You Need Somebody."
                className="border-borderWhiteGray mt-2  h-32 w-[90%] rounded-md  border bg-transparent p-2 focus:outline-none dark:border-[#444752]  dark:text-white dark:placeholder:text-gray-600"
              />

              <div className="mt-10 flex w-[90%] flex-row  justify-between">
                <div className="flex w-2/5 flex-col	">
                  <label className="text-sm text-gray-600  dark:text-[#9CA3AF]">
                    Location
                  </label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    type="text"
                    placeholder="San Francisco - CA"
                    className="border-borderWhiteGray mt-2 h-12 rounded-md  border bg-transparent p-2 focus:outline-none dark:border-[#444752]  dark:text-white dark:placeholder:text-gray-600"
                  />
                </div>
                <div className="flex w-2/5 flex-col	">
                  <label className="text-sm text-gray-600  dark:text-[#9CA3AF]">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="border-borderWhiteGray mt-2 h-12  rounded-md border bg-transparent p-2 focus:outline-none dark:border-gray-600  dark:text-white"
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

              <div className="mt-10 flex w-[90%] flex-row  justify-between">
                <div>
                  <label className="mt-10 text-sm  text-gray-600 dark:text-[#9CA3AF]">
                    Thumbnail
                  </label>
                  <div
                    onClick={() => {
                      thumbnailRef.current.click();
                    }}
                    className="border-borderWhiteGray mt-2 flex  h-36 w-64 items-center justify-center rounded-md  border-2 border-dashed p-2 dark:border-gray-600"
                  >
                    {thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
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
                <div className="flex w-2/5 flex-col	">
                  <label className="text-sm text-gray-600  dark:text-[#9CA3AF]">
                    Pay to Collect
                  </label>
                  <Switch
                    size="xl"
                    icon={<AiOutlineDollarCircle />}
                    onChange={(e) => {
                      setShowMiddleware(e.target.checked);
                    }}
                  />
                  {showMiddleware && (
                    <div className="flex flex-col">
                      <label className="text-sm text-gray-600  dark:text-[#9CA3AF]">
                        Price
                      </label>
                      <Input
                        bordered
                        labelLeft="$"
                        labelRight="BUSD"
                        placeholder="1.00"
                        value={Number(middleware.amount) / 10 ** 18}
                        onChange={handleAmountChange}
                      />
                      <label className="text-sm text-gray-600  dark:text-[#9CA3AF]">
                        Total Supply
                      </label>
                      <Input
                        bordered
                        labelRight="tokens"
                        placeholder={"1000000000000000000"}
                        type="number"
                        value={middleware.totalSupply}
                        onChange={(e) =>
                          setMiddleware({
                            ...middleware,
                            totalSupply: String(e.target.value),
                          })
                        }
                      />
                      <label className="text-sm text-gray-600  dark:text-[#9CA3AF]">
                        Require Subscribe
                      </label>
                      <Switch
                        size="xl"
                        initialChecked={middleware.subscribeRequired}
                        onChange={(e) => {
                          setMiddleware({
                            ...middleware,
                            subscribeRequired: e.target.checked,
                          });
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <UploadInput isAudio={false} setVideo={setVideo} />
          </div>
        </div>
      </div>
    </Background>
  );
}

import React, { useContext, useEffect, useState } from "react";
import { Background, Video } from "../../components";
import { Header, Sidebar } from "../../layout";
import { apolloClient } from "../../clients";
import { GET_ALL_ESSENCE_VIDEOS } from "../../graphql";
import { essenceResponseToVideo } from "../../utils";
import { AuthContext } from "../../context/auth";
import { ESSENCE_APP_ID} from "../../constants";
import { BiCloud } from "react-icons/bi";
import Link from "next/link";
export default function Home() {
  const [videos, setVideos] = useState<String[]>([]);
  const [loading, setLoading] = useState<Boolean>(true);
  const [query, setQuery] = useState<String>("");
  const [category, setCategory] = useState<String>("");
  const { address } = useContext(AuthContext);


  const fetchVideos = async () => {
    setLoading(true);
    apolloClient.query({
      query: GET_ALL_ESSENCE_VIDEOS,
      variables: {
        appID: ESSENCE_APP_ID,
        me: address || "0x0000000000000000000000000000000000000000",
      },
      fetchPolicy: "network-only",
    }).then(({ data }) => {
      const essenceNodes = data.essencesBy?.edges.map((edge: any) => edge.node) || [];
      const parsedVideos = essenceNodes.map((essence: any) => essenceResponseToVideo(essence));
      let filteredVideos = parsedVideos
      if (category !== "" && category !== "All"){
        filteredVideos = parsedVideos.filter((video) =>  video.category === category )  
      }
      setVideos(filteredVideos);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchVideos();
  }, [query, category]);

  return (
    <Background className="w-full">
      <div className="w-full flex flex-row">
        <Sidebar updateCategory={setCategory} />
        <div className="flex-1 h-screen flex flex-col">
          {/* <Header search={(text) => setQuery(text)} /> */}
          <Header />
          <div className="flex flex-row flex-wrap">
            {loading ? (
              <>
                {Array(10)
                  .fill(0)
                  .map((_, index) => (
                    <div key={index} className="w-80">
                      <Loader />
                    </div>
                  ))}
              </>
            ) : (
              videos?.length === 0 ? (
                  <div className="m-96 object-center">
                    <h3 className="text-text-light font-bold leading-tighter tracking-tighter mb-4 dark:text-text-dark">
                      {`No videos found in the ${category} category`}
                    </h3>
                      <Link href="/upload">
                      <div>
                      {`👇 Upload one now`}
                          <button
                            onClick={() => { }}
                            className="flex flex-row items-center  justify-between  rounded-lg bg-blue-500 py-2 px-4 text-white hover:bg-blue-700"
                          >
                            <BiCloud />
                            <p className="ml-2">{"Upload"}</p>
                          </button>
                      </div>
                      </Link>
                      
                  </div>
              ) 
              :
              videos?.map((video: any) => (
                <Video key={video.id} video={video} horizontal={false} />
              ))
            )}
          </div>
        </div>
      </div>
    </Background>
  );
}

const Loader = () => {
  return (
    <div className="flex flex-col m-5 animate-pulse">
      <div className="w-full bg-gray-300 dark:bg-border-dark h-40 rounded-lg "></div>
      <div className="w-50 mt-3 bg-gray-300 dark:bg-border-dark h-6 rounded-md "></div>
      <div className="w-24 bg-gray-300 h-3 dark:bg-border-dark  mt-3 rounded-md "></div>
    </div>
  );
};

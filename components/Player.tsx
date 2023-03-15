import React from "react";
import { useAsset } from "@livepeer/react";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";

interface PlayerProps {
  id: any;
}

const Player: React.FC<PlayerProps> = ({ id }) => {
  const { data: asset } = useAsset(id);

  try {

    return (
      <Plyr
        source={{
          type: "video",
          title: asset?.name,
          sources: [
            {
              src: asset?.downloadUrl,
              type: "video/mp4",
            },
          ],
        }}
        options={{
          autoplay: true,
        }}
        autoPlay={true}
      />
    );
    
  } catch (error) {
    return (
      <Plyr
        source={{
          type: "video",
          title: 'Example title',
          sources: [
            {
              src: '/assets/video-not-found.mp4',
              type: "video/mp4",
              size: 720,
            },
          ],
        }}
        options={{
          autoplay: true,
        }}
        autoPlay={true}
      />
    )
  }
  
};

export default Player;

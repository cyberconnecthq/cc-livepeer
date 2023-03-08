import React from "react";
import { useAsset } from "@livepeer/react";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";

interface PlayerProps {
  id: any;
}

const Player: React.FC<PlayerProps> = ({ id }) => {

  try {
    const { data: asset } = useAsset(id);

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
    const plyrProps = {
      // https://github.com/sampotts/plyr#the-source-setter
      source: {
        type: 'video',
        title: 'Example title',
        sources: [
          {
            src: '/assets/video-not-found.mp4',
            type: 'video/mp4',
            size: 720,
          },
        ],
      }, 
      options: {
        autoplay: true,
      }, // https://github.com/sampotts/plyr#options
      // Direct props for inner video tag (mdn.io/video)
    }
    return (
      <Plyr {...plyrProps} />
    )
  }
  
};

export default Player;

import moment from "moment";
import Link from "next/link";
import React from "react";
import { BiCheck, BiCollection } from "react-icons/bi";
import getImage from "../lib/getImage";
import { IVideo } from "../types";
import {BsCollectionFill, BsCollection} from 'react-icons/bs'
import { Colors } from "../constants/colors";
// import Image from "next/image"
// import { Image } from "@nextui-org/react";

interface IProps {
  video: IVideo;
  horizontal?: boolean;
}

const Video: React.FC<IProps> = ({ video, horizontal }) => {
  console.log("video", video)
  return (
    <Link className="cursor-pointer" href={`/video/${video.id}`}>
      <div
      style={{cursor: 'pointer'}} 
        className={`${
          horizontal
          ? "flex flex-row mx-5 mb-5 item-center justify-center"
          : "flex flex-col m-5 w-80"
        } `}
      >
          <img
            className={
              horizontal
                // ? "object-cover rounded-lg w-60 h-30 "
                ? "object-cover rounded-lg   w-44 h-36"
                : "object-cover rounded-lg w-full h-40"
            }
            src={video.thumbnailHash}
            alt=""
            width={horizontal ? "240" : "320"}
            height={horizontal ? "160" : "160"}
            onError={(event: React.SyntheticEvent<HTMLImageElement, Event>) => {
              event.currentTarget.src = "/assets/video-unavailable.png";
              event.currentTarget.onerror = null;
            }}
          />
        <div className={horizontal && "ml-3  w-80"}>
          <h4 className="text-md font-bold dark:text-white mt-3 text-black text-transform: capitalize">
            {video.title}
          </h4>
          {horizontal && (
            <p className="text-sm flex items-center text-subtitle-light mt-1">
              {video.category} • {moment(Date.parse(video.date)).fromNow()}
            </p>
          )}
          <div> 
            <p className="text-sm flex items-center text-subtitle-light mt-1">
            {horizontal ? null : video.category + " • "}
            {(video?.handle ? video?.handle : "...") + " • " }
            {(video?.isCollectedByMe ? "Collected" : "Not Collected")}
            {(video?.isCollectedByMe ?<BsCollectionFill size="20px" color={Colors.primary} className="ml-1"/> : <BsCollection size="20px" color={Colors.primary} className="ml-1"/>)}  
            {" • " + (video?.collectMw ? (video?.collectMw === "Free" ? "Free" : "Paid" ): "")}
            </p>
              
          </div>
          
        </div>
      </div>
    </Link>
  );
};
export default Video;

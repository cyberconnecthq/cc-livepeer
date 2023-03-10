import moment from "moment";
import Link from "next/link";
import React from "react";
import { BiCheck } from "react-icons/bi";
import getImage from "../lib/getImage";
import { IVideo } from "../types";
import { Image } from "@nextui-org/react";
interface IProps {
  video: IVideo;
  horizontal?: boolean;
}

const Video: React.FC<IProps> = ({ video, horizontal }) => {
  return (
    <Link className="cursor-pointer" href={`/video/${video.id}`}>
      <div
        className={`${
          horizontal
            ? "flex flex-row mx-5 mb-5  item-center justify-center"
            : "flex flex-col m-5 w-80"
        } `}
      >
       <div>
          <img
            className={
              horizontal
                ? "object-cover rounded-lg w-60 h-30 "
                : "object-cover rounded-lg w-full h-40"
            }
            src={getImage(video.thumbnailHash)}
            alt=""
            onError={(event: React.SyntheticEvent<HTMLImageElement, Event>) => {
              event.currentTarget.src = "/assets/video-unavailable.png";
              event.currentTarget.onerror = null;
            }}
            // onError={event => {
            //   event.target.src = "/assets/video-unavailable.png"
            //   event.onerror = null
            // }}
          />
       </div>
        <div className={horizontal && "ml-3  w-80"}>
          <h4 className="text-md font-bold dark:text-white mt-3 text-black text-transform: capitalize">
            {video.title}
          </h4>
          {horizontal && (
            <p className="text-sm flex items-center text-subtitle-light mt-1">
              {video.category} • {moment(Date.parse(video.date)).fromNow()}
            </p>
          )}
          <p className="text-sm flex items-center text-subtitle-light mt-1">
            {horizontal ? null : video.category + " • "}
            {video?.author?.slice(0, 9)}...{" "}
            <BiCheck size="20px" color="green" className="ml-1" />
          </p>
        </div>
      </div>
    </Link>
  );
};
export default Video;

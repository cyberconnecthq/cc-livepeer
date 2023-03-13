import React, { useState } from "react";
import {
  AiOutlineBulb,
  AiOutlineCompass,
  AiOutlineDribbble,
  AiOutlineFire,
  AiOutlineMenu,
  AiOutlinePlayCircle,
  AiOutlineSmile
} from "react-icons/ai";
import { IoGameControllerOutline, IoSchoolOutline, IoNewspaperOutline} from "react-icons/io5";
import {VscSymbolMisc} from "react-icons/vsc";
import {Tooltip} from "@nextui-org/react"
import { Colors } from "../constants/colors";

export default function Sidebar({ updateCategory }) {
  const [active, setActive] = useState("All");
  const [open, setOpen] = useState(false);

  let color = "#878787";

  let categories = [
    {
      name: "All",
      icon: (
        <AiOutlineFire
          size={"25px"}
          color={active === "All" ? Colors.primary : color}
        />
      ),
      onClick: () => {
        setActive("All");
        updateCategory("");
      },
    },
    {
      name: "Travel",
      icon: (
        <AiOutlineCompass
          size={"25px"}
          color={active === "Travel" ? Colors.primary : color}
        />
      ),
      onClick: () => {
        setActive("Travel");
        updateCategory("Travel");
      },
    },
    {
      name: "Sports",
      icon: (
        <AiOutlineDribbble
          size={"25px"}
          color={active === "Sports" ? Colors.primary : color}
        />
      ),
      onClick: () => {
        setActive("Sports");
        updateCategory("Sports");
      },
    },
    {
      name: "Music",
      icon: (
        <AiOutlinePlayCircle
          size={"25px"}
          color={active === "Music" ? Colors.primary : color}
        />
      ),
      onClick: () => {
        setActive("Music");
        updateCategory("Music");
      },
    },

    {
      name: "Science & Technology",
      icon: (
        <AiOutlineBulb
          size={"25px"}
          color={active === "Science & Technology" ? Colors.primary : color}
        />
      ),
      onClick: () => {
        setActive("Science & Technology");
        updateCategory("Science & Technology");
      },
    },
    {
      name: "Gaming",
      icon: (
        <IoGameControllerOutline
          size={"25px"}
          color={active === "Gaming" ? Colors.primary : color}
        />
      ),
      onClick: () => {
        setActive("Gaming");
        updateCategory("Gaming");
      },
    },
    {
      name: "Entertainment",
      icon: (
        <AiOutlineSmile
          size={"25px"}
          color={active === "Entertainment" ? Colors.primary : color}
        />
      ),
      onClick: () => {
        setActive("Entertainment");
        updateCategory("Entertainment");
      },
    },
    {
      name: "Education",
      icon: (
        <IoSchoolOutline
          size={"25px"}
          color={active === "Education" ? Colors.primary : color}
        />
      ),
      onClick: () => {
        setActive("Education");
        updateCategory("Education");
      },
    },
    {
      name: "News",
      icon: (
        <IoNewspaperOutline
          size={"25px"}
          color={active === "News" ? Colors.primary : color}
        />
      ),
      onClick: () => {
        setActive("News");
        updateCategory("News");
      },
    },
    {
      name: "Other",
      icon: (
        <VscSymbolMisc
          size={"25px"}
          color={active === "Other" ? Colors.primary : color}
        />
      ),
      onClick: () => {
        setActive("Other");
        updateCategory("Other");
      },
    },
  ];

  return (
    <div className="border-r border-border-light dark:border-border-dark p-7 ">
      <AiOutlineMenu
        color={open ? Colors.primary : "#fff"}
        size="25px"
        className={open ? Colors.primary : "fill-icons-light dark:fill-white cursor-pointer"}
        onClick={() => setOpen(!open)}
      />
      <div className="my-20 flex flex-col  justify-between h-96">
        {categories.map((category, index) => (
          <div className="flex flex-row">
            { !open ? 
            (
              <Tooltip content={category.name}>
              <div
                className="cursor-pointer"
                onClick={category.onClick}
                key={index}
              >
                {category.icon}
            </div>
            </Tooltip>)
            :
            (
              <div
                className="cursor-pointer"
                onClick={category.onClick}
                key={index}
              >
                {category.icon}
                {<div className="flex flex-row">
                  <span 
                  className={active === category.name ? Colors.primary : "text-sm font-medium text-text-light dark:text-text-dark"}
                  // color={active === category.name ? Colors.primary : color}
                  >
                    {category.name}
                  </span>
                </div>}
            </div> ) 
                  }
          </div>
        ))}
      </div>
    </div>
  );
}

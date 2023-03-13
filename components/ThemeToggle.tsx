import { Tooltip } from "@nextui-org/react";
import React, { useContext } from "react";
import { BiSun, BiMoon } from "react-icons/bi";
import { ThemeContext } from "../context/ThemeContext";

const Toggle = () => {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <div className="transition duration-0 ease-in-out rounded-full">
      {theme === "dark" ? (
        <Tooltip content={"Light Mode"} placement="bottom">
        <BiSun
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          size="30px"
          className=" fill-whiteIcons dark:fill-white"
        />
        </Tooltip>
      ) : (
        <Tooltip content={"Dark Mode"} placement="bottom">
        <BiMoon
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          size="30px"
          className="fill-whiteIcons dark:fill-white"
        />
        </Tooltip>
      )}
    </div>
  );
};

export default Toggle;

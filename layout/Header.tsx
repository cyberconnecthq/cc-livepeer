import React, {useContext} from "react";
import { AiOutlinePlusCircle, AiOutlineAntDesign } from "react-icons/ai";
import { CgProfile } from "react-icons/cg";
import Link from "next/link";
import { SigninBtn, Toggle } from "../components";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import CustomConnectButton  from "../components/Buttons/CustomConnectButton";
import { AuthContext } from "../context/auth";
import PrimaryProfileCard from "../components/Cards/PrimaryProfileCard";
interface IHeader {
  search?: React.Dispatch<React.SetStateAction<string>>;
}

export default function Header({ search }: IHeader) {
  const {accessToken, address, primaryProfile} = useContext(AuthContext);
  return (
    <header className="w-full flex justify-between h-20 items-center border-b p-4 border-border-light dark:border-border-dark">
      <div className=" w-1/3	">
        <Link href={"/home"}>
          <div style={{cursor: 'pointer'}}>
            <Image
              src={"/assets/tube-icon.svg"}
              alt="CyberTube Logo"
              width={55}
              height={40}
            />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400 text-5xl font-medium	">
                  CyberTube
          </span>
          </div>
        </Link>
      </div>
      <div className=" w-1/3 flex justify-center items-center">
        {search ? (
          <input
            type="text"
            onChange={(e) => search(e.target.value)}
            placeholder="Type to search"
            className=" border-0 bg-transparent focus:outline-none"
          />
        ) : null}
      </div>

      <div className=" w-1/3 flex justify-end items-center">
        <Link href="/upload">
          <AiOutlinePlusCircle
            size="35px"
            className="mr-8 fill-icons-light dark:fill-icons-dark cursor-pointer"
            // transition duration-0 ease-in-out rounded-full
          />
        </Link>
        {accessToken && primaryProfile && <Link href="/profile">
        <CgProfile
        size="35px"
        className="mr-8 fill-icons-light dark:fill-icons-dark cursor-pointer"/>
		    </Link> }
        <Toggle />
        {!accessToken && !primaryProfile && <div className="ml-10">
          <SigninBtn />
          </div>}
        {/* <div className="ml-10">
          <ConnectButton
            label="Connect Wallet"
            accountStatus="address"
            showBalance={false}
          />
        </div> */}
        <div className="ml-10">
          <CustomConnectButton {...primaryProfile} />
        </div>
      </div>
    </header>
  );
}


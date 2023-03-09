import React, {useContext} from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import Link from "next/link";
import { SigninBtn, Toggle } from "../components";
import Image from "next/image";
{/* <UserOutlined /> */}
import { ConnectButton } from "@rainbow-me/rainbowkit";
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
            size="30px"
            className="mr-8 fill-icons-light dark:fill-icons-dark cursor-pointer"
          />
        </Link>
        <Toggle />
        {!accessToken && !primaryProfile && <div className="ml-10">
          <SigninBtn />
          </div>}
        {accessToken && primaryProfile && <Link href="/profile">
			<div >
          <AiOutlinePlusCircle
            size="30px"
            className="mr-8 fill-icons-light dark:fill-icons-dark cursor-pointer"
          />
        {primaryProfile && (
			<div className="">
            <PrimaryProfileCard {...primaryProfile} />
          </div>
        )}
		</div>
		</Link> }
        <div className="ml-10">
          <ConnectButton
            label="Connect Wallet"
            accountStatus="address"
            showBalance={false}
          />
        </div>
      </div>
    </header>
  );
}


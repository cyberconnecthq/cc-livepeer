import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/auth";
import { IPrimaryProfileCard } from "../../types";
import { parseURL } from "../../utils";
import { Tooltip, Text } from "@nextui-org/react";

export default function CustomConnectButton({handle, avatar, metadata} : IPrimaryProfileCard) {
    const {primaryProfile, address} =  useContext(AuthContext)
    const router = useRouter();
    const [src, setSrc] = useState(parseURL(avatar));
    const [data, setData] = useState({
        name: "",
        bio: "",
    });

        useEffect(() => {
            if (!metadata) return;
            (async () => {
            setData({
                name: "",
                bio: "",
            });
            try {
                const res = await fetch(parseURL(metadata));
                if (res.status === 200) {
                const data = await res.json();
                setData(data);
                }
            } catch (error) {
                console.error(error);
            }
            })();
        }, [metadata]);
    return (
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            authenticationStatus,
            mounted,
          }) => {
            // Note: If your app doesn't use authentication, you
            // can remove all 'authenticationStatus' checks
            const ready = mounted && authenticationStatus !== 'loading';
            const connected =
              ready &&
              account &&
              chain &&
              (!authenticationStatus ||
                authenticationStatus === 'authenticated');
    
            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  'style': {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button onClick={openConnectModal} 
                      type="button"
                      className="flex flex-row items-center  justify-between  rounded-lg bg-blue-500 py-2 px-4 text-white hover:bg-blue-700"
                      >
                        Connect Wallet
                      </button>
                    );
                  }
    
                  if (chain.unsupported) {
                    return (
                      <button onClick={openChainModal} 
                      type="button"
                      className="flex flex-row items-center  justify-between  rounded-lg bg-red-500 py-2 px-4 text-white hover:bg-red-700">
                        Wrong network
                      </button>
                    );
                  }
    
                  return (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button
                        onClick={openChainModal}
                        style={{ display: 'flex', alignItems: 'center' }}
                        type="button"
                        className="flex flex-row items-center  justify-between  rounded-lg bg-blue-500 py-2 px-4 text-white hover:bg-blue-700"
                      >
                        {chain.hasIcon && (
                          <div
                            style={{
                              background: chain.iconBackground,
                              width: 20,
                              height: 20,
                              borderRadius: 999,
                              overflow: 'hidden',
                              marginRight: 4,
                            }}
                          >
                            {chain.iconUrl && (
                              <img
                                alt={chain.name ?? 'Chain icon'}
                                src={chain.iconUrl}
                                style={{ width: 20, height: 20 }}
                              />
                            )}
                          </div>
                        )}
                        {chain.name}
                      </button>
    
                      <button 
                      onClick={openAccountModal} 
                      type="button"
                      className="flex flex-row items-center  justify-between  rounded-lg bg-blue-500 py-2 px-4 text-white hover:bg-blue-700"
                      >
                        {handle ? handle: account.displayName}
                        {/* {account.displayBalance
                          ? ` (${account.displayBalance})`
                          : ''} */}
                      </button>
                      {!handle && (
                          <Tooltip content={ <Text b>You need a ccProfile <br></br> to upload & collect content</Text>} placement="bottom">
                            <button
                              className="flex flex-row items-center  justify-between  rounded-lg bg-green-500 py-2 px-4 text-white hover:bg-green-700"
                              onClick={() => router.push("https://testnet.cyberconnect.me/")}
                            >
                              Mint your Free ccProfile now!
                            </button>
                          </Tooltip>
                        )}
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      );
}
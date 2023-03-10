import {
    midnightTheme,
    lightTheme,
    RainbowKitAuthenticationProvider,
    RainbowKitProvider,
    createAuthenticationAdapter,
    AuthenticationStatus,
  } from '@rainbow-me/rainbowkit'
  import { useAccount, useNetwork, useProvider, WagmiConfig } from 'wagmi'
  import { client, chains } from '../constants/config'
  import { GET_NONCE, VERIFY } from '../graphql';
  import { useEffect, useState, useContext } from 'react'
  import { AuthContext } from './auth'
  import { apolloClient } from '../clients'
  import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, WALLET_KEY, DOMAIN } from '../constants'
  import { useMutation } from '@apollo/client';
  import { ThemeContext } from "../utils/ThemeContext";
  
  
  export function RainbowAuthProvider({ children }: { children: React.ReactNode }) {
    const [getNonce] = useMutation(GET_NONCE);
    const [verify] = useMutation(VERIFY);
    const { address } = useAccount()
    const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext)
    const { theme, setTheme } = useContext(ThemeContext);
    const provider = useProvider()
  
  
    const [authStatus, setAuthStatus] = useState<AuthenticationStatus>('unauthenticated')
  
    useEffect(() => {
      setAuthStatus(isLoggedIn ? 'authenticated' : 'unauthenticated')
    }, [isLoggedIn])
  
    const authenticationAdapter = createAuthenticationAdapter({
      getNonce: async () => {
        console.log('domain', DOMAIN)
        const res = await getNonce({
          variables: {
            address,
            domain: DOMAIN,
          },
        })
        return new Promise((resolve) => {
          resolve(res.data?.loginGetMessage.message!)
        })
      },
  
      createMessage: ({ nonce }) => {
        return nonce
      },
  
      getMessageBody: ({ message }: any) => {
        return message
      },
  
      verify: async ({ signature }) => {
        const code = await provider.getCode(address!)
        const isEIP1271 = code !== '0x'
        const res = await verify({
          variables: {
            domain: DOMAIN,
            address,
            signature,
            isEIP1271,
          },
        })
        const accessToken = res.data?.loginVerify.accessToken
        const refreshToken = res.data?.loginVerify.refreshToken
        if (!!accessToken && !!refreshToken) {
          window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
          window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  
          window.localStorage.setItem(WALLET_KEY, address!)
          setAuthStatus('authenticated')
          setIsLoggedIn(true)
          return new Promise((resolve) => {
            resolve(true)
          })
        } else {
          setAuthStatus('unauthenticated')
          return new Promise((resolve) => {
            resolve(false)
          })
        }
      },
  
      signOut: async () => {
        setAuthStatus('unauthenticated')
        window.localStorage.removeItem(ACCESS_TOKEN_KEY)
        window.localStorage.removeItem(WALLET_KEY)
        window.localStorage.removeItem(REFRESH_TOKEN_KEY)
        await apolloClient.resetStore()
      },
    })
    return (
      <RainbowKitAuthenticationProvider adapter={authenticationAdapter} status={authStatus}>
        <RainbowKitProvider
          chains={chains}
          theme={theme === 'dark' ? midnightTheme() : undefined}
          // theme={midnightTheme({
          //   accentColor: '#6AF7AC',
          //   accentColorForeground: 'black',
          //   borderRadius: 'small',
          // })}
        >
          {children}
        </RainbowKitProvider>
      </RainbowKitAuthenticationProvider>
    )
  }
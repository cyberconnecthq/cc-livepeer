import {
    midnightTheme,
    lightTheme,
    RainbowKitAuthenticationProvider,
    RainbowKitProvider,
    createAuthenticationAdapter,
    AuthenticationStatus,
  } from '@rainbow-me/rainbowkit'
  import { useAccount, useProvider,  } from 'wagmi'
  import { chains } from '../constants/config'
  import { GET_NONCE, VERIFY } from '../graphql';
  import { useEffect, useState, useContext } from 'react'
  import { AuthContext } from './auth'
  import { apolloClient } from '../clients'
  import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, WALLET_KEY, DOMAIN } from '../constants'
  import { useMutation } from '@apollo/client';
  import { ThemeContext } from "./ThemeContext";
  
  // This AuthProvider is a wrapper around RainbowKit's RainbowKitAuthenticationProvider
  // It handles the authentication flow and provides the authentication status to the rest of the app
  // We are using a custom adapter to handle the CyberConnect API authentication flow
  export function RainbowAuthProvider({ children }: { children: React.ReactNode }) {
    const [getNonce] = useMutation(GET_NONCE);
    const [verify] = useMutation(VERIFY);
    const { address } = useAccount()
    const { isLoggedIn, setIsLoggedIn, setAccessToken } = useContext(AuthContext)
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
          setAccessToken(accessToken)
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
        >
          {children}
        </RainbowKitProvider>
      </RainbowKitAuthenticationProvider>
    )
  }
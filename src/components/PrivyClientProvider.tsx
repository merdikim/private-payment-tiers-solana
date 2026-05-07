import '@tanstack/react-start/client-only'

import { PrivyProvider, usePrivy } from '@privy-io/react-auth'
import type { ReactNode } from 'react'
import { MerchantAuthContext } from './merchantAuth'

type PrivyClientProviderProps = {
  appId: string
  children: ReactNode
}

export default function PrivyClientProvider({
  appId,
  children,
}: PrivyClientProviderProps) {
  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ['email'],
        appearance: {
          theme: 'light',
          accentColor: '#000000',
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'off',
          },
          solana: {
            createOnLogin: 'off',
          },
        },
      }}
    >
      <PrivyMerchantAuthProvider>{children}</PrivyMerchantAuthProvider>
    </PrivyProvider>
  )
}

function PrivyMerchantAuthProvider({ children }: { children: ReactNode }) {
  const { authenticated, login, logout, ready } = usePrivy()

  return (
    <MerchantAuthContext.Provider
      value={{
        authenticated,
        login: async () => {
          await login()
        },
        logout,
        ready,
      }}
    >
      {children}
    </MerchantAuthContext.Provider>
  )
}

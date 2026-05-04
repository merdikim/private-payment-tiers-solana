import { PrivyProvider } from '@privy-io/react-auth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

const queryClient = new QueryClient()
const privyAppId = import.meta.env.VITE_PRIVY_APP_ID ?? 'replace-with-privy-app-id'

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#000000',
          logo: undefined,
        },
      }}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </PrivyProvider>
  )
}

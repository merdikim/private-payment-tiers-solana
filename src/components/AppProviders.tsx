import { PrivyProvider } from '@privy-io/react-auth'
import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/kit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

const queryClient = new QueryClient()
const privyAppId = String(import.meta.env.VITE_PRIVY_APP_ID ?? '')
  .trim()
  .replace(/^['"]|['"]$/g, '')
const solanaRpcUrl =
  String(import.meta.env.VITE_SOLANA_RPC_URL ?? '')
    .trim()
    .replace(/^['"]|['"]$/g, '') || 'https://api.mainnet-beta.solana.com'
const solanaRpcSubscriptionsUrl = solanaRpcUrl
  .replace(/^https:/, 'wss:')
  .replace(/^http:/, 'ws:')

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        loginMethods: ['email'],
        appearance: {
          theme: 'light',
          accentColor: '#000000',
          walletChainType: 'solana-only',
        },
        solana: {
          rpcs: {
            'solana:mainnet': {
              rpc: createSolanaRpc(solanaRpcUrl),
              rpcSubscriptions: createSolanaRpcSubscriptions(
                solanaRpcSubscriptionsUrl,
              ),
              blockExplorerUrl: 'https://explorer.solana.com',
            },
          },
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'off',
          },
          solana: {
            createOnLogin: 'all-users',
          },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </PrivyProvider>
  )
}

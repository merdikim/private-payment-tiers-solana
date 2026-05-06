import { PrivyProvider } from '@privy-io/react-auth'
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana'
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
const solanaWalletConnectors = toSolanaWalletConnectors()

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
          showWalletLoginFirst: true,
          walletChainType: 'solana-only',
          walletList: ['detected_solana_wallets', 'wallet_connect_qr_solana'],
        },
        externalWallets: {
          solana: {
            connectors: solanaWalletConnectors,
          },
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

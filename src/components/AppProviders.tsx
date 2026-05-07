import { ClientOnly } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense, type ReactNode } from 'react'
import { MerchantAuthFallbackProvider } from './merchantAuth'

const queryClient = new QueryClient()
const privyAppId = String(import.meta.env.VITE_PRIVY_APP_ID ?? '')
  .trim()
  .replace(/^['"]|['"]$/g, '')
const PrivyClientProvider = lazy(() => import('./PrivyClientProvider'))

export default function AppProviders({ children }: { children: ReactNode }) {
  if (!privyAppId) {
    return (
      <QueryClientProvider client={queryClient}>
        <main className="page-wrap flex min-h-screen items-center justify-center px-4 py-10">
          <section className="island-shell w-full max-w-md rounded-lg p-6">
            <p className="island-kicker mb-3">Merchant auth setup</p>
            <h1 className="m-0 text-2xl font-black text-black">
              Missing Privy app ID
            </h1>
            <p className="mb-0 mt-3 text-sm leading-6 text-neutral-700">
              Add VITE_PRIVY_APP_ID to your environment to enable merchant
              sign-in.
            </p>
          </section>
        </main>
      </QueryClientProvider>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ClientOnly
        fallback={
          <MerchantAuthFallbackProvider>
            {children}
          </MerchantAuthFallbackProvider>
        }
      >
        <Suspense
          fallback={
            <MerchantAuthFallbackProvider>
              {children}
            </MerchantAuthFallbackProvider>
          }
        >
          <PrivyClientProvider appId={privyAppId}>
            {children}
          </PrivyClientProvider>
        </Suspense>
      </ClientOnly>
    </QueryClientProvider>
  )
}

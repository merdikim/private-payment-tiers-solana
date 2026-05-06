import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { usePrivy } from '@privy-io/react-auth'
import { Mail } from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/signin')({ component: SignInPage })

function SignInPage() {
  const navigate = useNavigate()
  const { authenticated, login, ready } = usePrivy()

  async function handleSignIn() {
    try {
      await login()
    } catch (error) {
      console.error('Privy sign-in failed', error)
    }
  }

  useEffect(() => {
    if (ready && authenticated) {
      void navigate({ to: '/dashboard' })
    }
  }, [authenticated, navigate, ready])

  return (
    <main className="page-wrap flex min-h-[calc(100vh-190px)] items-center justify-center px-4 py-10">
      <section className="island-shell w-full max-w-md rounded-lg p-6 sm:p-8">
        <p className="island-kicker mb-3">Merchant access</p>
        <h1 className="m-0 text-3xl font-black tracking-tight text-black">
          Sign in to USDC Checkout.
        </h1>
        <p className="mt-4 text-sm leading-6 text-neutral-700">
          Manage business pricing tiers, checkout links, and Solana USDC wallet
          settings.
        </p>

        <div className="mt-7 grid gap-3">
          <Button
            type="button"
            disabled={!ready}
            size="lg"
            onClick={() => void handleSignIn()}
          >
            <Mail size={17} aria-hidden="true" />
            {ready ? 'Continue with email or wallet' : 'Preparing sign in'}
          </Button>
        </div>
      </section>
    </main>
  )
}

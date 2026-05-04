import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { usePrivy } from '@privy-io/react-auth'
import { Mail } from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/signin')({ component: SignInPage })

function SignInPage() {
  const navigate = useNavigate()
  const { authenticated, login, ready } = usePrivy()

  useEffect(() => {
    if (ready && authenticated) {
      void navigate({ to: '/dashboard' })
    }
  }, [authenticated, navigate, ready])

  return (
    <main className="page-wrap flex min-h-[calc(100vh-220px)] items-center gap-8 px-4 py-12 justify-center">
      <section className="rounded-lg w-xl border border-black bg-white p-6 shadow-[10px_10px_0_#000]">
        <h1 className="m-0 text-xl font-black tracking-tight text-black sm:text-3xl">
          Access your TierFlow dashboard.
        </h1>
        <p className="mt-4 text-base leading-7 text-neutral-700">
          Sign in with Privy to manage business profiles, subscription tiers,
          and public pricing links.
        </p>

        <div className="mt-7 grid gap-3">
          <Button
            type="button"
            disabled={!ready}
            size="lg"
            onClick={() => login()}
          >
            <Mail size={17} aria-hidden="true" />
            Continue with email or wallet
          </Button>
        </div>
      </section>
    </main>
  )
}

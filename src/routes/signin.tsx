import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/signin')({ component: SignInPage })

function SignInPage() {
  const navigate = useNavigate()

  async function continueWithoutAuth() {
    await navigate({ to: '/dashboard' })
  }

  return (
    <main className="page-wrap flex min-h-[calc(100vh-230px)] items-center justify-center px-4 py-10">
      <section className="island-shell w-full max-w-md rounded-lg p-6 sm:p-8">
        <p className="island-kicker mb-3">Merchant access</p>
        <h1 className="m-0 text-3xl font-black tracking-tight text-black">
          Sign in to Delta Pay.
        </h1>
        <p className="mt-4 text-sm leading-6 text-neutral-700">
          create and manage checkout pages, business pricing tiers and checkout links.
        </p>

        <div className="mt-7 grid gap-3">
          <Button
            type="button"
            size="lg"
            onClick={() => void continueWithoutAuth()}
          >
            Continue to dashboard
            <ArrowRight size={17} aria-hidden="true" />
          </Button>
        </div>
      </section>
    </main>
  )
}

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { usePrivy } from '@privy-io/react-auth'
import { ArrowRight, BadgeCheck, Mail, WalletCards } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/signin')({ component: SignInPage })

function SignInPage() {
  const navigate = useNavigate()
  const { authenticated, login, ready, user } = usePrivy()

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
          <Button
            type="button"
            disabled={!ready}
            size="lg"
            variant="outline"
            onClick={() => login()}
          >
            <WalletCards size={17} aria-hidden="true" />
            Open Privy login
          </Button>
        </div>

        {authenticated ? (
          <div className="mt-5 rounded-md border border-black bg-neutral-50 p-4">
            <p className="m-0 flex items-center gap-2 text-sm font-bold text-black">
              <BadgeCheck size={17} aria-hidden="true" />
              Signed in
            </p>
            <p className="mb-4 mt-2 text-sm text-neutral-700">
              {user?.email?.address ??
                user?.wallet?.address ??
                'Privy session is active.'}
            </p>
            <Button
              type="button"
              onClick={() => void navigate({ to: '/dashboard' })}
            >
              Go to dashboard
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
          </div>
        ) : null}
      </section>

      {/* <section className="space-y-4">
        {[
          ['One account', 'Businesses can return and keep editing their pages.'],
          ['Email or wallet', 'Privy handles flexible auth without custom auth UI.'],
          ['Dashboard ready', 'After sign in, users land in the tier builder.'],
        ].map(([title, description]) => (
          <article key={title} className="rounded-lg border border-black bg-white p-5">
            <h2 className="m-0 text-xl font-black text-black">{title}</h2>
            <p className="mb-0 mt-2 text-sm leading-6 text-neutral-700">
              {description}
            </p>
          </article>
        ))}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-black text-black"
        >
          Continue to dashboard preview
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section> */}
    </main>
  )
}

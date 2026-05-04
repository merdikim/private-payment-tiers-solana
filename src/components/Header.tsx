import { Link } from '@tanstack/react-router'
import { usePrivy } from '@privy-io/react-auth'
import { CreditCard, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Header() {
  const { authenticated, logout, ready } = usePrivy()

  return (
    <header className="sticky top-0 z-50 border-b border-black bg-white px-4">
      <nav className="page-wrap flex flex-wrap items-center gap-x-4 gap-y-3 py-4">
        <h2 className="m-0 shrink-0 text-base font-black tracking-tight">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-black no-underline"
          >
            <CreditCard size={18} aria-hidden="true" />
            TierFlow
          </Link>
        </h2>

        {/* <div className="order-3 flex w-full flex-wrap items-center gap-x-5 gap-y-2 text-sm font-black sm:order-2 sm:w-auto">
          <Link
            to="/"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Home
          </Link>
          <Link
            to="/about"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Product
          </Link>
          <Link
            to="/dashboard"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Dashboard
          </Link>
          <Link
            to="/pages/$slug"
            params={{ slug: 'acme-growth' }}
            className="nav-link"
          >
            Sample
          </Link>
        </div> */}

        <div className="ml-auto flex items-center gap-2">
          {authenticated ? (
            <Button
              type="button"
              disabled={!ready}
              variant="outline"
              onClick={() => void logout()}
            >
              <LogOut size={15} aria-hidden="true" />
              Sign out
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link to="/signin" className="no-underline">
                Sign in
              </Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  )
}

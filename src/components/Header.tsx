import { Link, useNavigate } from '@tanstack/react-router'
import { usePrivy } from '@privy-io/react-auth'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import delta_pay_logo from '@/assets/deltapay.png'

export default function Header() {
  const { authenticated, logout, ready } = usePrivy()
  const navigate = useNavigate()

  async function handleSignOut() {
    await logout()
    await navigate({ to: '/signin' })
  }

  return (
    <header className="sticky h-20 top-0 z-50 border-b bg-white border-black px-4">
      <nav className="page-wrap flex flex-wrap items-center gap-x-4 gap-y-3">
        <h2 className="m-0 shrink-0 text-base font-black tracking-tight">
          <Link
            to={authenticated ? '/dashboard' : '/'}
            className="inline-flex items-center gap-2 text-black no-underline"
          >
            <img src={delta_pay_logo} alt="Delta Pay" className='h-20'/>
            Delta Pay
          </Link>
        </h2>
        <div className="ml-auto flex items-center gap-2">
          {authenticated ? (
            <Button
              type="button"
              disabled={!ready}
              onClick={() => void handleSignOut()}
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

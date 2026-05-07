import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import delta_pay_logo from '@/assets/deltapay.png'

export default function Header() {
  return (
    <header className="sticky h-20 top-0 z-50 border-b bg-white border-black px-4">
      <nav className="page-wrap flex flex-wrap items-center gap-x-4 gap-y-3">
        <h2 className="m-0 shrink-0 text-base font-black tracking-tight">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-black no-underline"
          >
            <img src={delta_pay_logo} alt="Delta Pay" className='h-20'/>
            Delta Pay
          </Link>
        </h2>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant="outline">
            <Link to="/dashboard" className="no-underline">
              Dashboard
            </Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}

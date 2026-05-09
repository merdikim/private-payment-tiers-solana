import delta_pay_logo from "@/assets/deltapay.png";
import type { SubscriptionPage } from "@/lib/subscriptionPage";
import { Link } from "@tanstack/react-router";

export default function CheckoutNavbar({ page }: { page: SubscriptionPage }) {
  return (
    <header className="sticky h-16 top-0 z-50 border-b border-slate-200 bg-white px-4">
      <nav className="page-wrap flex flex-wrap items-center gap-x-6 gap-y-3 h-full">
        < div className="flex items-center gap-3">
            <img
              src={page.imageUrl || delta_pay_logo}
              alt={page.businessName}
              className="h-8 w-8 object-cover rounded-lg border border-slate-200"
            />
            
            <h1 className="text-sm font-bold text-slate-900 m-0 truncate">
              {page.businessName}
            </h1>
        </div>
        <div className="ml-auto flex gap-2 items-center">
            <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide m-0">
              Powered by
            </p>
            <Link
            to='/'
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <span>Delta Pay</span>
          </Link>
          </div>
      </nav>
    </header>
  );
}

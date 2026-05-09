import { Link, useLocation } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import delta_pay_logo from "@/assets/deltapay.png";
import { useMerchantAuth } from "./merchantAuth";

export default function Header() {
  const { authenticated, logout, ready } = useMerchantAuth();
  const location = useLocation();

  // Hide header on checkout page
  if (location.pathname.startsWith("/business/")) {
    return null;
  }

  return (
    <header className="sticky h-16 top-0 z-50 border-b border-slate-200 bg-white px-4">
      <nav className="page-wrap flex flex-wrap items-center gap-x-6 gap-y-3 h-full">
        <h2 className="m-0 shrink-0 text-lg font-bold tracking-tight">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 text-slate-900 no-underline hover:opacity-75 transition-opacity"
          >
            <img src={delta_pay_logo} alt="Delta Pay" className="h-16 w-auto" />
            <span className="hidden sm:inline">Delta Pay</span>
          </Link>
        </h2>
        <div className="ml-auto flex items-center gap-3">
          {authenticated ? (
              <Button
                size="sm"
                variant="outline"
                disabled={!ready}
                onClick={() => void logout()}
              >
                <LogOut size={16} aria-hidden="true" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
          ) : (
            <Button asChild size="sm">
              <Link to="/signin" className="no-underline">
                Sign in
              </Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}

import { useLocation } from "@tanstack/react-router";

export default function Footer() {
  const year = new Date().getFullYear();
  const location = useLocation();

  // Hide footer on checkout page
  if (location.pathname.startsWith("/business/")) {
    return null;
  }

  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50 px-4 pb-12 pt-10 text-slate-600">
      <div className="page-wrap flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
        <p className="m-0 text-sm">
          &copy; {year} Delta Pay. Secure Solana USDC payments for any business.
        </p>
        <div className="flex gap-6 text-sm">
          <a href="#" className="no-underline text-slate-600 hover:text-slate-900 transition-colors">Privacy</a>
          <a href="#" className="no-underline text-slate-600 hover:text-slate-900 transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
}

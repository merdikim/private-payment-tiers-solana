import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useMerchantAuth } from "@/components/merchantAuth";

export const Route = createFileRoute("/signin")({ component: SignInPage });

function SignInPage() {
  const navigate = useNavigate();
  const { authenticated, login, ready } = useMerchantAuth();

  async function handleSignIn() {
    try {
      await login();
    } catch (error) {
      console.error("Privy sign-in failed", error);
    }
  }

  useEffect(() => {
    if (ready && authenticated) {
      void navigate({ to: "/dashboard" });
    }
  }, [authenticated, navigate, ready]);

  return (
    <main className="page-wrap flex min-h-[calc(100vh-230px)] items-center justify-center px-4 py-12 bg-linear-to-b from-white to-slate-50">
      <section className="island-shell w-full max-w-md rounded-2xl p-8 sm:p-10">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Merchant access</p>
        <h1 className="m-0 text-4xl font-bold tracking-tight text-slate-900 mb-3">
          Sign in to Delta Pay
        </h1>
        <p className="mt-5 text-base leading-7 text-slate-600">
          Create and manage checkout pages, set pricing tiers, and accept Solana USDC payments securely.
        </p>

        <div className="mt-8 grid gap-4">
          <Button
            type="button"
            disabled={!ready}
            size="lg"
            className="w-full"
            onClick={() => void handleSignIn()}
          >
            <Mail size={18} aria-hidden="true" />
            {ready ? "Continue with email or wallet" : "Preparing sign in..."}
          </Button>
        </div>

        <p className="mt-6 text-xs text-slate-600 text-center">
          You're one step away from accepting global payments for your business.
        </p>
      </section>
    </main>
  );
}

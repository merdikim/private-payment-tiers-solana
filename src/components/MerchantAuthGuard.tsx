import { useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useMerchantAuth } from "./merchantAuth";

type MerchantAuthGuardProps = {
  children: ReactNode;
};

export function MerchantAuthGuard({ children }: MerchantAuthGuardProps) {
  const navigate = useNavigate();
  const { authenticated, ready } = useMerchantAuth();

  useEffect(() => {
    if (ready && !authenticated) {
      void navigate({ to: "/signin" });
    }
  }, [authenticated, navigate, ready]);

  if (!ready || !authenticated) {
    return (
      <main className="page-wrap flex min-h-[calc(100vh-230px)] items-center justify-center px-4 py-10">
        <section className="island-shell w-full max-w-md rounded-lg p-6 text-center">
          <p className="island-kicker mb-3">Merchant access</p>
          <h1 className="m-0 text-2xl font-black text-black">
            Checking your session...
          </h1>
        </section>
      </main>
    );
  }

  return children;
}

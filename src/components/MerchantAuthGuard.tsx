import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useMerchantAuth } from "./merchantAuth";
import type { MerchantAuthGuardProps } from "@/types";

export function MerchantAuthGuard({ children }: MerchantAuthGuardProps) {
  const navigate = useNavigate();
  const { authenticated, ready } = useMerchantAuth();

  useEffect(() => {
    if (ready && !authenticated) {
      void navigate({ to: "/signin" });
    }
  }, [authenticated, navigate, ready]);

  return children;
}

import { createContext, useContext, type ReactNode } from "react";
import type { MerchantAuthState } from "@/types";

export const defaultMerchantAuthState: MerchantAuthState = {
  authenticated: false,
  login: async () => {},
  logout: async () => {},
  ready: false,
  walletAddress: "",
  walletReady: false,
};

export const MerchantAuthContext = createContext<MerchantAuthState>(
  defaultMerchantAuthState,
);

export function MerchantAuthFallbackProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <MerchantAuthContext.Provider value={defaultMerchantAuthState}>
      {children}
    </MerchantAuthContext.Provider>
  );
}

export function useMerchantAuth() {
  return useContext(MerchantAuthContext);
}

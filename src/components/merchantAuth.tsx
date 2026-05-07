import { createContext, useContext, type ReactNode } from "react";

export type MerchantAuthState = {
  authenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  ready: boolean;
};

export const defaultMerchantAuthState: MerchantAuthState = {
  authenticated: false,
  login: async () => {},
  logout: async () => {},
  ready: false,
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

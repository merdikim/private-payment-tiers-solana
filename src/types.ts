import type { ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";

// ============================================================================
// Router & Navigation
// ============================================================================

export interface RouterRegister {
  router: any; // Will be typed as ReturnType<typeof getRouter>
}

// ============================================================================
// Theme
// ============================================================================

export type ThemeMode = "light" | "dark" | "auto";

// ============================================================================
// Authentication
// ============================================================================

export type MerchantAuthState = {
  authenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  ready: boolean;
  walletAddress: string;
  walletReady: boolean;
};

export type MerchantAuthGuardProps = {
  children: ReactNode;
};

// ============================================================================
// UI Components
// ============================================================================

export type PrivyClientProviderProps = {
  appId: string;
  children: ReactNode;
};

export interface PhotoPickerProps {
  onFileSelected?: (file: File | null) => void;
}

// ============================================================================
// Checkout
// ============================================================================

export type PublicCheckoutProps = {
  customerWalletAddress?: string;
  disconnectWallet: () => Promise<void>;
  isCustomerWalletReady: boolean;
  isWalletConnecting: boolean;
  merchantWalletAddress: string;
  page: SubscriptionPage;
  payment: PaymentState;
  usdcBalance: UsdcBalanceState;
  payWithUsdc: (tier: Tier) => Promise<void>;
  onPaymentStatusChange?: (status: PaymentStatus) => void;
};

export type PaymentStatus =
  | "idle"
  | "connecting"
  | "confirming"
  | "success"
  | "error";

export type PaymentState = {
  errorCategory?:
    | "wallet"
    | "network"
    | "validation"
    | "service"
    | "transaction"
    | "unknown";
  errorTitle?: string;
  tierId?: string;
  status: PaymentStatus;
  message?: string;
  signature?: string;
  error?: string;
  errorRecoverable?: boolean;
  errorSuggestion?: string;
};

export type UsdcBalanceState = {
  amount?: string;
  error?: string;
  status: "idle" | "loading" | "success" | "error";
};

// ============================================================================
// Subscription & Pricing
// ============================================================================

export type Tier = {
  id: string;
  name: string;
  description: string;
  price: number;
  cta: string;
  featured: boolean;
  features: string[];
};

export type SubscriptionPage = {
  slug: string;
  businessName: string;
  headline: string;
  accentColor: string;
  backgroundColor: string;
  currency: string;
  checkoutUrl: string;
  walletAddress: string;
  imageUrl?: string;
  tiers: Tier[];
};

// ============================================================================
// Payments
// ============================================================================

export type CheckoutPaymentInput = {
  pageSlug: string;
  tierId: string;
  tierName: string;
  payerWallet: string;
  merchantWallet: string;
  amountUsd: number;
  signature: string;
};

export type CheckoutPayment = {
  id: string;
  pageSlug: string;
  tierId: string;
  tierName: string;
  payerWallet: string;
  merchantWallet: string;
  amountUsd: number;
  amountUsdcBaseUnits: string;
  token: string;
  network: string;
  signature: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
};

// ============================================================================
// UI Component Props (Buttons, etc.)
// ============================================================================

export type ButtonVariantProps = VariantProps<any>;


export type CheckoutPaymentError = {
  category:
    | "wallet"
    | "network"
    | "validation"
    | "service"
    | "transaction"
    | "unknown";
  message: string;
  recoverable: boolean;
  suggestion?: string;
  title: string;
};

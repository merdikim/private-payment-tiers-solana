CREATE TABLE "subscription_pages" (
  "slug" TEXT NOT NULL,
  "business_name" TEXT NOT NULL,
  "headline" TEXT NOT NULL,
  "subheadline" TEXT NOT NULL DEFAULT '',
  "accent_color" TEXT NOT NULL,
  "background_color" TEXT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT '$',
  "checkout_url" TEXT NOT NULL,
  "wallet_address" TEXT NOT NULL DEFAULT '',
  "tiers" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "subscription_pages_pkey" PRIMARY KEY ("slug")
);

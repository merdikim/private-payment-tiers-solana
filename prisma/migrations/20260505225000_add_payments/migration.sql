CREATE TABLE "payments" (
  "id" TEXT NOT NULL,
  "page_slug" TEXT NOT NULL,
  "tier_id" TEXT NOT NULL,
  "tier_name" TEXT NOT NULL,
  "payer_wallet" TEXT NOT NULL,
  "merchant_wallet" TEXT NOT NULL,
  "amount_usd_cents" INTEGER NOT NULL,
  "amount_usdc_base_units" BIGINT NOT NULL,
  "token" TEXT NOT NULL DEFAULT 'USDC',
  "network" TEXT NOT NULL DEFAULT 'solana-mainnet',
  "signature" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'confirmed',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payments_signature_key" ON "payments"("signature");
CREATE INDEX "payments_page_slug_created_at_idx" ON "payments"("page_slug", "created_at");

ALTER TABLE "payments"
  ADD CONSTRAINT "payments_page_slug_fkey"
  FOREIGN KEY ("page_slug")
  REFERENCES "subscription_pages"("slug")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

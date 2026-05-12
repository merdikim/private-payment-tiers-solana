# Delta Pay - Accept USDC Payments in Seconds

**Accept Solana USDC payments in seconds. Host checkout pages, share payment links, and manage transactions. Any business, anywhere in the world.**

Delta Pay is a modern payment platform that makes it simple for any business to accept Solana USDC payments. Create custom tiered checkout pages, share public payment links, and receive payments privately using the **Cloak Protocol**. No complex integrations—just instant payment acceptance.

## The Problem

### Why Delta Pay?
- **Manual payment collection is slow**: Merchants struggle to accept cryptocurrency payments without building complex infrastructure
- **Transaction privacy is exposed**: On-chain payments reveal amounts, payers, and recipients to the entire blockchain network
- **Payment management is fragmented**: No unified way to track, organize, and manage crypto payments across multiple customers
- **Global barriers exist**: Traditional solutions are limited in most regions; They require intermediaries sometimes

### The Solution
Delta Pay solves these problems by combining:
1. **Instant checkout pages** - Merchants create tiered payment pages in minutes
2. **Public payment links** - Share a simple link; customers select a tier and pay instantly
3. **Private transactions** - Powered by **Cloak Protocol**, payments are shielded on-chain
4. **Unified management** - Track all payments, tiers, and payment data in one dashboard

### Who It's For
- **Freelancers & Consultants** - Accept consulting fees or project payments in USDC
- **Digital Creators** - Offer tiered subscriptions (e.g., Consultation, Custom Project)
- **Online Businesses** - E-commerce, SaaS, and service providers needing crypto payments
- **Global Teams** - Anyone wanting fast, borderless payments without building their own crypto payment infra
- **Privacy-Conscious Merchants** - Businesses that want transaction privacy by default

---

## How Cloak SDK is Central to Delta Pay

The **Cloak SDK** is the core of Delta Pay's privacy functionality:

### Key Cloak SDK Components Used

1. **`generateUtxoKeypair()`** - Generates unique keypairs for UTXOs that serve as obfuscated transaction containers
2. **`createUtxo(amount, owner, mint)`** - Creates unspent outputs that hide transaction amounts and participants
3. **`createZeroUtxo(mint)`** - Creates zero-value UTXOs for initializing the privacy pool
4. **`transact()`** - Executes the privacy deposit transaction, converting public USDC into private commitments on the Cloak program
5. **`fullWithdraw()`** - Performs the final withdrawal to the merchant's wallet, withdrawing privately with zero on-chain visibility of the actual amount
6. **`CLOAK_PROGRAM_ID`** - The Cloak program address that executes all privacy operations on Solana

### Why It's Central

Without Cloak, all USDC transfers would be visible on-chain. With Cloak:
- **Payment deposits** are mixed in a shielded pool, hiding amounts and identities
- **Withdrawals** to merchants appear as zero-knowledge proofs, not direct transfers
- **Transaction graph analysis** becomes impossible—no one can link payments to merchants
- **Privacy is verified cryptographically**, not through obfuscation

---

## Features

### For Merchants
✅ **Create Custom Checkout Pages** - No coding required; build beautiful tiered payment pages in minutes  
✅ **Share Public Payment Links or QR code** - Generate a simple link and share with customers instantly  ✅ **Generate QR Codes** - Create scannable QR codes for direct access to checkout pages  ✅ **Manage All Payments** - Dashboard to track confirmed payments, customer details, and payment history  
✅ **Branding & Customization** - Add your logo, choose accent colors, customize headlines  
✅ **Tiered Pricing Flexibility** - Create multiple service tiers (Consultation, Custom Project, etc.)  

### For Customers
✅ **One-Click Checkout** - Connect wallet, select tier, pay instantly  
✅ **Private Transactions** - Powered by Cloak Protocol—amounts and payers stay private  
✅ **Wallet Integration** - Works with Phantom, Solflare, and all major Solana wallets  
✅ **Instant Confirmation** - Real-time payment status updates during checkout  
✅ **No KYC** - Global access; no identity verification required  
 
### Technical details
✅ **Solana Blockchain** - Lightning-fast, low-cost transactions on Solana Devnet  
✅ **Privacy by Default** - Cloak Protocol ensures zero on-chain visibility of transaction details  
✅ **Real-time Updates** - Multi-step payment confirmation flow with live status  

---

## Setup & Installation

### Prerequisites
- **Node.js 18+** and **pnpm** (or npm)
- **PostgreSQL** database

### Note for Testing
This application is currently configured for **Solana Devnet** for testing purposes. Users will see a banner prompting them to switch to Devnet when accessing the dashboard or payment pages. For production use, update the RPC URL and Cloak SDK imports accordingly.

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Solana RPC Configuration
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/delta_pay

# Authentication
PRIVY_API_KEY=your_privy_api_key
PRIVY_APP_ID=your_privy_app_id

# AWS S3 (for image uploads)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=delta-pay-images
```

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/merdikim/private-payment-tiers-solana.git delta-pay
   cd delta-pay
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up database**
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```
   The app will be available at `http://localhost:3000`

### Build for Production

```bash
pnpm build
pnpm preview
```

---

## Project Structure

```
src/
├── components/          # React components
│   ├── checkout/       # Payment checkout flow
│   └── ui/            # UI primitives (buttons, cards, etc.)
├── hooks/             # Custom React hooks
│   └── useCheckoutPayment.ts  # Payment processing hook
├── lib/               # Business logic
│   ├── solanaCheckout.ts      # Cloak SDK integration
│   ├── payments.ts            # Payment utilities & server functions
│   ├── subscriptionPage.ts    # Page management
│   └── prisma.server.ts       # Database client
├── routes/            # File-based routing (TanStack Router)
├── types.ts           # TypeScript type definitions
└── styles.css         # Tailwind CSS
prisma/
├── schema.prisma      # Database schema
└── migrations/        # Database migration history
```

---

## How It Works

### From Merchant's Perspective

**Step 1: Sign In**
- Merchants sign in using email or social auth (powered by Privy)
- Access the merchant dashboard

**Step 2: Create a Payment Page**
- Define business name, headline, and branding
- Set up tiered pricing (e.g., Consultation: $75, Custom Project: $1000)
- Get a unique public checkout link

**Step 3: Share & Receive Payments**
- Share the checkout link or QR code on your website, social media, or marketing materials
- Customers visit the link, select a tier, and pay instantly
- Payments are recorded and visible in your dashboard

### From Customer's Perspective

**Step 1: Visit Checkout Page**
- Click merchant's unique payment link
- See tiered pricing options (e.g., "Consultation", "Custom Project")
- Beautiful, branded checkout interface

**Step 2: Select Tier & Connect Wallet**
- Choose pricing tier
- Connect Solana wallet (Phantom, Solflare, etc.)
- Review payment amount

**Step 3: Confirm & Pay**
- Delta Pay uses Cloak SDK to create a private transaction
- Funds move through Cloak's privacy pool
- Merchant receives USDC to their Solana wallet
- Payment status updates in real-time

### QR Code Generation

Merchants can generate QR codes directly from their dashboard:
- Click "Generate QR Code" button next to the checkout page URL
- QR code modal displays with scannable code
- Customers can scan to access checkout page instantly
- Perfect for physical marketing materials, business cards, or in-person demos

### Under the Hood: The Cloak Protocol

When a customer pays:
1. **Privacy UTXO Creation** - Cloak generates a unique unspent output for anonymity
2. **Amount Obfuscation** - Payment amount is hidden in a shielded pool
3. **Zero-Knowledge Transfer** - Merchant receives payment as a zero-knowledge proof
4. **On-Chain Privacy** - No one can see amounts or link payer to merchant

**Result**: Full transaction privacy while maintaining cryptographic verification on Solana Mainnet

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: TanStack Start, Nitro, Prisma ORM
- **Blockchain**: Solana Web3.js, Cloak SDK
- **Database**: PostgreSQL
- **Authentication**: Privy
- **Storage**: AWS S3 (Cloudflare R2)
- **Build**: Vite 8+
- **Router**: TanStack Router with file-based routing

---

## Testing

Run the test suite:

```bash
pnpm test
```

Unit tests are located alongside their source files (`.test.ts`).

---

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Support & Resources

- **Cloak Protocol Docs**: https://docs.cloak.ag/sdk/quickstart
- **Solana Docs**: https://docs.solana.com
- **TanStack Start**: https://tanstack.com/start
- **Issues**: Open an issue in the GitHub repository

---

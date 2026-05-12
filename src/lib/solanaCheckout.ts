import {
  CLOAK_PROGRAM_ID,
  createUtxo,
  createZeroUtxo,
  DEVNET_MOCK_USDC_MINT,
  fullWithdraw,
  generateUtxoKeypair,
  transact,
} from "@cloak.dev/sdk-devnet";
import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { dollarsToUsdcBaseUnits } from "./payments";
import { getPaymentErrorDetails } from "./utils";

export type CloakSignTransaction = <
  T extends Transaction | VersionedTransaction,
>(
  transaction: T,
) => Promise<T>;

const CONFIGURED_SOLANA_RPC_URL = String(
  import.meta.env.VITE_SOLANA_RPC_URL ?? "",
)
  .trim()
  .replace(/^['"]|['"]$/g, "");

export const USDC_MINT_ADDRESS = DEVNET_MOCK_USDC_MINT

export const SOLANA_RPC_URLS = Array.from(
  new Set(
    [
      CONFIGURED_SOLANA_RPC_URL,
      "https://api.mainnet.solana.com"
    ].filter((url): url is string => Boolean(url)),
  ),
);


export function getPaymentErrorMessage(error: unknown) {
  return getPaymentErrorDetails(error).message;
}


export async function sendPrivateUsdcPayment({
  amountUsd,
  merchantWalletAddress,
  payerWalletAddress,
  onProgress,
  signMessage,
  signTransaction,
  rpcUrls,
}: {
  amountUsd: number;
  merchantWalletAddress: string;
  onProgress?: (status: string) => void;
  payerWalletAddress: string;
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
  signTransaction: CloakSignTransaction;
  rpcUrls: string[];
}) {

  if (!payerWalletAddress) {
    throw new Error("Missing payer Solana wallet address.");
  }

  if (!merchantWalletAddress) {
    throw new Error("Missing receiving Solana wallet address.");
  }

  if (rpcUrls.length === 0) {
    throw new Error("No Solana RPC endpoints are configured.");
  }

  const connection = await getAvailableSolanaConnection(rpcUrls);
  const payer = new PublicKey(payerWalletAddress);
  const merchant = new PublicKey(merchantWalletAddress);
  const mint = USDC_MINT_ADDRESS
  const amount = dollarsToUsdcBaseUnits(amountUsd);
  const owner = await generateUtxoKeypair();
  const output = await createUtxo(amount, owner, mint);
  const cloakOptions = {
    connection,
    programId: CLOAK_PROGRAM_ID,
    depositorPublicKey: payer,
    walletPublicKey: payer,
    signMessage,
    signTransaction,
    onProgress,
  };

  onProgress?.("Withdrawing from your account...");
  const deposited = await transact(
    {
      inputUtxos: [await createZeroUtxo(mint)],
      outputUtxos: [output],
      externalAmount: amount,
      depositor: payer,
    },
    cloakOptions,
  );

  console.log('deposit successful', deposited)

  onProgress?.("Transfering privately to merchant...");
  const withdrawn = await fullWithdraw(deposited.outputUtxos, merchant, {
    ...cloakOptions,
    addressLookupTableAccounts: deposited.addressLookupTableAccounts,
    cachedMerkleTree: deposited.merkleTree,
  });

  return {
    depositSignature: deposited.signature,
    signature: withdrawn.signature,
  };
}

async function getAvailableSolanaConnection(rpcUrls: string[]) {
  let lastRpcError: unknown;

  for (const rpcUrl of rpcUrls) {
    const connection = new Connection(rpcUrl, "confirmed");

    try {
      await connection.getLatestBlockhash();

      return connection;
    } catch (error) {
      lastRpcError = error;

      if (!isRetryableRpcError(error)) {
        throw error;
      }
    }
  }

  throw lastRpcError ?? new Error("No Solana RPC endpoints are available.");
}

function isRetryableRpcError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const normalizedMessage = message.toLowerCase();

  return (
    message.includes("403") ||
    message.includes("429") ||
    normalizedMessage.includes("forbidden") ||
    normalizedMessage.includes("rate") ||
    normalizedMessage.includes("failed to fetch") ||
    normalizedMessage.includes("failed to get recent blockhash")
  );
}

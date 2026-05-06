import {
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { dollarsToUsdcBaseUnits } from './payments'

const CONFIGURED_SOLANA_RPC_URL = String(import.meta.env.VITE_SOLANA_RPC_URL ?? '')
  .trim()
  .replace(/^['"]|['"]$/g, '')
const USDC_MINT_ADDRESS =
  String(import.meta.env.VITE_SOLANA_USDC_MINT ?? '')
    .trim()
    .replace(/^['"]|['"]$/g, '') ||
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const USDC_DECIMALS = 6

export const SOLANA_RPC_URLS = Array.from(
  new Set(
    [
      CONFIGURED_SOLANA_RPC_URL,
      'https://api.mainnet.solana.com',
      'https://api.mainnet-beta.solana.com',
    ].filter((url): url is string => Boolean(url)),
  ),
)

export function getPaymentErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)

  if (message.includes('_bn')) {
    return 'A Solana address is missing or invalid. Check the receiving wallet and VITE_SOLANA_USDC_MINT configuration.'
  }

  if (message.includes('403') || message.toLowerCase().includes('forbidden')) {
    return 'Solana RPC rejected this request. The app tried its public fallbacks; set VITE_SOLANA_RPC_URL to a dedicated browser-accessible mainnet endpoint.'
  }

  if (message.toLowerCase().includes('failed to get recent blockhash')) {
    return 'Could not reach a Solana RPC endpoint. Set VITE_SOLANA_RPC_URL to a reliable browser-accessible mainnet RPC.'
  }

  return error instanceof Error ? error.message : 'USDC payment failed.'
}

export async function createUsdcTransferTransaction({
  amountUsd,
  merchantWalletAddress,
  payerWalletAddress,
  rpcUrls,
}: {
  amountUsd: number
  merchantWalletAddress: string
  payerWalletAddress: string
  rpcUrls: string[]
}) {
  if (!USDC_MINT_ADDRESS) {
    throw new Error('Missing VITE_SOLANA_USDC_MINT.')
  }

  if (!payerWalletAddress) {
    throw new Error('Missing payer Solana wallet address.')
  }

  if (!merchantWalletAddress) {
    throw new Error('Missing receiving Solana wallet address.')
  }

  if (rpcUrls.length === 0) {
    throw new Error('No Solana RPC endpoints are configured.')
  }

  const mint = new PublicKey(USDC_MINT_ADDRESS)
  const payer = new PublicKey(payerWalletAddress)
  const merchant = new PublicKey(merchantWalletAddress)
  const payerUsdcAccount = await getAssociatedTokenAddress(mint, payer)
  const merchantUsdcAccount = await getAssociatedTokenAddress(mint, merchant)
  const amount = dollarsToUsdcBaseUnits(amountUsd)
  let lastRpcError: unknown

  for (const rpcUrl of rpcUrls) {
    const connection = new Connection(rpcUrl, 'confirmed')

    try {
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash()
      const transaction = new Transaction({
        feePayer: payer,
        recentBlockhash: blockhash,
      }).add(
        createAssociatedTokenAccountIdempotentInstruction(
          payer,
          merchantUsdcAccount,
          merchant,
          mint,
        ),
        createTransferCheckedInstruction(
          payerUsdcAccount,
          mint,
          merchantUsdcAccount,
          payer,
          amount,
          USDC_DECIMALS,
        ),
      )

      return {
        blockhash,
        connection,
        lastValidBlockHeight,
        transaction: transaction.serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        }),
      }
    } catch (error) {
      lastRpcError = error

      if (!isRetryableRpcError(error)) {
        throw error
      }
    }
  }

  throw lastRpcError ?? new Error('No Solana RPC endpoints are available.')
}

function isRetryableRpcError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  const normalizedMessage = message.toLowerCase()

  return (
    message.includes('403') ||
    message.includes('429') ||
    normalizedMessage.includes('forbidden') ||
    normalizedMessage.includes('rate') ||
    normalizedMessage.includes('failed to fetch') ||
    normalizedMessage.includes('failed to get recent blockhash')
  )
}

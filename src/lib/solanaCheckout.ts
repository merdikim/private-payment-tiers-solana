import {
  CLOAK_PROGRAM_ID,
  createUtxo,
  createZeroUtxo,
  fullWithdraw,
  generateUtxoKeypair,
  transact,
} from '@cloak.dev/sdk'
import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from '@solana/web3.js'
import { dollarsToUsdcBaseUnits } from './payments'

const CONFIGURED_SOLANA_RPC_URL = String(import.meta.env.VITE_SOLANA_RPC_URL ?? '')
  .trim()
  .replace(/^['"]|['"]$/g, '')
const USDC_MINT_ADDRESS =
  String(import.meta.env.VITE_SOLANA_USDC_MINT ?? '')
    .trim()
    .replace(/^['"]|['"]$/g, '') ||
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const CLOAK_RELAY_URL =
  String(import.meta.env.VITE_CLOAK_RELAY_URL ?? '')
    .trim()
    .replace(/^['"]|['"]$/g, '') || undefined

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

  if (message.toLowerCase().includes('insufficient')) {
    return 'Your wallet does not have enough USDC or SOL to complete this private payment.'
  }

  if (message.toLowerCase().includes('user rejected')) {
    return 'Payment was cancelled in your wallet.'
  }

  return error instanceof Error ? error.message : 'USDC payment failed.'
}

export type CloakSignTransaction = <
  T extends Transaction | VersionedTransaction,
>(
  transaction: T,
) => Promise<T>

export async function sendPrivateUsdcPayment({
  amountUsd,
  merchantWalletAddress,
  payerWalletAddress,
  onProgress,
  signMessage,
  signTransaction,
  rpcUrls,
}: {
  amountUsd: number
  merchantWalletAddress: string
  onProgress?: (status: string) => void
  payerWalletAddress: string
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>
  signTransaction: CloakSignTransaction
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

  const connection = await getAvailableSolanaConnection(rpcUrls)
  const payer = new PublicKey(payerWalletAddress)
  const merchant = new PublicKey(merchantWalletAddress)
  const mint = new PublicKey(USDC_MINT_ADDRESS)
  const amount = dollarsToUsdcBaseUnits(amountUsd)
  const owner = await generateUtxoKeypair()
  const output = await createUtxo(amount, owner, mint)
  const cloakOptions = {
    connection,
    programId: CLOAK_PROGRAM_ID,
    //relayUrl: CLOAK_RELAY_URL,
    depositorPublicKey: payer,
    walletPublicKey: payer,
    signMessage,
    signTransaction,
    enforceViewingKeyRegistration: false,
    maxRootRetries: 5,
    retryDelayMs: 1_500,
    onProgress,
  }

  onProgress?.('Depositing USDC into Cloak...')
  const deposited = await transact(
    {
      inputUtxos: [await createZeroUtxo(mint)],
      outputUtxos: [output],
      externalAmount: amount,
      depositor: payer,
    },
    cloakOptions,
  )

  onProgress?.('Withdrawing privately to merchant...')
  const withdrawn = await fullWithdraw(deposited.outputUtxos, merchant, {
    ...cloakOptions,
    addressLookupTableAccounts: deposited.addressLookupTableAccounts,
    cachedMerkleTree: deposited.merkleTree,
  })

  return {
    depositSignature: deposited.signature,
    signature: withdrawn.signature,
  }
}

async function getAvailableSolanaConnection(rpcUrls: string[]) {
  let lastRpcError: unknown

  for (const rpcUrl of rpcUrls) {
    const connection = new Connection(rpcUrl, 'confirmed')

    try {
      await connection.getLatestBlockhash()

      return connection
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

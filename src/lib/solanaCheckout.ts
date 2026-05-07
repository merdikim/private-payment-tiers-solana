import {
  CLOAK_PROGRAM_ID,
  CloakError,
  RootNotFoundError,
  ShieldPoolErrors,
  UtxoAlreadySpentError,
  createUtxo,
  createZeroUtxo,
  fullWithdraw,
  generateUtxoKeypair,
  isRootNotFoundError,
  parseError,
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
export const USDC_MINT_ADDRESS =
  String(import.meta.env.VITE_SOLANA_USDC_MINT ?? '')
    .trim()
    .replace(/^['"]|['"]$/g, '') ||
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

export const SOLANA_RPC_URLS = Array.from(
  new Set(
    [
      CONFIGURED_SOLANA_RPC_URL,
      'https://api.mainnet.solana.com',
      'https://api.mainnet-beta.solana.com',
    ].filter((url): url is string => Boolean(url)),
  ),
)

export type CheckoutPaymentError = {
  category:
    | 'wallet'
    | 'network'
    | 'validation'
    | 'service'
    | 'transaction'
    | 'unknown'
  message: string
  recoverable: boolean
  suggestion?: string
  title: string
}

export function getPaymentErrorMessage(error: unknown) {
  return getPaymentErrorDetails(error).message
}

export function getPaymentErrorDetails(error: unknown): CheckoutPaymentError {
  const message = error instanceof Error ? error.message : String(error)
  const mappedProgramError = getShieldPoolErrorMessage(message)

  if (isRootNotFoundError(error) || error instanceof RootNotFoundError) {
    return {
      category: 'transaction',
      title: 'Cloak proof expired',
      message:
        'Cloak could not use the proof root before it became stale. Please try the payment again.',
      suggestion: 'Retrying rebuilds the private proof with a fresh Merkle root.',
      recoverable: true,
    }
  }

  if (error instanceof UtxoAlreadySpentError) {
    return {
      category: 'transaction',
      title: 'Private balance already spent',
      message:
        'Cloak detected that this private balance was already spent. Refresh your wallet state and try again.',
      suggestion:
        'If this happened after approving a wallet prompt, check whether the transaction already completed.',
      recoverable: true,
    }
  }

  if (mappedProgramError) {
    return {
      category: 'transaction',
      title: 'Cloak transaction rejected',
      message: mappedProgramError,
      recoverable: false,
    }
  }

  if (message.includes('_bn')) {
    return {
      category: 'validation',
      title: 'Invalid Solana address',
      message:
        'A Solana address is missing or invalid. Check the receiving wallet and VITE_SOLANA_USDC_MINT configuration.',
      recoverable: false,
    }
  }

  if (message.includes('403') || message.toLowerCase().includes('forbidden')) {
    return {
      category: 'network',
      title: 'Solana RPC rejected the request',
      message:
        'Solana RPC rejected this request. The app tried its public fallbacks; set VITE_SOLANA_RPC_URL to a dedicated browser-accessible mainnet endpoint.',
      recoverable: true,
    }
  }

  if (message.toLowerCase().includes('failed to get recent blockhash')) {
    return {
      category: 'network',
      title: 'Solana RPC unavailable',
      message:
        'Could not reach a Solana RPC endpoint. Set VITE_SOLANA_RPC_URL to a reliable browser-accessible mainnet RPC.',
      recoverable: true,
    }
  }

  if (message.toLowerCase().includes('insufficient')) {
    return {
      category: 'wallet',
      title: 'Insufficient balance',
      message:
        'Your wallet does not have enough USDC or SOL to complete this private payment.',
      suggestion: 'You need enough USDC for the item and a little SOL for fees.',
      recoverable: true,
    }
  }

  if (message.toLowerCase().includes('user rejected')) {
    return {
      category: 'wallet',
      title: 'Payment cancelled',
      message: 'Payment was cancelled in your wallet.',
      recoverable: true,
    }
  }

  if (error instanceof CloakError) {
    const parsed = parseError(error)

    return {
      category: parsed.category,
      title: parsed.title,
      message: parsed.message,
      suggestion: parsed.suggestion,
      recoverable: parsed.recoverable || error.retryable,
    }
  }

  const parsed = parseError(error)

  return {
    category: parsed.category,
    title: parsed.title,
    message: parsed.message || 'USDC payment failed.',
    suggestion: parsed.suggestion,
    recoverable: parsed.recoverable,
  }
}

function getShieldPoolErrorMessage(message: string) {
  const codeMatch = message.match(/0x[0-9a-f]+|\b\d{4,5}\b/i)

  if (!codeMatch) {
    return undefined
  }

  const rawCode = codeMatch[0]
  const code = rawCode.startsWith('0x')
    ? Number.parseInt(rawCode, 16)
    : Number(rawCode)

  if (!Number.isFinite(code)) {
    return undefined
  }

  return ShieldPoolErrors[code]
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

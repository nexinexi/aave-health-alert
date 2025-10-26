import type { SupportedChainKey } from './presets'
import type { Address } from '@/lib'
import { DEFAULTS, LIMITS, PUSHOVER } from './constants'

interface Config {
  wallet: Address
  hfThreshold: number
  pollIntervalMs: number
  chainName: SupportedChainKey
  poolAddressOverride?: Address
  rpcUrlOverride?: string
  schedule: {
    morningHour: number
    eveningHour: number
    timezone: string
  }
  pushover: {
    appToken: string
    userKey: string
    sound: string
    retry: number
    expire: number
  }
}

function validateConfig(): Config {
  const wallet = process.env.WALLET

  if (!wallet) {
    throw new Error('WALLET environment variable is required')
  }

  if (!wallet.match(/^0x[a-fA-F0-9]{40}$/)) {
    throw new Error(
      'WALLET must be a valid Ethereum address (0x + 40 hex characters)',
    )
  }

  const hfThreshold =
    process.env.HF_THRESHOLD && Number(process.env.HF_THRESHOLD) > 0
      ? Number(process.env.HF_THRESHOLD)
      : DEFAULTS.HF_THRESHOLD
  const envPoll = Number(process.env.POLL_INTERVAL_MS)
  const pollIntervalMs = !Number.isNaN(envPoll)
    ? Math.max(envPoll, LIMITS.MIN_POLL_INTERVAL_MS)
    : DEFAULTS.POLL_INTERVAL_MS

  const pushoverAppToken = process.env.PUSHOVER_APP_TOKEN
  const pushoverUserKey = process.env.PUSHOVER_USER_KEY
  const pushoverRetry = process.env.PUSHOVER_RETRY
    ? Number(process.env.PUSHOVER_RETRY)
    : PUSHOVER.DEFAULT_RETRY_SECONDS
  const pushoverExpire = process.env.PUSHOVER_EXPIRE
    ? Number(process.env.PUSHOVER_EXPIRE)
    : PUSHOVER.DEFAULT_EXPIRE_SECONDS
  const pushoverSound =
    process.env.PUSHOVER_NOTIFICATION_SOUND || PUSHOVER.DEFAULT_SOUND

  if (!pushoverAppToken || !pushoverUserKey) {
    throw new Error('PUSHOVER_APP_TOKEN and PUSHOVER_USER_KEY are required')
  }

  // Schedule settings (default: 8 and 20 in 24h format)
  const morningHour = process.env.MORNING_HOUR
    ? Number(process.env.MORNING_HOUR)
    : 8
  const eveningHour = process.env.EVENING_HOUR
    ? Number(process.env.EVENING_HOUR)
    : 20
  const timezone = process.env.TIMEZONE || 'UTC'

  // Validate hour values
  if (morningHour < 0 || morningHour > 23 || Number.isNaN(morningHour)) {
    throw new Error('MORNING_HOUR must be between 0 and 23')
  }
  if (eveningHour < 0 || eveningHour > 23 || Number.isNaN(eveningHour)) {
    throw new Error('EVENING_HOUR must be between 0 and 23')
  }

  return {
    wallet: wallet as Address,
    hfThreshold,
    pollIntervalMs,
    chainName: (process.env.CHAIN || 'arbitrum') as SupportedChainKey,
    poolAddressOverride: process.env.POOL_ADDRESS as Address,
    rpcUrlOverride: process.env.RPC_URL,
    schedule: {
      morningHour,
      eveningHour,
      timezone,
    },
    pushover: {
      appToken: pushoverAppToken,
      userKey: pushoverUserKey,
      sound: pushoverSound,
      retry: pushoverRetry,
      expire: pushoverExpire,
    },
  }
}

export const config = validateConfig()

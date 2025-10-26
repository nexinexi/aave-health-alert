import type { SupportedChainKey } from './presets'

export const DEFAULTS = {
  HF_THRESHOLD: 1.3,
  POLL_INTERVAL_MS: 15000,
  CHAIN: 'arbitrum' as SupportedChainKey,
} as const

export const DECIMALS = {
  HEALTH_FACTOR: 18,
  BASE_CURRENCY: 8,
} as const

export const LIMITS = {
  MAX_CONSECUTIVE_ERRORS: 3,
  MIN_POLL_INTERVAL_MS: 1000,
} as const

export const PUSHOVER = {
  API_URL: 'https://api.pushover.net/1/messages.json',
  PRIORITY_NORMAL: 0,
  PRIORITY_EMERGENCY: 2,
  DEFAULT_SOUND: 'echo',
  DEFAULT_RETRY_SECONDS: 60,
  DEFAULT_EXPIRE_SECONDS: 3600,
} as const

export const AAVE = {
  APP_URL: 'https://app.aave.com/',
  APP_URL_TITLE: 'AAVE App',
} as const

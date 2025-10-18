import type { SupportedChainKey } from './presets'

export const config = {
  wallet: process.env.WALLET as `0x${string}`,
  hfThreshold: process.env.HF_THRESHOLD
    ? Number(process.env.HF_THRESHOLD)
    : 1.3,
  pollIntervalMs: process.env.POLL_INTERVAL_MS
    ? Number(process.env.POLL_INTERVAL_MS)
    : 15000,
  alertTo: process.env.ALERT_TO,
  alertCooldownMs: process.env.ALERT_COOLDOWN_MS
    ? Number(process.env.ALERT_COOLDOWN_MS)
    : 600000,
  chainName: (process.env.CHAIN || 'arbitrum') as SupportedChainKey,
  poolAddressOverride: process.env.POOL_ADDRESS as `0x${string}` | undefined,
  rpcUrlOverride: process.env.RPC_URL,
}

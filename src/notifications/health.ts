import { config } from '@/config'
import type { UserData } from '@/user-data'
import { PUSHOVER, AAVE } from '@/constants'
import { formatCurrency, formatHealthFactor, formatPercent } from '@/lib'
import { sendNotification } from './sender'

function buildNotificationMessage(data: UserData): string {
  const hf = formatHealthFactor(data.healthFactor)
  const collateral = formatCurrency(data.totalCollateral)
  const debt = formatCurrency(data.totalDebt)
  const availableBorrows = formatCurrency(data.availableBorrows)

  return `🚨 AAVE Health Factor Alert

Health Factor: ${hf}
Threshold: ${config.hfThreshold}
Chain: ${config.chainName}

Account Details:
• Collateral: ${collateral}
• Debt: ${debt}
• Available to Borrow: ${availableBorrows}
• Liquidation Threshold: ${formatPercent(data.liquidationThreshold)}
• Utilization: ${formatPercent(data.utilization)}
• LTV: ${formatPercent(data.ltv)}

Wallet: ${config.wallet}

⚠️ Your position is at risk of liquidation. Take action immediately!`
}

function buildNotificationTitle(data: UserData): string {
  const hf = formatHealthFactor(data.healthFactor)

  return `⚠️ AAVE Alert: HF ${hf}`
}

export async function sendHealthAlert(data: UserData): Promise<void> {
  const title = buildNotificationTitle(data)
  const message = buildNotificationMessage(data)

  return sendNotification({
    title,
    message,
    priority: PUSHOVER.PRIORITY_EMERGENCY,
    retry: config.pushover.retry,
    expire: config.pushover.expire,
    url: AAVE.APP_URL,
    urlTitle: AAVE.APP_URL_TITLE,
  })
}

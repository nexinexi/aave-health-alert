import { config } from './config'
import type { UserData } from './user-data'
import { PUSHOVER, AAVE } from './constants'
import { logger } from './logger'
import { formatCurrency, formatHealthFactor, formatPercent } from './format'

export function buildNotificationMessage(data: UserData): string {
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

export function buildNotificationTitle(data: UserData): string {
  const hf = formatHealthFactor(data.healthFactor)
  return `⚠️ AAVE Alert: HF ${hf}`
}

export function buildNotification(data: UserData): {
  message: string
  title: string
} {
  const message = buildNotificationMessage(data)
  const title = buildNotificationTitle(data)

  return { message, title }
}

export async function sendNotification(
  title: string,
  message: string,
): Promise<void> {
  const { appToken, userKey, sound, retry, expire } = config.pushover

  const payload = {
    token: appToken,
    user: userKey,
    message,
    title,
    priority: PUSHOVER.PRIORITY_EMERGENCY,
    retry,
    expire,
    sound,
    url: AAVE.APP_URL,
    url_title: AAVE.APP_URL_TITLE,
  }

  try {
    const response = await fetch(PUSHOVER.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const result = (await response.json()) as {
      status?: number
      request?: string
      errors?: string[]
    }

    if (!response.ok) {
      logger.error('Pushover API error', result)
      throw new Error(
        `Pushover notification failed: ${result.errors?.join(', ') || 'Unknown error'}`,
      )
    }

    logger.info('Pushover notification sent successfully', result)
  } catch (error) {
    logger.error('Error sending Pushover notification', error)
    throw error
  }
}

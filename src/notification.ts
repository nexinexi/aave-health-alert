import { AAVE, PUSHOVER } from '@/constants'
import { config } from '@/config'
import {
  formatCurrency,
  formatHealthFactor,
  formatPercent,
  logger,
} from '@/lib'
import type { CryptoPrices } from '@/price-feed'
import type { UserData } from '@/user-data'

export type TimeOfDay = 'Morning' | 'Evening'

export interface NotificationParams {
  userData: UserData
  prices?: CryptoPrices
  chainName?: string
  wallet?: string
  timeOfDay?: TimeOfDay
  priority?: number
}

interface SendNotificationOptions {
  title: string
  message: string
  priority: number
  retry?: number
  expire?: number
  url?: string
  urlTitle?: string
}

interface PushoverPayload {
  token: string
  user: string
  message: string
  title: string
  priority: number
  sound: string
  url?: string
  url_title?: string
  retry?: number
  expire?: number
}

interface PushoverResponse {
  status?: number
  request?: string
  errors?: string[]
}

function buildTitle(params: NotificationParams): string {
  const { timeOfDay, priority = PUSHOVER.PRIORITY_NORMAL } = params

  if (priority === PUSHOVER.PRIORITY_EMERGENCY) {
    return `🚨 AAVE Alert: HF ${formatHealthFactor(params.userData.healthFactor)}`
  }

  const emoji =
    timeOfDay === 'Morning' ? '☀️' : timeOfDay === 'Evening' ? '🌙' : '📊'
  const label = timeOfDay ? `${timeOfDay} AAVE Report` : 'AAVE Report'

  return `${emoji} ${label}`
}

function buildMessage(params: NotificationParams): string {
  const {
    userData,
    prices,
    chainName = config.chainName,
    wallet = config.wallet,
    priority = PUSHOVER.PRIORITY_NORMAL,
  } = params

  const hf = formatHealthFactor(userData.healthFactor)
  const collateral = formatCurrency(userData.totalCollateral)
  const debt = formatCurrency(userData.totalDebt)
  const availableBorrows = formatCurrency(userData.availableBorrows)
  const borrowPowerUsed = formatPercent(userData.borrowPowerUsed)

  const isEmergency = priority === PUSHOVER.PRIORITY_EMERGENCY

  const pricesSection = prices
    ? `💰 Market Prices:
• ETH: ${prices.ETH.formattedPrice}
• BTC: ${prices.BTC.formattedPrice}

`
    : ''

  const warningFooter = isEmergency
    ? `
    
⚠️ Your position is at risk of liquidation. Take action immediately!`
    : ''

  return `📊 Health Factor: ${hf} (threshold ${config.hfThreshold})

💼 Account Details:
• Collateral: ${collateral}
• Debt: ${debt}
• Available to Borrow: ${availableBorrows}
• Borrow Power Used: ${borrowPowerUsed}

${pricesSection}🔗 Chain: ${chainName}
💳 Wallet: ${wallet}${warningFooter}`
}

export async function sendNotification(
  params: NotificationParams,
): Promise<void> {
  const priority = params.priority ?? PUSHOVER.PRIORITY_NORMAL
  const title = buildTitle(params)
  const message = buildMessage(params)

  const isEmergency = priority === PUSHOVER.PRIORITY_EMERGENCY

  return sendPushoverNotification({
    title,
    message,
    priority,
    retry: isEmergency ? config.pushover.retry : undefined,
    expire: isEmergency ? config.pushover.expire : undefined,
    url: AAVE.APP_URL,
    urlTitle: AAVE.APP_URL_TITLE,
  })
}

async function sendPushoverNotification(
  options: SendNotificationOptions,
): Promise<void> {
  const { title, message, priority, retry, expire, url, urlTitle } = options
  const { appToken, userKey, sound } = config.pushover

  const payload: PushoverPayload = {
    token: appToken,
    user: userKey,
    message,
    title,
    priority,
    sound,
    url,
    url_title: urlTitle,
  }

  if (priority === PUSHOVER.PRIORITY_EMERGENCY) {
    payload.retry = retry
    payload.expire = expire
  }

  try {
    const response = await fetch(PUSHOVER.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const result = (await response.json()) as PushoverResponse

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

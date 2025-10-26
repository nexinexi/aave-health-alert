import type { UserData } from '@/user-data'
import type { CryptoPrices } from '@/price-feed'
import { AAVE, PUSHOVER } from '@/constants'
import { formatHealthFactor } from '@/lib'
import { sendNotification } from './sender'

interface SendScheduledNotificationParams {
  userData: UserData
  prices: CryptoPrices
  chainName: string
  wallet: string
  timeOfDay: 'Morning' | 'Evening'
}

interface ScheduledNotificationMessageParams {
  healthFactor: string | number
  ethPrice: string
  btcPrice: string
  chainName: string
  wallet: string
  timeOfDay: 'Morning' | 'Evening'
}

function buildScheduledNotificationMessage(
  params: ScheduledNotificationMessageParams,
): string {
  const { healthFactor, ethPrice, btcPrice, chainName, wallet, timeOfDay } =
    params
  const hf = formatHealthFactor(healthFactor)

  return `📊 ${timeOfDay} AAVE Report

Health Factor: ${hf}

Market Prices:
• ETH: ${ethPrice}
• BTC: ${btcPrice}

Chain: ${chainName}
Wallet: ${wallet}`
}

function buildScheduledNotificationTitle(
  timeOfDay: 'Morning' | 'Evening',
): string {
  const emoji = timeOfDay === 'Morning' ? '☀️' : '🌙'
  return `${emoji} ${timeOfDay} AAVE Report`
}

export async function sendScheduledNotification(
  params: SendScheduledNotificationParams,
): Promise<void> {
  const { userData, prices, chainName, wallet, timeOfDay } = params

  const title = buildScheduledNotificationTitle(timeOfDay)
  const message = buildScheduledNotificationMessage({
    healthFactor: userData.healthFactor,
    ethPrice: prices.ETH.formattedPrice,
    btcPrice: prices.BTC.formattedPrice,
    chainName,
    wallet,
    timeOfDay,
  })

  return sendNotification({
    title,
    message,
    priority: PUSHOVER.PRIORITY_NORMAL,
    url: AAVE.APP_URL,
    urlTitle: AAVE.APP_URL_TITLE,
  })
}

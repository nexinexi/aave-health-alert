import type { PublicClient } from 'viem'
import type { Logger, Address, Nullable } from '@/lib'
import { dayjs } from '@/lib'
import { getUserData } from './user-data'
import { getCryptoPrices } from './price-feed'
import { sendScheduledNotification } from './notifications'

export interface ScheduledNotificationOptions {
  client: PublicClient
  wallet: Address
  priceFeeds: { ETH_USD: Address; BTC_USD: Address }
  chainName: string
  morningHour: number
  eveningHour: number
  timezone: string
  logger: Logger
}

interface ScheduleState {
  lastMorningNotification: Nullable<string>
  lastEveningNotification: Nullable<string>
}

const state: ScheduleState = {
  lastMorningNotification: null,
  lastEveningNotification: null,
}

export async function checkScheduledNotifications(
  options: ScheduledNotificationOptions,
): Promise<void> {
  const {
    client,
    wallet,
    priceFeeds,
    chainName,
    morningHour,
    eveningHour,
    timezone: tz,
    logger,
  } = options

  const now = dayjs().tz(tz)
  const currentHour = now.hour()
  const today = now.format('YYYY-MM-DD')

  try {
    // Check if we should send morning notification
    if (currentHour >= morningHour && state.lastMorningNotification !== today) {
      logger.info('Sending morning scheduled notification')

      const [userData, prices] = await Promise.all([
        getUserData(client, wallet),
        getCryptoPrices(client, priceFeeds),
      ])

      await sendScheduledNotification({
        userData,
        prices,
        chainName,
        wallet,
        timeOfDay: 'Morning',
      })

      state.lastMorningNotification = today
      logger.info('Morning notification sent successfully')
    }

    // Check if we should send evening notification
    if (currentHour >= eveningHour && state.lastEveningNotification !== today) {
      logger.info('Sending evening scheduled notification')

      const [userData, prices] = await Promise.all([
        getUserData(client, wallet),
        getCryptoPrices(client, priceFeeds),
      ])

      await sendScheduledNotification({
        userData,
        prices,
        chainName,
        wallet,
        timeOfDay: 'Evening',
      })

      state.lastEveningNotification = today
      logger.info('Evening notification sent successfully')
    }
  } catch (error) {
    logger.error('Error sending scheduled notification', error)
  }
}

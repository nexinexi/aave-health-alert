import { createPublicClient, http } from 'viem'
import { network } from './presets'
import { config } from './config'
import { checkHealthFactor, type CheckHealthFactorOptions } from './monitor'
import {
  checkScheduledNotifications,
  type ScheduledNotificationOptions,
} from './scheduler'
import { logger } from '@/lib'

const client = createPublicClient({
  chain: network.chain,
  transport: network.rpcUrl ? http(network.rpcUrl) : http(),
})

const monitorOptions: CheckHealthFactorOptions = {
  client,
  wallet: config.wallet,
  hfThreshold: config.hfThreshold,
  alertExpireSeconds: config.pushover.expire,
  alertRetrySeconds: config.pushover.retry,
  logger,
}

const schedulerOptions: ScheduledNotificationOptions = {
  client,
  wallet: config.wallet,
  priceFeeds: network.priceFeeds,
  chainName: config.chainName,
  morningHour: config.schedule.morningHour,
  eveningHour: config.schedule.eveningHour,
  timezone: config.schedule.timezone,
  logger,
}

async function main() {
  logger.info('🏁 Starting AAVE Health Factor Monitor', {
    wallet: config.wallet,
    chain: config.chainName,
    hfThreshold: config.hfThreshold.toString(),
    pollInterval: `${config.pollIntervalMs / 1000}s`,
    timezone: config.schedule.timezone,
    schedules: {
      morning: `${config.schedule.morningHour}:00`,
      evening: `${config.schedule.eveningHour}:00`,
    },
  })

  while (true) {
    const started = Date.now()

    await Promise.allSettled([
      checkHealthFactor(monitorOptions),
      checkScheduledNotifications(schedulerOptions),
    ])

    const elapsed = Date.now() - started

    const sleepMs = Math.max(0, config.pollIntervalMs - elapsed)

    await Bun.sleep(sleepMs)
  }
}

main()

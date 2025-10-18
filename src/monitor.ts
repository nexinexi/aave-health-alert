import type { PublicClient } from 'viem'
import type { Logger } from './logger'
import { getUserData } from './user-data'
import { buildNotification, sendNotification } from './notification'
import { formatCurrency, formatHealthFactor, formatPercent } from './format'

export interface CheckHealthFactorOptions {
  client: PublicClient
  wallet: `0x${string}`
  hfThreshold: number
  alertExpireSeconds: number
  alertRetrySeconds: number
  logger: Logger
}

let nextAlertAllowedAt: number | null = null

export async function checkHealthFactor(options: CheckHealthFactorOptions) {
  const {
    client,
    wallet,
    hfThreshold,
    alertExpireSeconds,
    alertRetrySeconds,
    logger,
  } = options

  try {
    const userData = await getUserData(client, wallet)
    const currentHF = parseFloat(userData.healthFactor)

    logger.info('Health Factor Check', {
      healthFactor: formatHealthFactor(currentHF),
      collateral: formatCurrency(userData.totalCollateral),
      debt: formatCurrency(userData.totalDebt),
      utilization: formatPercent(userData.utilization),
      liquidationThreshold: formatPercent(userData.liquidationThreshold),
    })

    if (currentHF < hfThreshold) {
      const now = Date.now()
      const canSendAlert =
        nextAlertAllowedAt === null || now >= nextAlertAllowedAt

      logger.warn('ALERT: Health Factor below threshold', {
        current: formatHealthFactor(currentHF),
        threshold: formatHealthFactor(hfThreshold),
        utilization: formatPercent(userData.utilization),
      })

      if (canSendAlert) {
        const { title, message } = buildNotification(userData)

        await sendNotification(title, message)

        // Set next allowed alert time to current time + expire duration
        nextAlertAllowedAt = now + alertExpireSeconds * 1000

        logger.info('Emergency alert sent', {
          retryInterval: `${alertRetrySeconds}s`,
          expiration: `${alertExpireSeconds / 60}m`,
          nextAlertAllowedAt: new Date(nextAlertAllowedAt).toISOString(),
        })
      } else {
        const timeUntilNextAlert = Math.ceil((nextAlertAllowedAt! - now) / 1000)
        logger.info(
          `Alert cooldown active, next alert allowed in ${timeUntilNextAlert}s`,
        )
      }
    } else {
      if (nextAlertAllowedAt !== null) {
        logger.info('✅ Health Factor recovered above threshold')
        nextAlertAllowedAt = null
      }
    }
  } catch (error) {
    logger.error('Error checking health factor', error)
  }
}

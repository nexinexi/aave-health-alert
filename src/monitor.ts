import type { PublicClient } from 'viem'
import type { Logger, Address, Nullable } from '@/lib'
import { formatCurrency, formatHealthFactor, formatPercent } from '@/lib'
import { PUSHOVER } from '@/constants'
import { getUserData } from './user-data'
import { sendNotification } from './notification'

export interface CheckHealthFactorOptions {
  client: PublicClient
  wallet: Address
  hfThreshold: number
  alertExpireSeconds: number
  alertRetrySeconds: number
  logger: Logger
}

let nextAlertAllowedAt: Nullable<number> = null

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
        await sendNotification({
          userData,
          priority: PUSHOVER.PRIORITY_EMERGENCY,
        })

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

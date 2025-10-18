import { createPublicClient, http } from 'viem'
import { network } from './presets'
import { config } from './config'
import { checkHealthFactor, type CheckHealthFactorOptions } from './monitor'
import { logger } from './logger'

const client = createPublicClient({
  chain: network.chain,
  transport: network.rpcUrl ? http(network.rpcUrl) : http(),
})

const options: CheckHealthFactorOptions = {
  client,
  wallet: config.wallet,
  hfThreshold: config.hfThreshold,
  alertExpireSeconds: config.pushover.expire,
  alertRetrySeconds: config.pushover.retry,
  logger,
}

async function main() {
  logger.info('🏁 Starting AAVE Health Factor Monitor', {
    wallet: config.wallet,
    chain: config.chainName,
    hfThreshold: config.hfThreshold.toString(),
    pollInterval: `${config.pollIntervalMs / 1000}s`,
  })

  while (true) {
    const started = Date.now()

    await checkHealthFactor(options)

    const elapsed = Date.now() - started

    const sleepMs = Math.max(0, config.pollIntervalMs - elapsed)

    await Bun.sleep(sleepMs)
  }
}

main()

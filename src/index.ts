import { createPublicClient, http } from 'viem'
import { network } from './presets'
import { config } from './config'
import { getHealthFactor } from './health-factor'

const client = createPublicClient({
  chain: network.chain,
  transport: network.rpcUrl ? http(network.rpcUrl) : http(),
})

const { wallet } = config

async function main() {
  const result = await getHealthFactor(client, wallet)
  console.log('Health Factor Result:', result)
}

main()

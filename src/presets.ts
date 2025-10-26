import type { Chain } from 'viem'
import { arbitrum, mainnet } from 'viem/chains'
import { config } from './config'
import type { Address } from '@/lib'

export type SupportedChainKey = 'arbitrum' | 'ethereum'

interface ChainPreset {
  chain: Chain
  poolAddress: Address
  priceFeeds: {
    ETH_USD: Address
    BTC_USD: Address
  }
  rpcUrl?: string
}

export const PRESETS: Record<SupportedChainKey, ChainPreset> = {
  arbitrum: {
    chain: arbitrum,
    // https://arbiscan.io/address/0x794a61358D6845594F94dc1DB02A252b5b4814aD
    poolAddress: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    // Chainlink Price Feeds on Arbitrum
    // https://docs.chain.link/data-feeds/price-feeds/addresses?network=arbitrum
    priceFeeds: {
      ETH_USD: '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612',
      BTC_USD: '0x6ce185860a4963106506C203335A2910413708e9',
    },
  },
  ethereum: {
    chain: mainnet,
    // https://etherscan.io/address/0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2
    poolAddress: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
    rpcUrl: 'https://eth.llamarpc.com',
    // Chainlink Price Feeds on Ethereum Mainnet
    // https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum
    priceFeeds: {
      ETH_USD: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
      BTC_USD: '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
    },
  },
}

export const network = (function () {
  const chainName = config.chainName
  const preset = PRESETS[chainName]
  const envAddress = config.poolAddressOverride

  if (!preset && !envAddress) {
    throw new Error(
      'Unknown CHAIN. Set CHAIN to a supported value or provide POOL_ADDRESS explicitly.',
    )
  }

  const poolAddress = envAddress ?? preset!.poolAddress
  const rpcUrl = config.rpcUrlOverride ?? preset?.rpcUrl

  return {
    ...preset,
    poolAddress,
    rpcUrl,
  }
})()

import type { Chain } from 'viem'
import { arbitrum, mainnet } from 'viem/chains'
import { config } from './config'

export type SupportedChainKey = 'arbitrum' | 'ethereum'

export const PRESETS: Record<
  SupportedChainKey,
  { chain: Chain; poolAddress: `0x${string}`; rpcUrl?: string }
> = {
  arbitrum: {
    chain: arbitrum,
    // https://arbiscan.io/address/0x794a61358D6845594F94dc1DB02A252b5b4814aD
    poolAddress: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
  },
  ethereum: {
    chain: mainnet,
    // https://etherscan.io/address/0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2
    poolAddress: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
    rpcUrl: 'https://eth.llamarpc.com',
  },
}

// https://aave.com/docs/developers/smart-contracts/pool#view-methods-getuseraccountdata
export const POOL_ABI = [
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserAccountData',
    outputs: [
      { name: 'totalCollateralBase', type: 'uint256' },
      { name: 'totalDebtBase', type: 'uint256' },
      { name: 'availableBorrowsBase', type: 'uint256' },
      { name: 'currentLiquidationThreshold', type: 'uint256' },
      { name: 'ltv', type: 'uint256' },
      { name: 'healthFactor', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

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

  return { chain: preset.chain, poolAddress, rpcUrl }
})()

import { formatUnits } from 'viem'
import type { PublicClient } from 'viem'
import { POOL_ABI, network } from './presets'

const HEALTH_FACTOR_DECIMALS = 18
const BASE_CURRENCY_DECIMALS = 8

export async function getHealthFactor(
  client: PublicClient,
  userAddress: `0x${string}`,
) {
  try {
    const data = await client.readContract({
      address: network.poolAddress,
      abi: POOL_ABI,
      functionName: 'getUserAccountData',
      args: [userAddress],
    })

    const [
      totalCollateralBase,
      totalDebtBase,
      availableBorrowsBase,
      currentLiquidationThreshold,
      ltv,
      healthFactor,
    ] = data

    const formattedHealthFactor = formatUnits(
      healthFactor,
      HEALTH_FACTOR_DECIMALS,
    )
    const formattedCollateral = formatUnits(
      totalCollateralBase,
      BASE_CURRENCY_DECIMALS,
    )
    const formattedDebt = formatUnits(totalDebtBase, BASE_CURRENCY_DECIMALS)
    const formattedAvailableBorrows = formatUnits(
      availableBorrowsBase,
      BASE_CURRENCY_DECIMALS,
    )

    return {
      healthFactor: formattedHealthFactor,
      totalCollateral: formattedCollateral,
      totalDebt: formattedDebt,
      availableBorrows: formattedAvailableBorrows,
      liquidationThreshold: Number(currentLiquidationThreshold) / 100,
      ltv: Number(ltv) / 100,
    }
  } catch (error) {
    console.error('Error fetching health factor:', error)
    throw error
  }
}

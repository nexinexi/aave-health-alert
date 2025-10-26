import { formatUnits } from 'viem'
import type { PublicClient } from 'viem'
import { network } from './presets'
import { POOL_ABI } from './abi'
import { DECIMALS } from './constants'
import { calculateUtilization } from '@/lib'
import type { Address } from '@/lib'

export interface UserData {
  healthFactor: string
  totalCollateral: string
  totalDebt: string
  availableBorrows: string
  liquidationThreshold: number
  ltv: number
  utilization: number
}

export async function getUserData(
  client: PublicClient,
  userAddress: Address,
): Promise<UserData> {
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
      DECIMALS.HEALTH_FACTOR,
    )
    const formattedCollateral = formatUnits(
      totalCollateralBase,
      DECIMALS.BASE_CURRENCY,
    )
    const formattedDebt = formatUnits(totalDebtBase, DECIMALS.BASE_CURRENCY)
    const formattedAvailableBorrows = formatUnits(
      availableBorrowsBase,
      DECIMALS.BASE_CURRENCY,
    )
    const utilization = calculateUtilization(formattedDebt, formattedCollateral)

    return {
      healthFactor: formattedHealthFactor,
      totalCollateral: formattedCollateral,
      totalDebt: formattedDebt,
      availableBorrows: formattedAvailableBorrows,
      liquidationThreshold: Number(currentLiquidationThreshold) / 100,
      ltv: Number(ltv) / 100,
      utilization,
    }
  } catch (error) {
    console.error('Error fetching health factor:', error)
    throw error
  }
}

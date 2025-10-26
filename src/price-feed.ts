import type { PublicClient } from 'viem'
import { formatUnits } from 'viem'
import { CHAINLINK_PRICE_FEED_ABI } from './abi'
import type { Address } from '@/lib'
import { formatCurrency } from '@/lib'

export interface CryptoPrice {
  symbol: string
  price: number
  formattedPrice: string
}

export interface CryptoPrices {
  ETH: CryptoPrice
  BTC: CryptoPrice
}

async function fetchPrice(
  client: PublicClient,
  feedAddress: Address,
  symbol: string,
): Promise<CryptoPrice> {
  const data = await client.readContract({
    address: feedAddress,
    abi: CHAINLINK_PRICE_FEED_ABI,
    functionName: 'latestRoundData',
  })

  const [, answer] = data

  // Chainlink price feeds for USD pairs use 8 decimals
  const price = Number(formatUnits(answer, 8))

  return {
    symbol,
    price,
    formattedPrice: formatCurrency(price),
  }
}

export async function getCryptoPrices(
  client: PublicClient,
  priceFeeds: { ETH_USD: Address; BTC_USD: Address },
): Promise<CryptoPrices> {
  const [ethPrice, btcPrice] = await Promise.all([
    fetchPrice(client, priceFeeds.ETH_USD, 'ETH'),
    fetchPrice(client, priceFeeds.BTC_USD, 'BTC'),
  ])

  return {
    ETH: ethPrice,
    BTC: btcPrice,
  }
}

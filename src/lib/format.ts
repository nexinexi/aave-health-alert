const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatCurrency(value: string | number, prefix = '$'): string {
  return `${prefix}${currencyFormatter.format(parseFloat(value.toString()))}`
}

export function formatHealthFactor(value: string | number): string {
  return parseFloat(value.toString()).toFixed(2)
}

export function formatPercent(value: string | number): string {
  return `${parseFloat(value.toString()).toFixed(2)}%`
}

export function calculateUtilization(
  totalDebt: string | number,
  totalCollateral: string | number,
): number {
  const debt = parseFloat(totalDebt.toString())
  const collateral = parseFloat(totalCollateral.toString())

  if (collateral <= 0) {
    return 0
  }

  return (debt / collateral) * 100
}

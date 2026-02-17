/**
 * Format a number as currency with symbol, code, and amount.
 * Output: "$(USD) 1,234.56" — symbol + (CODE) + space + amount
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  const parts = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
  }).formatToParts(amount)

  const symbol = parts.find((p) => p.type === 'currency')?.value ?? '$'
  const numericParts = parts
    .filter((p) => p.type !== 'currency' && p.type !== 'literal')
    .map((p) => p.value)
    .join('')

  return `${symbol}(${currency}) ${numericParts}`
}

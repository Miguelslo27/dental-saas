/**
 * Format a number as currency with symbol and code.
 * Output: "$ 1,234.56 (USD)" — symbol + space + amount + space + (CODE)
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  const formatted = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
  }).format(amount)
  return `${formatted} (${currency})`
}

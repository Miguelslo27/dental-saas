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

/**
 * Format a Date as YYYY-MM-DD using the LOCAL timezone.
 * Use for <input type="date"> values — avoid toISOString() which shifts to UTC
 * and can produce the wrong day near midnight.
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const rupeesExact = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const wholeNumber = new Intl.NumberFormat('en-IN')

export function formatMoney(value: number): string {
  return rupees.format(value)
}

export function formatMoneyExact(value: number): string {
  return rupeesExact.format(value)
}

export function formatNumber(value: number): string {
  return wholeNumber.format(value)
}

export function formatDays(value: number): string {
  return value >= 100 ? `${Math.round(value)}` : value.toFixed(1)
}

export function formatDate(value: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  })
}

export function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

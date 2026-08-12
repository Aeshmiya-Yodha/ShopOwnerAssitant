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

export function initials(name: string): string {
  const words = name.trim().split(/\s+/)
  const letters =
    words.length > 1 ? `${words[0][0]}${words[1][0]}` : name.trim().slice(0, 2)
  return letters.toUpperCase()
}

// Same product always gets the same avatar colour, so rows stay recognisable.
export function accentFor(seed: string): string {
  let hue = 0
  for (let index = 0; index < seed.length; index += 1) {
    hue = (hue * 31 + seed.charCodeAt(index)) % 360
  }
  return `linear-gradient(135deg, hsl(${hue} 68% 58%), hsl(${(hue + 28) % 360} 66% 46%))`
}

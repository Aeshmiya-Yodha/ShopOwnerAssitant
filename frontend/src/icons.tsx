type IconProps = { className?: string }

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function StoreIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M3.5 9.5V19a1 1 0 0 0 1 1h15a1 1 0 0 0 1-1V9.5" {...stroke} />
      <path d="M3 6.8 4.2 4.2A1 1 0 0 1 5.1 3.6h13.8a1 1 0 0 1 .9.6L21 6.8a2.6 2.6 0 0 1-4.5 2.5 2.6 2.6 0 0 1-4.5 0 2.6 2.6 0 0 1-4.5 0A2.6 2.6 0 0 1 3 6.8Z" {...stroke} />
      <path d="M9.5 20v-4.6h5V20" {...stroke} />
    </svg>
  )
}

export function GridIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="2" {...stroke} />
      <rect x="13.5" y="3.5" width="7" height="5" rx="2" {...stroke} />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2" {...stroke} />
      <rect x="13.5" y="11.5" width="7" height="9" rx="2" {...stroke} />
    </svg>
  )
}

export function CartIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M3 4h2.1a1 1 0 0 1 1 .8l2.2 10.4a1 1 0 0 0 1 .8h8.4a1 1 0 0 0 1-.77L20.5 8H7" {...stroke} />
      <circle cx="10" cy="19.5" r="1.4" {...stroke} />
      <circle cx="17.5" cy="19.5" r="1.4" {...stroke} />
    </svg>
  )
}

export function RupeeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M7 4h10M7 8.2h10M7 12.2h4.2c2.4 0 4.3-1.8 4.3-4.1M7 20l7.4-7.8" {...stroke} />
    </svg>
  )
}

export function BoxIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="m12 3 8 4.2v9.6L12 21l-8-4.2V7.2L12 3Z" {...stroke} />
      <path d="m4.3 7.4 7.7 4 7.7-4M12 11.4V21" {...stroke} />
    </svg>
  )
}

export function AlertIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 4.2 21 19.4H3L12 4.2Z" {...stroke} />
      <path d="M12 10v3.6M12 16.7h.01" {...stroke} />
    </svg>
  )
}

export function SnoozeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M20.2 14.2A8.3 8.3 0 0 1 9.6 3.9a8.3 8.3 0 1 0 10.6 10.3Z" {...stroke} />
    </svg>
  )
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.4" {...stroke} />
      <path d="M12 7.6V12l2.8 1.8" {...stroke} />
    </svg>
  )
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="m5 12.6 4.6 4.5L19 7.4" {...stroke} strokeWidth={2.2} />
    </svg>
  )
}

export function SparkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"
        fill="currentColor"
      />
      <path
        d="M18.5 14.5l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9.9-2.4z"
        fill="currentColor"
        opacity="0.7"
      />
    </svg>
  )
}

export function SendIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 19V5M12 5l-6 6M12 5l6 6" {...stroke} strokeWidth={2} />
    </svg>
  )
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M6 7h12M10 7V5h4v2m-7 0 1 12h8l1-12" {...stroke} strokeWidth={1.8} />
    </svg>
  )
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M7 7l10 10M17 7L7 17" {...stroke} strokeWidth={1.8} />
    </svg>
  )
}

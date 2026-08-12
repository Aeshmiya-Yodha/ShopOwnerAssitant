import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'

import { fetchDashboard } from './api'
import {
  accentFor,
  formatDate,
  formatDays,
  formatMoney,
  formatMoneyExact,
  formatNumber,
  formatTimestamp,
  initials,
} from './format'
import {
  AlertIcon,
  BoxIcon,
  ClockIcon,
  GridIcon,
  RupeeIcon,
  SnoozeIcon,
} from './icons'
import type { DashboardResponse, ProductStock, StockStatus } from './types'

const STATUS_LABEL: Record<StockStatus, string> = {
  must_order_today: 'Order today',
  expiring: 'Expiring',
  low: 'Low',
  ok: 'OK',
  dead: 'Not selling',
}

// Urgent first, healthy last. Matches the order the shop owner cares about.
const STATUS_RANK: Record<StockStatus, number> = {
  must_order_today: 0,
  expiring: 1,
  low: 2,
  ok: 3,
  dead: 4,
}

const STATUS_COLOR: Record<StockStatus, string> = {
  must_order_today: '#ef4444',
  expiring: '#f97316',
  low: '#f59e0b',
  ok: '#10b981',
  dead: '#94a3b8',
}

function StatusBadge({ status }: { status: StockStatus }) {
  return <span className={`badge badge-${status}`}>{STATUS_LABEL[status]}</span>
}

function KpiCard({
  label,
  value,
  hint,
  icon,
  tone = 'brand',
}: {
  label: string
  value: string
  hint: string
  icon: ReactNode
  tone?: 'brand' | 'positive' | 'alert' | 'muted'
}) {
  return (
    <div className={`kpi kpi-${tone}`}>
      <div className="kpi-top">
        <span className="kpi-icon">{icon}</span>
        <span className="kpi-label">{label}</span>
      </div>
      <span className="kpi-value">{value}</span>
      <span className="kpi-hint">{hint}</span>
    </div>
  )
}

function ProductCell({ product }: { product: ProductStock }) {
  return (
    <div className="cell-product">
      <span
        className="cell-avatar"
        style={{ background: accentFor(product.product_id) }}
        aria-hidden="true"
      >
        {initials(product.name)}
      </span>
      <div>
        <div className="cell-name">{product.name}</div>
        <div className="cell-sub">{product.category}</div>
      </div>
    </div>
  )
}

// Full bar = three lead times of cover, which is comfortably stocked.
function CoverCell({ product }: { product: ProductStock }) {
  const filled = Math.min(
    100,
    (product.days_of_cover / Math.max(product.lead_time_days * 3, 1)) * 100,
  )

  return (
    <div className="cover-cell">
      <span>
        <span className="cover">{formatDays(product.days_of_cover)}</span>
        <span className="cell-sub"> vs {product.lead_time_days}d lead</span>
      </span>
      <span
        className="meter"
        style={{ '--meter': STATUS_COLOR[product.status] } as CSSProperties}
      >
        <span style={{ width: `${filled}%` }} />
      </span>
    </div>
  )
}

function ProductRow({ product }: { product: ProductStock }) {
  return (
    <tr>
      <td>
        <ProductCell product={product} />
      </td>
      <td className="num">{formatNumber(product.qty_on_hand)}</td>
      <td className="num">
        <CoverCell product={product} />
      </td>
      <td className="num">{product.avg_daily_sales_7d.toFixed(1)}</td>
      <td className="num">
        {product.suggested_order_qty > 0 ? (
          <strong>{formatNumber(product.suggested_order_qty)}</strong>
        ) : (
          <span className="dash">—</span>
        )}
      </td>
      <td className="num">{formatDate(product.stock_expiry_date)}</td>
      <td className="num money">{formatMoneyExact(product.revenue_7d)}</td>
      <td>
        <StatusBadge status={product.status} />
      </td>
    </tr>
  )
}

function DashboardSkeleton() {
  return (
    <>
      <div className="kpi-grid">
        {[0, 1, 2, 3].map((slot) => (
          <div key={slot} className="skeleton skeleton-kpi" />
        ))}
      </div>
      <div className="panel skeleton-panel">
        {[0, 1, 2, 3, 4, 5].map((slot) => (
          <div key={slot} className="skeleton skeleton-line" />
        ))}
      </div>
    </>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    fetchDashboard()
      .then((result) => {
        if (active) setData(result)
      })
      .catch((err: Error) => {
        if (active) setError(err.message)
      })

    return () => {
      active = false
    }
  }, [])

  if (error) {
    return (
      <div className="state state-error">
        <strong>Could not load the dashboard.</strong>
        <span>{error}</span>
      </div>
    )
  }

  if (!data) {
    return <DashboardSkeleton />
  }

  const products = [...data.products].sort(
    (a, b) =>
      STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
      a.days_of_cover - b.days_of_cover,
  )

  return (
    <>
      <div className="section-head">
        <div>
          <h2>Overview</h2>
          <p>How the shop has performed over the last seven days.</p>
        </div>
      </div>

      <div className="kpi-grid">
        <KpiCard
          label="Revenue, last 7 days"
          value={formatMoney(data.totals.revenue_7d)}
          hint={`${formatNumber(data.totals.units_sold_7d)} units sold`}
          icon={<RupeeIcon />}
          tone="positive"
        />
        <KpiCard
          label="Units sold, last 7 days"
          value={formatNumber(data.totals.units_sold_7d)}
          hint="across all products"
          icon={<BoxIcon />}
        />
        <KpiCard
          label="Needs ordering"
          value={formatNumber(data.totals.needs_order_count)}
          hint="running low or below lead time"
          icon={<AlertIcon />}
          tone="alert"
        />
        <KpiCard
          label="Not selling"
          value={formatNumber(data.totals.dead_stock_count)}
          hint="90+ days of cover"
          icon={<SnoozeIcon />}
          tone="muted"
        />
      </div>

      <section className="panel">
        <header className="panel-head">
          <h2>
            <GridIcon />
            Stock position
          </h2>
          <span className="panel-sub">
            <ClockIcon />
            Updated {formatTimestamp(data.generated_at)}
          </span>
        </header>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th className="num">In stock</th>
                <th className="num">Days of cover</th>
                <th className="num">Sold / day</th>
                <th className="num">Suggested order</th>
                <th className="num">Expires</th>
                <th className="num">Revenue 7d</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <ProductRow key={product.product_id} product={product} />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

import { useEffect, useState } from 'react'

import { fetchDashboard } from './api'
import {
  formatDate,
  formatDays,
  formatMoney,
  formatMoneyExact,
  formatNumber,
  formatTimestamp,
} from './format'
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

function StatusBadge({ status }: { status: StockStatus }) {
  return <span className={`badge badge-${status}`}>{STATUS_LABEL[status]}</span>
}

function KpiCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: string
  hint: string
  tone?: 'alert' | 'muted'
}) {
  return (
    <div className={`kpi${tone ? ` kpi-${tone}` : ''}`}>
      <span className="kpi-label">{label}</span>
      <span className="kpi-value">{value}</span>
      <span className="kpi-hint">{hint}</span>
    </div>
  )
}

function ProductRow({ product }: { product: ProductStock }) {
  return (
    <tr>
      <td>
        <div className="cell-name">{product.name}</div>
        <div className="cell-sub">{product.category}</div>
      </td>
      <td className="num">{formatNumber(product.qty_on_hand)}</td>
      <td className="num">
        <span className="cover">{formatDays(product.days_of_cover)}</span>
        <span className="cell-sub"> vs {product.lead_time_days}d lead</span>
      </td>
      <td className="num">{product.avg_daily_sales_7d.toFixed(1)}</td>
      <td className="num">
        {product.suggested_order_qty > 0
          ? formatNumber(product.suggested_order_qty)
          : '—'}
      </td>
      <td className="num">{formatDate(product.stock_expiry_date)}</td>
      <td className="num">{formatMoneyExact(product.revenue_7d)}</td>
      <td>
        <StatusBadge status={product.status} />
      </td>
    </tr>
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
    return <div className="state">Loading stock position…</div>
  }

  const products = [...data.products].sort(
    (a, b) =>
      STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
      a.days_of_cover - b.days_of_cover,
  )

  return (
    <>
      <div className="kpi-grid">
        <KpiCard
          label="Revenue, last 7 days"
          value={formatMoney(data.totals.revenue_7d)}
          hint={`${formatNumber(data.totals.units_sold_7d)} units sold`}
        />
        <KpiCard
          label="Units sold, last 7 days"
          value={formatNumber(data.totals.units_sold_7d)}
          hint="across all products"
        />
        <KpiCard
          label="Needs ordering"
          value={formatNumber(data.totals.needs_order_count)}
          hint="running low or below lead time"
          tone="alert"
        />
        <KpiCard
          label="Not selling"
          value={formatNumber(data.totals.dead_stock_count)}
          hint="90+ days of cover"
          tone="muted"
        />
      </div>

      <section className="panel">
        <header className="panel-head">
          <h2>Stock position</h2>
          <span className="panel-sub">
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

import { useEffect, useMemo, useState } from 'react'

import { fetchDashboard, submitStockRequest } from './api'
import { formatDays, formatNumber } from './format'
import type {
  DashboardResponse,
  ProductStock,
  StockRequestResponse,
  StockStatus,
} from './types'

const STATUS_LABEL: Record<StockStatus, string> = {
  must_order_today: 'Order today',
  expiring: 'Expiring',
  low: 'Low',
  ok: 'OK',
  dead: 'Not selling',
}

const STATUS_RANK: Record<StockStatus, number> = {
  must_order_today: 0,
  expiring: 1,
  low: 2,
  ok: 3,
  dead: 4,
}

export default function RequestStockPage() {
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  // product_id -> quantity. Presence in the map means the row is selected.
  const [picked, setPicked] = useState<Record<string, number>>({})
  const [note, setNote] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<StockRequestResponse | null>(null)

  useEffect(() => {
    let active = true

    fetchDashboard()
      .then((response) => {
        if (!active) return
        setData(response)
        // Start with everything the numbers say needs ordering.
        const preselected: Record<string, number> = {}
        for (const product of response.products) {
          if (product.suggested_order_qty > 0) {
            preselected[product.product_id] = product.suggested_order_qty
          }
        }
        setPicked(preselected)
      })
      .catch((err: Error) => {
        if (active) setLoadError(err.message)
      })

    return () => {
      active = false
    }
  }, [])

  const products = useMemo(() => {
    if (!data) return []
    return [...data.products].sort(
      (a, b) =>
        STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
        a.days_of_cover - b.days_of_cover,
    )
  }, [data])

  const lines = useMemo(
    () =>
      Object.entries(picked)
        .filter(([, qty]) => qty > 0)
        .map(([product_id, qty]) => ({ product_id, qty })),
    [picked],
  )

  const totalUnits = lines.reduce((sum, line) => sum + line.qty, 0)

  function toggle(product: ProductStock) {
    setPicked((current) => {
      const next = { ...current }
      if (product.product_id in next) {
        delete next[product.product_id]
      } else {
        next[product.product_id] = product.suggested_order_qty || 1
      }
      return next
    })
  }

  function setQty(productId: string, value: number) {
    setPicked((current) => ({ ...current, [productId]: Math.max(0, value) }))
  }

  function handleSubmit() {
    setSubmitting(true)
    setSubmitError(null)

    submitStockRequest({ note: note.trim() || null, source: 'manual', lines })
      .then((response) => {
        setResult(response)
        setPicked({})
        setNote('')
      })
      .catch((err: Error) => setSubmitError(err.message))
      .finally(() => setSubmitting(false))
  }

  if (loadError) {
    return (
      <div className="state state-error">
        <strong>Could not load products.</strong>
        <span>{loadError}</span>
      </div>
    )
  }

  if (!data) {
    return <div className="state">Loading products…</div>
  }

  if (result) {
    return (
      <div className="panel receipt">
        <div className="receipt-tick">✓</div>
        <h2>Request #{result.request_id} submitted</h2>
        <p>
          {formatNumber(result.line_count)} products,{' '}
          {formatNumber(result.total_qty)} units. Status {result.status}.
        </p>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setResult(null)}
        >
          Raise another request
        </button>
      </div>
    )
  }

  return (
    <>
      <section className="panel">
        <header className="panel-head">
          <h2>Request stock</h2>
          <span className="panel-sub">
            Products needing an order are ticked already
          </span>
        </header>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="pick-col"></th>
                <th>Product</th>
                <th className="num">In stock</th>
                <th className="num">Days of cover</th>
                <th className="num">Suggested</th>
                <th>Status</th>
                <th className="num">Order quantity</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const isPicked = product.product_id in picked
                return (
                  <tr
                    key={product.product_id}
                    className={isPicked ? 'row-picked' : undefined}
                  >
                    <td className="pick-col">
                      <input
                        type="checkbox"
                        checked={isPicked}
                        onChange={() => toggle(product)}
                        aria-label={`Include ${product.name}`}
                      />
                    </td>
                    <td>
                      <div className="cell-name">{product.name}</div>
                      <div className="cell-sub">{product.category}</div>
                    </td>
                    <td className="num">{formatNumber(product.qty_on_hand)}</td>
                    <td className="num">
                      {formatDays(product.days_of_cover)}
                      <span className="cell-sub">
                        {' '}
                        vs {product.lead_time_days}d lead
                      </span>
                    </td>
                    <td className="num">
                      {product.suggested_order_qty > 0
                        ? formatNumber(product.suggested_order_qty)
                        : '—'}
                    </td>
                    <td>
                      <span className={`badge badge-${product.status}`}>
                        {STATUS_LABEL[product.status]}
                      </span>
                    </td>
                    <td className="num">
                      <input
                        type="number"
                        className="qty-input"
                        min={0}
                        step={1}
                        disabled={!isPicked}
                        value={isPicked ? picked[product.product_id] : ''}
                        onChange={(event) =>
                          setQty(product.product_id, Number(event.target.value))
                        }
                        aria-label={`Quantity for ${product.name}`}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel submit-panel">
        <label className="field">
          <span className="field-label">Note for the supplier (optional)</span>
          <textarea
            rows={2}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Deliver before Friday morning"
          />
        </label>

        {submitError && (
          <div className="state state-error">
            <strong>Could not submit.</strong>
            <span>{submitError}</span>
          </div>
        )}

        <div className="submit-bar">
          <div className="submit-summary">
            <strong>{formatNumber(lines.length)}</strong> products,{' '}
            <strong>{formatNumber(totalUnits)}</strong> units
          </div>
          <button
            type="button"
            className="btn btn-primary"
            disabled={lines.length === 0 || submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Submitting…' : 'Submit request'}
          </button>
        </div>
      </section>
    </>
  )
}

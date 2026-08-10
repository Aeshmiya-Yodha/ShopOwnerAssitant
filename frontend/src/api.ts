import { mockDashboard } from './mockData'
import type {
  DashboardResponse,
  StockRequestCreate,
  StockRequestResponse,
} from './types'

// Flip to false once GET /api/dashboard returns real data.
const USE_MOCK = false

// Flip to false once POST /api/stock-requests exists.
const USE_MOCK_REQUESTS = true

export async function fetchDashboard(): Promise<DashboardResponse> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockDashboard
  }

  const response = await fetch('/api/dashboard')
  if (!response.ok) {
    throw new Error(`Dashboard request failed (${response.status})`)
  }
  return response.json()
}

export async function submitStockRequest(
  payload: StockRequestCreate,
): Promise<StockRequestResponse> {
  if (USE_MOCK_REQUESTS) {
    await new Promise((resolve) => setTimeout(resolve, 600))
    return {
      request_id: Math.floor(Math.random() * 900) + 100,
      created_at: new Date().toISOString(),
      status: 'submitted',
      line_count: payload.lines.length,
      total_qty: payload.lines.reduce((sum, line) => sum + line.qty, 0),
    }
  }

  const response = await fetch('/api/stock-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`Stock request failed (${response.status})`)
  }
  return response.json()
}

import { mockDashboard } from './mockData'
import type { DashboardResponse } from './types'

// Flip to false once GET /api/dashboard returns real data.
const USE_MOCK = true

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

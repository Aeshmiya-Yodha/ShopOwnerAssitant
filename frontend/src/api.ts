import { mockDashboard } from './mockData'
import type {
  ChatRequest,
  ChatResponse,
  DashboardResponse,
  StockRequestCreate,
  StockRequestResponse,
} from './types'

// Flip to false once GET /api/dashboard returns real data.
const USE_MOCK = false

// Use the FastAPI endpoint for stock requests.
const USE_MOCK_REQUESTS = false

// Flip to false once POST /api/chat exists.
const USE_MOCK_CHAT = true

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

function mockReply(message: string): string {
  const text = message.toLowerCase()

  if (text.includes('order') || text.includes('today')) {
    return 'Two products need ordering today. Toor Dal has 4 days of cover against a 5 day lead time, so it will run out before a delivery arrives. Aashirvaad Atta is 5 days against a 6 day lead time. Suggested quantities are 80 and 30.'
  }
  if (text.includes('sell') || text.includes('slow') || text.includes('dead')) {
    return 'Three products have stopped moving. Tetley Green Tea has 140 days of cover, Dairy Milk Silk 113 days, and Marie Gold 100 days. Together they earned about 455 rupees in the last week.'
  }
  if (text.includes('expir')) {
    return 'Amul Paneer expires on 12 August with 14 units left, and Nestle Milkmaid on 15 August with 9 units. Paneer is the urgent one at two days away.'
  }
  return 'Stock is healthy on 5 products. Two need ordering today, two are expiring this week, and three have stopped selling. Ask me about any of those.'
}

export async function sendChatMessage(
  payload: ChatRequest,
): Promise<ChatResponse> {
  if (USE_MOCK_CHAT) {
    await new Promise((resolve) => setTimeout(resolve, 700))
    return {
      conversation_id: payload.conversation_id ?? 1,
      reply: mockReply(payload.message),
    }
  }

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`Chat request failed (${response.status})`)
  }
  return response.json()
}

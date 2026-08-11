export type StockStatus =
  | 'must_order_today'
  | 'low'
  | 'ok'
  | 'dead'
  | 'expiring'

export interface ProductStock {
  product_id: string
  name: string
  category: string
  qty_on_hand: number
  avg_daily_sales_7d: number
  days_of_cover: number
  lead_time_days: number
  suggested_order_qty: number
  stock_expiry_date: string | null
  revenue_7d: number
  status: StockStatus
}

export interface DashboardTotals {
  revenue_7d: number
  units_sold_7d: number
  needs_order_count: number
  dead_stock_count: number
}

export interface DashboardResponse {
  generated_at: string
  totals: DashboardTotals
  products: ProductStock[]
}

export type RequestSource = 'manual' | 'ai_suggested'

export interface StockRequestLineCreate {
  product_id: string
  qty: number
}

export interface StockRequestCreate {
  note: string | null
  source: RequestSource
  lines: StockRequestLineCreate[]
}

export interface StockRequestResponse {
  request_id: number | null
  created_at: string
  status: string
  line_count: number
  total_qty: number
}

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

export interface ChatRequest {
  conversation_id: number | null
  message: string
}

export interface ChatResponse {
  conversation_id: number
  reply: string
}

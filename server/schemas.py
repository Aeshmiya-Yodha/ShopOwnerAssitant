from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel
from sqlmodel import SQLModel 

StockStatus = Literal["must_order_today", "low", "ok", "dead", "expiring"]


class ProductStock(SQLModel):
    """One row of the stock position. Also the shape sent to the AI as context."""

    product_id: str
    name: str
    category: str
    qty_on_hand: int
    avg_daily_sales_7d: float
    days_of_cover: float
    lead_time_days: int
    suggested_order_qty: int
    stock_expiry_date: date | None
    revenue_7d: float
    status: StockStatus


class DashboardTotals(SQLModel):
    revenue_7d: float
    units_sold_7d: int
    needs_order_count: int
    dead_stock_count: int


class DashboardResponse(SQLModel):
    generated_at: datetime
    totals: DashboardTotals
    products: list[ProductStock]

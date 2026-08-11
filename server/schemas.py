from datetime import date, datetime
from typing import Annotated, Literal

from pydantic import BaseModel, Field


StockStatus = Literal[
    "must_order_today",
    "low",
    "ok",
    "dead",
    "expiring",
]


class ProductStock(BaseModel):
    """One row of the stock position. Also the shape sent to the AI as context."""

    product_id: Annotated[str, Field(min_length=1)]
    name: Annotated[str, Field(min_length=1)]
    category: Annotated[str, Field(min_length=1)]

    qty_on_hand: Annotated[int, Field(ge=0)]
    avg_daily_sales_7d: Annotated[float, Field(ge=0)]
    days_of_cover: Annotated[float, Field(ge=0)]

    lead_time_days: Annotated[int, Field(ge=0)]
    suggested_order_qty: Annotated[int, Field(ge=0)]

    stock_expiry_date: Annotated[date | None, Field()] = None

    revenue_7d: Annotated[float, Field(ge=0)]

    status: Annotated[StockStatus, Field()]


class DashboardTotals(BaseModel):
    revenue_7d: Annotated[float, Field(ge=0)]
    units_sold_7d: Annotated[int, Field(ge=0)]
    needs_order_count: Annotated[int, Field(ge=0)]
    dead_stock_count: Annotated[int, Field(ge=0)]


class DashboardResponse(BaseModel):
    generated_at: Annotated[datetime, Field()]
    totals: Annotated[DashboardTotals, Field()]
    products: list[ProductStock]


class StockLineCreate(BaseModel):
    product_id: Annotated[str, Field(min_length=1)]
    qty: Annotated[int, Field(gt=0)]


class StockRequestCreate(BaseModel):
    note: Annotated[str | None, Field()] = None

    source: Annotated[
        Literal["manual", "ai_suggested"],
        Field()
    ] = "manual"

    lines: Annotated[
        list[StockLineCreate],
        Field(min_length=1)
    ]


class StockRequestResponse(BaseModel):
    request_id: Annotated[int, Field(gt=0)]
    created_at: Annotated[datetime, Field()]
    status: Annotated[
        Literal["submitted", "received", "cancelled"],
        Field(),
    ]
    line_count: Annotated[int, Field(gt=0)]
    total_qty: Annotated[int, Field(gt=0)]
from datetime import datetime, timezone

from fastapi import APIRouter
from sqlmodel import select

from server.schemas import DashboardResponse, DashboardTotals, ProductStock
from server.database import SessionDep
from server.model import StockPosition

router = APIRouter()

NEEDS_ORDER_STATUSES = {"must_order_today", "low"}


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(session: SessionDep) -> DashboardResponse:
    rows = session.exec(
        select(StockPosition).order_by(StockPosition.days_of_cover)
    ).all()

    return DashboardResponse(
        generated_at=datetime.now(timezone.utc),
        totals=DashboardTotals(
            revenue_7d=sum(row.revenue_7d for row in rows),
            units_sold_7d=sum(row.units_7d for row in rows),
            needs_order_count=sum(1 for row in rows if row.status in NEEDS_ORDER_STATUSES),
            dead_stock_count=sum(1 for row in rows if row.status == "dead"),
        ),
        products=[ProductStock.model_validate(row, from_attributes=True) for row in rows],
    )




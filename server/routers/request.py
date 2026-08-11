from datetime import datetime, timezone

from fastapi import APIRouter

from server.schemas import (
    StockRequestCreate,
    StockRequestResponse,
)


router = APIRouter()


@router.post("/stock-requests", response_model=StockRequestResponse,status_code=201)
def create_stock_request(stock_request: StockRequestCreate):

    response = StockRequestResponse(
        request_id=None,
        created_at=datetime.now(timezone.utc),
        status="submitted",
        line_count=len(stock_request.lines),
        total_qty=sum(line.qty for line in stock_request.lines),
    )

    # Later:
    # for line in stock_request.lines:
    #     this is where we will add the stock
    #     to the SQL model/database.

    return response
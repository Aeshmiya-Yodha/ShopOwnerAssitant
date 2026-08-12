from fastapi import APIRouter

from server.database import SessionDep
from server.model import RequestLine, StockRequest

from server.schemas import (
    StockRequestCreate,
    StockRequestResponse,
)


router = APIRouter()


@router.post("/stock-requests", response_model=StockRequestResponse, status_code=201)
def create_stock_request(
    request: StockRequestCreate, session: SessionDep
) -> StockRequestResponse:
    stock_request = StockRequest(
        note=request.note,
        source=request.source,
    )
    session.add(stock_request)
    session.flush()  

    for line in request.lines:
        session.add(
            RequestLine(
                request_id=stock_request.id,
                product_id=line.product_id,
                qty=line.qty,
            )
        )

    session.commit()
    session.refresh(stock_request)

    return StockRequestResponse(
        request_id=stock_request.id,
        created_at=stock_request.created_at,
        status=stock_request.status,
        line_count=len(request.lines),
        total_qty=sum(line.qty for line in request.lines),
    )


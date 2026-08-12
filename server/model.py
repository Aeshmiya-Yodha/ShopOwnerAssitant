from sqlmodel import SQLModel
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Numeric, text
from sqlmodel import Field, SQLModel

class Product(SQLModel, table=True):
	__tablename__ = "products"
	__table_args__ = {"schema": "retail"}

	product_id: str = Field(primary_key=True)
	name: str
	category: str
	unit_price: Decimal = Field(sa_type=Numeric(10, 2))
	unit_cost: Decimal = Field(sa_type=Numeric(10, 2))
	min_order_qty: int
	lead_time_days: int
	shelf_life_days: int | None = None

class StockOnHand(SQLModel, table=True):
	__tablename__ = "stock_on_hand"
	__table_args__ = {"schema": "retail"}

	product_id: str = Field(primary_key=True)
	qty_on_hand: int
	stock_expiry_date: date | None = None
	updated_at: datetime = Field(
		sa_column_kwargs={"server_default": text("now()")}
	)

class SalesDaily(SQLModel, table=True):
	__tablename__ = "sales_daily"
	__table_args__ = {"schema": "retail"}

	product_id: str = Field(primary_key=True)
	sale_date: date = Field(primary_key=True)
	qty_sold: int
	revenue: Decimal = Field(sa_type=Numeric(12, 2))

class StockRequest(SQLModel, table=True):
	__tablename__ = "stock_requests"
	__table_args__ = {"schema": "app"}

	id: int | None = Field(default=None, primary_key=True)
	created_at: datetime = Field(
		sa_column_kwargs={"server_default": text("now()")}
	)
	status: str = Field(default="submitted")
	source: str = Field(default="manual")
	note: str | None = None

class RequestLine(SQLModel, table=True):
	__tablename__ = "request_lines"
	__table_args__ = {"schema": "app"}

	id: int | None = Field(default=None, primary_key=True)
	request_id: int = Field(foreign_key="app.stock_requests.id")
	product_id: str
	qty: int

class StockPosition(SQLModel, table=True):
	"""Read-only projection of retail.v_stock_position. Never written to."""

	__tablename__ = "v_stock_position"
	__table_args__ = {"schema": "retail"}

	product_id: str = Field(primary_key=True)
	name: str
	category: str
	qty_on_hand: int
	avg_daily_sales_7d: Decimal = Field(sa_type=Numeric(10, 2))
	days_of_cover: Decimal = Field(sa_type=Numeric(10, 1))
	lead_time_days: int
	suggested_order_qty: int
	stock_expiry_date: date | None = None
	units_7d: int
	revenue_7d: Decimal = Field(sa_type=Numeric(12, 2))
	status: str


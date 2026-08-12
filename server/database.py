import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated

from dotenv import load_dotenv
from fastapi import Depends
from sqlalchemy import URL, event
from sqlmodel import Session, create_engine

load_dotenv()

_token: str | None = None
_token_expires_at = datetime.min.replace(tzinfo=timezone.utc)


def get_database_token() -> str:
    """Lakebase tokens live ~1 hour, so cache one and re-mint it before it dies."""
    global _token, _token_expires_at

    if _token is None or datetime.now(timezone.utc) >= _token_expires_at:
        from databricks.sdk import WorkspaceClient

        credential = WorkspaceClient().database.generate_database_credential(
            request_id=str(uuid.uuid4()),
            instance_names=[os.environ["LAKEBASE_INSTANCE_NAME"]],
        )
        _token = credential.token
        _token_expires_at = datetime.now(timezone.utc) + timedelta(minutes=50)

    return _token


def _build_engine():
    # Escape hatch for local runs against sqlite or a plain Postgres URL.
    override_url = os.environ.get("DATABASE_URL")
    if override_url:
        return create_engine(override_url, pool_pre_ping=True)

    lakebase_engine = create_engine(
        URL.create(
            "postgresql+psycopg",
            username=os.environ.get("PGUSER"),
            host=os.environ.get("PGHOST"),
            port=int(os.environ.get("PGPORT", "5432")),
            database=os.environ.get("PGDATABASE", "databricks_postgres"),
        ),
        pool_pre_ping=True,
        pool_recycle=1800,
        connect_args={"sslmode": os.environ.get("PGSSLMODE", "require")},
    )

    @event.listens_for(lakebase_engine, "do_connect")
    def _inject_token(dialect, conn_rec, cargs, cparams):
        cparams["password"] = get_database_token()

    return lakebase_engine


engine = _build_engine()


def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]


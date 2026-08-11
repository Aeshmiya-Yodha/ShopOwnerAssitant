from sqlmodel import SQLModel ,create_engine ,Session
from typing import Annotated
from fastapi import Depends

sqlUrl = "ConnectionString "

engine = create_engine(sqlUrl)
3
def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]


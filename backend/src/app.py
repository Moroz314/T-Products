from fastapi import FastAPI
from .database.core import engine
from .database.models import Base
from .routers import register_routers
import uvicorn
from .fill import populate_database

app = FastAPI()

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
populate_database()

register_routers(app)

if __name__ == '__main__':
    uvicorn.run(
        app,
        host='0.0.0.0',
        port=8000,
    )
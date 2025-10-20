from fastapi import FastAPI
from .auth.controller import auth_router
from .merchant_api.controller import merchant_router
from .product.controller import product_router
from .orders.controller import orders_router

def register_routers(app: FastAPI):
    app.include_router(auth_router)
    app.include_router(merchant_router)
    app.include_router(product_router)
    app.include_router(orders_router)


from fastapi import Depends
from .database.core import get_db
from .auth.service import AuthUserService, AuthMerchantService
from .auth.utils import get_merchant_id_from_jwt, get_user_id_from_jwt
from .merchant_api.service import MerchantProductService
from .orders.service import *

def get_user_auth(db: Session = Depends(get_db)):
    user_repo = UserRepository(session=db)
    return AuthUserService(user_repo=user_repo)

def get_merchant_auth(db: Session = Depends(get_db)):
    merchant_repo = MerchantRepository(session=db)
    return AuthMerchantService(merchant_repo=merchant_repo)

def get_merchant_product_service(db: Session = Depends(get_db), merchant_id = Depends(get_merchant_id_from_jwt)):
    product_repo = ProductRepository(session=db)
    return MerchantProductService(merchant_id=merchant_id, product_repo=product_repo)

def get_item_service(db: Session = Depends(get_db), user_id = Depends(get_user_id_from_jwt)):
    return OrderItemService(db, user_id)

def get_order_service(db: Session = Depends(get_db), user_id = Depends(get_user_id_from_jwt)):
    return OrderService(db, user_id)
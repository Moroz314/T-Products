from fastapi import APIRouter, Depends
from .service import *
from .model import *
from ..dependencies import get_merchant_auth, get_user_auth

auth_router = APIRouter()

@auth_router.post('/user/register',
                  response_model=UserTokenAnswer,
                  summary="Регистрация пользователя"
)
def register_user(user: User, auth_service: AuthUserService = Depends(get_user_auth)):
   return auth_service.register(user)


@auth_router.post('/user/sign_in',
                  response_model=UserTokenAnswer,
                  summary="Аутентификация пользователя")
def sign_in_user(user: UserSignIn, auth: AuthUserService = Depends(get_user_auth)):
    return auth.authenticate(user)


@auth_router.post('/merchant/register',
                  response_model=MerchantTokenAnswer,
                  summary="Регистрация продавца")
def register_merchant(merchant: Merchant, auth: AuthMerchantService = Depends(get_merchant_auth)):
   return auth.register(merchant)


@auth_router.post('/merchant/sign_in',
                  response_model=MerchantTokenAnswer,
                  summary="Аутентификация продавца"
                  )
def sign_in_merchant(merchant: MerchantSignIn, auth: AuthMerchantService = Depends(get_merchant_auth)):
   return auth.authenticate(merchant)

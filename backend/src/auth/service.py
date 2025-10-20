from starlette.responses import JSONResponse
from ..database.models import User
from ..database.repository import UserRepository, MerchantRepository
from .model import *
from .utils import *
from fastapi.exceptions import HTTPException

class AuthUserService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def register(self, user_data: User):
        existing = self.user_repo.get_user_by_email(str(user_data.email))

        if existing:
            raise HTTPException(
                status_code=409,
                detail="User already exists"
            )

        user_data.password = get_password_hash(user_data.password)
        user = self.user_repo.create(dict(user_data))

        token = create_access_token({"sub": str(user.id), "role": "user"})

        return JSONResponse(content={'access_token': token, 'user_id': user.id}, status_code=201)


    def authenticate(self, user_data: UserSignIn):
        email, password = user_data.email, user_data.password

        user = self.user_repo.get_user_by_email(email)

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        user = UserDTO.model_validate(user, from_attributes=True)

        if verify_password(password, user.password):
            access_token = create_access_token({"sub": str(user.id), "role": "user"})

            return JSONResponse(content={'access_token': access_token, 'user_id': user.id})

        else:
            raise HTTPException(
                status_code=400,
                detail="wrong password"
            )


class AuthMerchantService:
    def __init__(self, merchant_repo: MerchantRepository):
        self.merchant_repo = merchant_repo

    def register(self, merchant_data: Merchant):
        existing = self.merchant_repo.get_merchant_by_email(merchant_data.email)

        if existing:
            raise HTTPException(
                status_code=409,
                detail="Merchant already exists"
            )

        merchant_data.password = get_password_hash(merchant_data.password)
        merchant = self.merchant_repo.create(dict(merchant_data))

        token = create_access_token({"sub": str(merchant.id), "role": "merchant"})

        return JSONResponse(content={'access_token': token, 'merchant_id': merchant.id}, status_code=201)


    def authenticate(self, merchant_data: MerchantSignIn):
        email, password = merchant_data.email, merchant_data.password

        merchant = self.merchant_repo.get_merchant_by_email(email)

        if not merchant:
            raise HTTPException(
                status_code=404,
                detail='Merchant not found'
            )

        merchant = MerchantDTO.model_validate(merchant, from_attributes=True)

        if verify_password(password, merchant.password):
            access_token = create_access_token({"sub": str(merchant.id), "role": "merchant"})

            return JSONResponse(content={'access_token': access_token, 'merchant_id': merchant.id})

        else:
            raise HTTPException(
                status_code=400,
                detail="Wrong password"
            )

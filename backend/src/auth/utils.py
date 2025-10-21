from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
from fastapi import HTTPException


SECRET_KEY = "830a106ea6a01b2449fcbfd7179990a8"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)

def get_merchant_id_from_jwt(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        merchant_id, role = payload['sub'], payload['role']

        if role != 'merchant':
            raise HTTPException(
                status_code=403,
                detail='not merchant token'
            )

        return int(merchant_id)

    except JWTError as e:
        raise e

def get_user_id_from_jwt(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id, role = payload['sub'], payload['role']

        if role != 'user':
            raise HTTPException(
                status_code=403,
                detail='not user token'
            )

        return int(user_id)

    except JWTError as e:
        raise HTTPException(
            status_code=403,
            detail="signature has expired"
        )

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
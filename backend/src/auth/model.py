from pydantic import BaseModel, EmailStr, Field
import uuid

class User(BaseModel):
    username: str
    email: str
    password: str

class UserSignIn(BaseModel):
    email: str
    password: str

class UserDTO(User):
    id: int


class Merchant(BaseModel):
    name: str
    email: str
    password: str

class MerchantSignIn(UserSignIn):
    ...

class MerchantDTO(Merchant):
    id: int

class UserTokenAnswer(BaseModel):
    access_token: str
    user_id: int

class MerchantTokenAnswer(BaseModel):
    access_token: str
    merchant_id: int
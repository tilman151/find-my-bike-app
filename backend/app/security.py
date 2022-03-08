import os

from fastapi import Security, HTTPException
from fastapi.security import APIKeyQuery, APIKeyHeader, APIKeyCookie
from starlette.status import HTTP_403_FORBIDDEN

API_KEY = os.environ["API_KEY"]
API_KEY_NAME = "access_token"
COOKIE_DOMAIN = os.environ["COOKIE_DOMAIN"]
api_key_query = APIKeyQuery(name=API_KEY_NAME, auto_error=False)
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)
api_key_cookie = APIKeyCookie(name=API_KEY_NAME, auto_error=False)


async def get_api_key(
    query_key: str = Security(api_key_query),
    header_key: str = Security(api_key_header),
    cookie_key: str = Security(api_key_cookie),
):
    if query_key == API_KEY:
        return query_key
    elif header_key == API_KEY:
        return header_key
    elif cookie_key == API_KEY:
        return cookie_key
    else:
        raise HTTPException(
            status_code=HTTP_403_FORBIDDEN, detail="Credential invalid or not available"
        )


async def delete_api_key_cookie(response):
    response.delete_cookie(API_KEY_NAME, domain=COOKIE_DOMAIN)


async def set_api_key_cookie(response, api_key):
    response.set_cookie(
        API_KEY_NAME,
        value=api_key,
        domain=COOKIE_DOMAIN,
        httponly=True,
        max_age=1800,
        expires=1800,
    )

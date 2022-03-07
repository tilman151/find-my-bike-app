import os
from typing import Optional, Callable

from fastapi import Security, Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
from fastapi.security.api_key import APIKeyCookie, APIKeyHeader, APIKey, APIKeyQuery
from pydantic import BaseModel
from starlette.responses import RedirectResponse, JSONResponse
from starlette.status import HTTP_403_FORBIDDEN

API_KEY = os.environ["API_KEY"]
API_KEY_NAME = "access_token"
COOKIE_DOMAIN = os.environ["COOKIE_DOMAIN"]

api_key_query = APIKeyQuery(name=API_KEY_NAME, auto_error=False)
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)
api_key_cookie = APIKeyCookie(name=API_KEY_NAME, auto_error=False)


async def get_api_key(
        api_key_query: str = Security(api_key_query),
        api_key_header: str = Security(api_key_header),
        api_key_cookie: str = Security(api_key_cookie),
):
    if api_key_query == API_KEY:
        return api_key_query
    elif api_key_header == API_KEY:
        return api_key_header
    elif api_key_cookie == API_KEY:
        return api_key_cookie
    else:
        raise HTTPException(
            status_code=HTTP_403_FORBIDDEN, detail="Could not validate credentials"
        )


app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)

origins = [
    "http://localhost:3000",
    "localhost:3000",
    "https://find-my-bike.netlify.app",
    "https://find-my-bike.krokotsch.eu",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Prediction(BaseModel):
    bike: str
    frame: str
    color: str


class Posting(BaseModel):
    title: str
    url: str
    img_url: str
    prediction: Prediction


dummy_postings = [
    Posting(
        **{
            "title": "Bike 1",
            "url": "http://foo.bar",
            "img_url": "http://foo.bar/img.jpg",
            "prediction": Prediction(
                **{"bike": "bike", "frame": "trapeze", "color": "black"}
            ),
        }
    ),
    Posting(
        **{
            "title": "Bike 2",
            "url": "http://foo.bar",
            "img_url": "http://foo.bar/img.jpg",
            "prediction": Prediction(
                **{"bike": "bike", "frame": "diamond", "color": "white"}
            ),
        }
    ),
    Posting(
        **{
            "title": "Bike 3",
            "url": "http://foo.bar",
            "img_url": "http://foo.bar/img.jpg",
            "prediction": Prediction(
                **{"bike": "children", "frame": "low_entry", "color": "green"}
            ),
        }
    ),
]


@app.get("/", tags=["root"])
async def root():
    return {"message": "Hello World"}


@app.get("/logout")
async def route_logout_and_remove_cookie():
    response = RedirectResponse(url="/")
    response.delete_cookie(API_KEY_NAME, domain=COOKIE_DOMAIN)
    return response


@app.get("/openapi.json", tags=["documentation"])
async def get_open_api_endpoint(api_key: APIKey = Depends(get_api_key)):
    response = JSONResponse(
        get_openapi(title="Find-My-Bike API", version="1", routes=app.routes)
    )
    return response


@app.get("/doc", tags=["documentation"])
async def get_documentation(api_key: APIKey = Depends(get_api_key)):
    response = get_swagger_ui_html(openapi_url="/openapi.json", title="docs")
    response.set_cookie(
        API_KEY_NAME,
        value=api_key,
        domain=COOKIE_DOMAIN,
        httponly=True,
        max_age=1800,
        expires=1800,
    )
    return response


@app.get("/posting", tags=["postings"], response_model=dict[str, list[Posting]])
async def get_postings(
        bike: Optional[str] = None,
        frame: Optional[str] = None,
        color: Optional[str] = None,
        api_key: APIKey = Depends(get_api_key),
) -> dict[str, list[Posting]]:
    postings = list(filter(query_filter(bike, frame, color), dummy_postings))

    return {"data": postings}


def query_filter(
    bike: Optional[str] = None, frame: Optional[str] = None, color: Optional[str] = None
) -> Callable:
    def _filter_fn(posting: Posting) -> bool:
        if bike is not None and not posting.prediction.bike == bike:
            return False
        if frame is not None and not posting.prediction.frame == frame:
            return False
        if color is not None and not posting.prediction.color == color:
            return False

        return True

    return _filter_fn

from typing import Optional, Callable

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
from fastapi.security.api_key import APIKey
from starlette.responses import RedirectResponse, JSONResponse

from backend.app import security
from backend.app.security import get_api_key
from backend.app.validation import Prediction, Posting

TITLE = "Find-My-Bike API"
VERSION = "0.1.0"

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
    return {"message": "This is the Find-My-Bike API"}


@app.get("/logout")
async def logout_and_remove_cookie():
    response = RedirectResponse(url="/")
    await security.delete_api_key_cookie(response)

    return response


@app.get("/openapi.json", tags=["documentation"])
async def get_open_api_endpoint(api_key: APIKey = Depends(get_api_key)):
    response = JSONResponse(
        get_openapi(title=TITLE, version=VERSION, routes=app.routes)
    )

    return response


@app.get("/docs", tags=["documentation"])
async def get_documentation(api_key: APIKey = Depends(get_api_key)):
    response = get_swagger_ui_html(openapi_url="/openapi.json", title="docs")
    await security.set_api_key_cookie(response, api_key)

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

import os
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security.api_key import APIKey
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR, HTTP_201_CREATED

from backend.app import models
from backend.app.security import get_api_key, get_admin_key
from backend.app.validation import (
    Posting,
    PostingList,
    IncomingPostingList,
    IncomingCorrection,
    CorrectedPostingList,
    flatten,
)

TITLE = "Find-My-Bike API"
VERSION = "0.1.0"

app = FastAPI()

origins = [
    "http://localhost:3000",
    "localhost:3000",
    "https://find-my-bike.netlify.app",
    "https://find-my-bike.krokotsch.eu",
]
if "ORIGIN" in os.environ:
    origins.append(os.environ["ORIGIN"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup() -> None:
    await models.connect()


@app.on_event("shutdown")
async def shutdown() -> None:
    await models.disconnect()


@app.get("/", tags=["root"])
async def root() -> dict[str, str]:
    return {"message": "This is the Find-My-Bike API"}


# @app.get("/logout")
# async def logout_and_remove_cookie() -> RedirectResponse:
#     response = RedirectResponse(url="/")
#     await security.delete_api_key_cookie(response)
#
#     return response


# @app.get("/openapi.json", tags=["documentation"])
# async def get_open_api_endpoint(api_key: APIKey = Depends(get_api_key)) -> JSONResponse:
#     response = JSONResponse(
#         get_openapi(title=TITLE, version=VERSION, routes=app.routes)
#     )
#
#     return response
#
#
# @app.get("/docs", tags=["documentation"])
# async def get_documentation(
#     request: Request, api_key: APIKey = Depends(get_api_key)
# ) -> HTMLResponse:
#     root_path = request.get("root_path")
#     response = get_swagger_ui_html(
#         openapi_url=f"{root_path}/openapi.json?access_token={api_key}", title="docs"
#     )
#     await security.set_api_key_cookie(response, api_key)
#
#     return response


@app.get("/posting", tags=["postings"], response_model=PostingList)
async def get_postings(
    bike: Optional[str] = None,
    frame: Optional[str] = None,
    color: Optional[str] = None,
    skip: Optional[int] = 0,
    limit: Optional[int] = 10,
    api_key: APIKey = Depends(get_api_key),
) -> PostingList:
    postings = await models.query_postings(bike, color, frame, limit, skip)
    postings = [Posting(**{**p, "prediction": {**p}}) for p in postings]

    return PostingList(data=postings)


@app.post("/posting", tags=["postings"], status_code=HTTP_201_CREATED)
async def add_postings(
    in_postings: IncomingPostingList, api_key: APIKey = Depends(get_admin_key)
) -> None:
    processed_postings = [
        flatten(post, nested="prediction") for post in in_postings.data
    ]
    await models.add_postings(processed_postings)


@app.get("/correction", tags=["corrections"], response_model=CorrectedPostingList)
async def get_corrections(api_key: APIKey = Depends(get_admin_key)):
    corrections = await models.get_corrections()

    return CorrectedPostingList(data=corrections)


@app.post("/correction", tags=["corrections"], status_code=HTTP_201_CREATED)
async def add_correction(
    correction: IncomingCorrection, api_key: APIKey = Depends(get_api_key)
):
    processed_correction = flatten(correction, nested="correction")
    try:
        await models.add_corrections(processed_correction)
    except RuntimeError:
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Posting ID not found",
        )

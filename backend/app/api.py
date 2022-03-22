from typing import Optional

from asyncpg import ForeignKeyViolationError
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
from fastapi.security.api_key import APIKey
from starlette.responses import RedirectResponse, JSONResponse, HTMLResponse
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR, HTTP_201_CREATED

from backend.app import models
from backend.app import security
from backend.app.security import get_api_key, get_admin_key
from backend.app.validation import Posting, PostingList, IncomingPostingList, Correction

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


@app.on_event("startup")
async def startup() -> None:
    await models.database.connect()


@app.on_event("shutdown")
async def shutdown() -> None:
    await models.database.disconnect()


@app.get("/", tags=["root"])
async def root() -> dict[str, str]:
    return {"message": "This is the Find-My-Bike API"}


@app.get("/logout")
async def logout_and_remove_cookie() -> RedirectResponse:
    response = RedirectResponse(url="/")
    await security.delete_api_key_cookie(response)

    return response


@app.get("/openapi.json", tags=["documentation"])
async def get_open_api_endpoint(api_key: APIKey = Depends(get_api_key)) -> JSONResponse:
    response = JSONResponse(
        get_openapi(title=TITLE, version=VERSION, routes=app.routes)
    )

    return response


@app.get("/docs", tags=["documentation"])
async def get_documentation(api_key: APIKey = Depends(get_api_key)) -> HTMLResponse:
    response = get_swagger_ui_html(openapi_url="/openapi.json", title="docs")
    await security.set_api_key_cookie(response, api_key)

    return response


@app.get("/posting", tags=["postings"], response_model=PostingList)
async def get_postings(
    bike: Optional[str] = None,
    frame: Optional[str] = None,
    color: Optional[str] = None,
    skip: Optional[int] = 0,
    limit: Optional[int] = 10,
    api_key: APIKey = Depends(get_api_key),
) -> PostingList:
    where_clauses = []
    if bike is not None:
        where_clauses.append(models.postings.c.bike == bike)
    if frame is not None:
        where_clauses.append(models.postings.c.frame == frame)
    if color is not None:
        where_clauses.append(models.postings.c.color == color)
    query = models.postings.select().where(*where_clauses).offset(skip).limit(limit)
    fetched_postings = await models.database.fetch_all(query)
    fetched_postings = [Posting(**{**p, "prediction": {**p}}) for p in fetched_postings]

    return PostingList(data=fetched_postings)


@app.post("/posting", tags=["postings"], status_code=HTTP_201_CREATED)
async def add_postings(
    in_postings: IncomingPostingList, api_key: APIKey = Depends(get_admin_key)
) -> None:
    processed_postings = []
    for posting in in_postings.data:
        processed_posting = posting.dict(exclude={"prediction"})
        processed_posting.update(posting.prediction.dict())
        processed_postings.append(processed_posting)
    await models.database.execute_many(models.postings.insert(), processed_postings)


@app.post("/correction", tags=["corrections"], status_code=HTTP_201_CREATED)
async def add_correction(
    correction: Correction, api_key: APIKey = Depends(get_api_key)
):
    processed_correction = correction.dict(exclude={"correction"})
    processed_correction.update(correction.correction)
    try:
        await models.database.execute(models.corrections.insert(), processed_correction)
    except ForeignKeyViolationError:
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Posting with ID {correction.posting_id} not found",
        )

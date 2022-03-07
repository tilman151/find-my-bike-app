from typing import Optional, Callable

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

origins = ["http://localhost:3000", "localhost:3000", "https://find-my-bike.netlify.app"]


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


@app.get("/posting", tags=["postings"], response_model=dict[str, list[Posting]])
async def get_postings(
    bike: Optional[str] = None, frame: Optional[str] = None, color: Optional[str] = None
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

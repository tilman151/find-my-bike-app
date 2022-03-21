import datetime

from pydantic import BaseModel


class Prediction(BaseModel):
    bike: str
    frame: str
    color: str


class Posting(BaseModel):
    title: str
    url: str
    image_url: str
    location: str
    query: str
    loc_query: str
    date: datetime.date
    prediction: Prediction


class PostingList(BaseModel):
    data: list[Posting]

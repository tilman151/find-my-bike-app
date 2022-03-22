import datetime

from pydantic import BaseModel


class Prediction(BaseModel):
    bike: str
    frame: str
    color: str


class IncomingPosting(BaseModel):
    title: str
    url: str
    image_url: str
    location: str
    query: str
    loc_query: str
    date: datetime.date
    prediction: Prediction


class IncomingPostingList(BaseModel):
    data: list[IncomingPosting]


class Posting(IncomingPosting):
    id: str


class PostingList(BaseModel):
    data: list[Posting]


class Correction(BaseModel):
    posting_id: int
    correction: Prediction

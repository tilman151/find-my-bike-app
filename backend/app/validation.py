from pydantic import BaseModel


class Prediction(BaseModel):
    bike: str
    frame: str
    color: str


class Posting(BaseModel):
    title: str
    url: str
    img_url: str
    location: str
    prediction: Prediction

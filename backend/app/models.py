import os

import databases
import sqlalchemy

DATABASE_URL = os.environ["DATABASE_URL"]
if "postgresql" not in DATABASE_URL:
    db_url = DATABASE_URL.replace("postgres", "postgresql")

database = databases.Database(DATABASE_URL)

metadata = sqlalchemy.MetaData()
postings = sqlalchemy.Table(
    "postings",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("title", sqlalchemy.String),
    sqlalchemy.Column("url", sqlalchemy.String),
    sqlalchemy.Column("img_url", sqlalchemy.String),
    sqlalchemy.Column("location", sqlalchemy.String),
    sqlalchemy.Column("bike", sqlalchemy.String),
    sqlalchemy.Column("frame", sqlalchemy.String),
    sqlalchemy.Column("color", sqlalchemy.String),
)

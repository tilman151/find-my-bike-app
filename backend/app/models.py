import os

import databases
import sqlalchemy as sa

DATABASE_URL = os.environ["DATABASE_URL"]
if "postgresql" not in DATABASE_URL:
    db_url = DATABASE_URL.replace("postgres", "postgresql")

database = databases.Database(DATABASE_URL)

metadata = sa.MetaData()

postings = sa.Table(
    "postings",
    metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("title", sa.String),
    sa.Column("url", sa.String),
    sa.Column("image_url", sa.String),
    sa.Column("location", sa.String),
    sa.Column("query", sa.String),
    sa.Column("loc_query", sa.String),
    sa.Column("date", sa.DateTime),
    sa.Column("bike", sa.String),
    sa.Column("frame", sa.String),
    sa.Column("color", sa.String),
)

corrections = sa.Table(
    "corrections",
    metadata,
    sa.Column("id", sa.Integer, primary_key=True),
    sa.Column("posting_id", sa.ForeignKey("postings.id"), nullable=False),
    sa.Column("bike", sa.String),
    sa.Column("frame", sa.String),
    sa.Column("color", sa.String),
)

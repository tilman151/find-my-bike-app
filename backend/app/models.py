import os
from typing import Optional

import databases
import sqlalchemy as sa

database: Optional[databases.Database] = None  # Populated by connect()


async def connect():
    url = os.environ["DATABASE_URL"]
    if "postgresql" not in url:
        db_url = url.replace("postgres", "postgresql")

    global database
    database = databases.Database(url)
    await database.connect()


async def disconnect():
    global database
    if isinstance(database, databases.Database):
        await database.disconnect()
        database = None
    else:
        raise RuntimeError("Database was not connected")


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


async def check_row_count():
    posting_count = await _get_row_count(postings)
    correction_count = await _get_row_count(corrections)
    row_limit = int(os.environ["ROW_LIMIT"])
    free_rows = row_limit - (posting_count + correction_count + 1)  # one for alembic

    return free_rows


async def _get_row_count(table):
    return await database.execute(sa.select(sa.func.count()).select_from(table))

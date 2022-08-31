import os
from typing import Optional

import databases
import sqlalchemy as sa

from backend.app.validation import CorrectedPosting

database: Optional[databases.Database] = None  # Populated by connect()


async def connect():
    url = os.environ["DATABASE_URL"]
    min_size = int(os.environ["MIN_DATABASE_CONNECTIONS"])
    max_size = max(10, min_size)

    global database
    database = databases.Database(url, min_size=min_size, max_size=max_size)
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
    sa.Column(
        "posting_id", sa.ForeignKey("postings.id", ondelete="CASCADE"), nullable=False
    ),
    sa.Column("bike", sa.String),
    sa.Column("frame", sa.String),
    sa.Column("color", sa.String),
)


async def clear_old_postings(num: int):
    oldest_postings = (
        sa.select(postings.c.id).order_by(postings.c.date).limit(num).subquery()
    )
    await database.execute(postings.delete(postings.c.id.in_(oldest_postings)))


async def query_postings(bike, color, frame, limit, skip):
    where_clauses = []
    if bike is not None:
        where_clauses.append(postings.c.bike == bike)
    if frame is not None:
        where_clauses.append(postings.c.frame == frame)
    if color is not None:
        where_clauses.append(postings.c.color == color)
    query = (
        postings.select()
        .where(*where_clauses)
        .order_by(postings.c.date.desc())
        .offset(skip)
        .limit(limit)
    )
    fetched_postings = await database.fetch_all(query)

    return fetched_postings


async def add_postings(postings_to_add):
    await _free_rows_over_limit(len(postings_to_add))
    await database.execute_many(postings.insert(), postings_to_add)


async def get_corrections():
    corrected_ids = await database.fetch_all(
        sa.select(sa.distinct(corrections.c.posting_id))
    )
    corrected_postings = await database.fetch_all(
        postings.select(postings.c.id.in_([c["posting_id"] for c in corrected_ids]))
    )
    for i, posting in enumerate(corrected_postings):
        corr = await database.fetch_all(
            corrections.select(corrections.c.posting_id == posting["id"])
        )
        corrected_postings[i] = CorrectedPosting(
            **{**posting, "prediction": {**posting}, "corrections": corr}
        )

    return corrected_postings


async def add_corrections(correction_to_add):
    corrected_posting = await database.fetch_one(
        postings.select(postings.c.id == correction_to_add["posting_id"])
    )
    if corrected_posting is None:
        raise RuntimeError(
            f"Posting with ID {correction_to_add['posting_id']} not found"
        )
    else:
        await _free_rows_over_limit(1)
        await database.execute(corrections.insert(), correction_to_add)


async def _free_rows_over_limit(num_rows_added: int):
    free_rows = await _get_free_rows()
    free_after_add = free_rows - num_rows_added
    if free_after_add < 0:
        await clear_old_postings(-free_after_add)


async def _get_free_rows():
    posting_count = await _get_row_count(postings)
    correction_count = await _get_row_count(corrections)
    row_limit = int(os.environ["ROW_LIMIT"])
    free_rows = row_limit - (posting_count + correction_count + 1)  # one for alembic

    return free_rows


async def _get_row_count(table):
    return await database.execute(sa.select(sa.func.count()).select_from(table))

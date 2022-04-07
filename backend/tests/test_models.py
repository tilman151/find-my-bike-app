import logging
from datetime import timedelta, datetime

import databases
import pytest
import pytest_asyncio
import sqlalchemy as sa

from backend.app import models

DATABASE_URL = "postgresql://backend@/test-my-bike"


@pytest.fixture(autouse=True, scope="function")
def create_test_database():
    # Create test databases with tables creation
    engine = sa.create_engine(DATABASE_URL)
    models.metadata.create_all(engine)

    # Run the test suite
    yield

    # Drop test databases
    engine = sa.create_engine(DATABASE_URL)
    models.metadata.drop_all(engine)


@pytest.fixture
def async_debug(monkeypatch):
    monkeypatch.setenv("PYTHONASYNCIODEBUG", "1")
    logging.basicConfig(level=logging.DEBUG)


@pytest.fixture(autouse=True, scope="function")
def db_env(async_debug, monkeypatch):
    monkeypatch.setenv("ROW_LIMIT", "1000")
    monkeypatch.setenv("DATABASE_URL", DATABASE_URL)


@pytest.fixture()
def dummy_data():
    engine = sa.create_engine(DATABASE_URL)
    with engine.connect() as conn:
        primary_keys = _insert_postings(conn)
        _insert_corrections(conn)

    return primary_keys


def _insert_postings(conn):
    primary_keys = []
    for i in range(10):
        stmt = models.postings.insert().values(
            title=f"Test Bike {i}",
            url="https://foo.bar",
            image_url="https://foo.bar/img",
            location="12345, Berlin",
            query="Fahrrad",
            loc_query="Berlin",
            date=datetime.now() + timedelta(days=i),
            bike="",
            frame="",
            color="",
        )
        result = conn.execute(stmt)
        primary_keys.append(result.inserted_primary_key[0])

    return primary_keys


def _insert_corrections(conn):
    stmt = models.corrections.insert().values(
        posting_id=1,
        bike="",
        frame="",
        color="",
    )
    conn.execute(stmt)


@pytest_asyncio.fixture
async def connect_db():
    await models.connect()
    async with models.database.transaction(force_rollback=True):
        yield
    await models.disconnect()


@pytest.mark.asyncio
async def test_connect_disconnect():
    assert models.database is None

    await models.connect()
    assert isinstance(models.database, databases.Database)
    assert models.database.is_connected
    assert models.database.url == DATABASE_URL

    await models.disconnect()
    assert models.database is None


@pytest.mark.asyncio
async def test_row_limit(connect_db, dummy_data):
    count = await models._get_free_rows()
    assert count == 988


@pytest.mark.asyncio
async def test_clear_old_postings(connect_db, dummy_data):
    await models.clear_old_postings(3)

    # Oldest three postings (with the lowest ids) were deleted
    remaining_postings = await models.database.fetch_all(models.postings.select())
    assert len(remaining_postings) == 7
    assert min(p["id"] for p in remaining_postings) == 4

    # Corrections associated with posting 1 was deleted, too
    remaining_corrections = await models.database.fetch_all(models.corrections.select())
    assert not any(c["posting_id"] == 1 for c in remaining_corrections)


@pytest.mark.asyncio
async def test_add_postings_over_limit(connect_db, dummy_data, monkeypatch):
    monkeypatch.setenv("ROW_LIMIT", "12")
    await models.add_postings(
        [
            {
                "title": "",
                "url": "",
                "image_url": "",
                "location": "",
                "query": "",
                "loc_query": "",
                "date": datetime.now(),
                "bike": "",
                "frame": "",
                "color": "",
            }
        ]
    )

    # Posting inserted with next highest id
    expected_id = len(dummy_data) + 1
    postings = await models.database.fetch_all(
        models.postings.select().order_by(models.postings.c.id.desc())
    )
    assert postings[0]["id"] == expected_id
    assert len(postings) == len(dummy_data)

    # Oldest posting (with the lowest id) was deleted
    posting_expected_deleted = await models.database.fetch_one(
        models.postings.select(models.postings.c.id == 1)
    )
    assert posting_expected_deleted is None


@pytest.mark.asyncio
async def test_add_postings_under_limit(connect_db, dummy_data):
    await models.add_postings(
        [
            {
                "title": "",
                "url": "",
                "image_url": "",
                "location": "",
                "query": "",
                "loc_query": "",
                "date": datetime.now(),
                "bike": "",
                "frame": "",
                "color": "",
            }
        ]
    )

    # Posting inserted with next highest id
    expected_id = len(dummy_data) + 1
    postings = await models.database.fetch_all(
        models.postings.select().order_by(models.postings.c.id.desc())
    )
    assert postings[0]["id"] == expected_id
    assert len(postings) == len(dummy_data) + 1


@pytest.mark.asyncio
async def test_add_correction_over_limit(connect_db, dummy_data, monkeypatch):
    monkeypatch.setenv("ROW_LIMIT", "12")
    await models.add_corrections(
        {
            "posting_id": 10,
            "bike": "",
            "frame": "",
            "color": "",
        }
    )

    # Oldest posting (with the lowest id) was deleted
    posting_expected_deleted = await models.database.fetch_one(
        models.postings.select(models.postings.c.id == 1)
    )
    assert posting_expected_deleted is None

    # Correction was inserted the one associated with the old post deleted
    corrections = await models.database.fetch_all(models.corrections.select())
    assert len(corrections) == 1

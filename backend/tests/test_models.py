import logging

import databases
import pytest
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
async def test_row_limit():
    await models.connect()
    async with models.database.transaction(force_rollback=True):
        count = await models.check_row_count()
        assert count == 999
    await models.disconnect()

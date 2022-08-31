#!/bin/sh
. /config/.env.prod
export PORT=8080
alembic upgrade head
uvicorn backend.app.api:app --root-path $ROOT_PATH --host 0.0.0.0 --port $PORT
exec "$@"
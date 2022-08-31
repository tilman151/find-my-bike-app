#!/bin/sh
. /config/.env.prod
export PORT=8080
alembic upgrade head
python -m backend.main
exec "$@"
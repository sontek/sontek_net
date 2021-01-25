#!/usr/bin/env sh
set -eu

rsync -vh -a --delete /srv/output/ /fe-data/blog/ 
gunicorn --worker-class uvicorn.workers.UvicornWorker stkapi.server:app --bind 0.0.0.0

exec "$@"


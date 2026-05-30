#!/bin/sh
# Apply pending Prisma migrations, then start the server (or whatever was passed).
set -e

cd /repo/apps/server
echo "[entrypoint] prisma migrate deploy"
pnpm exec prisma migrate deploy

exec "$@"

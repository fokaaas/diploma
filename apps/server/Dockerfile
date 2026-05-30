# syntax=docker/dockerfile:1.7
# Build context = repository root (so the workspace lockfile is visible).

ARG NODE_VERSION=24.14.0
ARG PNPM_VERSION=9.0.0

# ---------- base: shared image with pnpm via corepack ----------
FROM node:${NODE_VERSION}-bookworm-slim AS base
ENV CI=1 \
    PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
WORKDIR /repo

# ---------- deps: install the full workspace (incl. dev deps) ----------
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/server/package.json apps/server/package.json
COPY apps/web/package.json apps/web/package.json
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store \
 && pnpm install --frozen-lockfile

# ---------- build: prisma generate + nest build ----------
FROM deps AS build
COPY . .
RUN pnpm --filter server exec prisma generate \
 && pnpm --filter server build

# ---------- runtime: minimal image to actually run the server ----------
FROM base AS runtime
ENV NODE_ENV=production \
    UPLOAD_DIR=/data/uploads

# Workspace + manifests
COPY --from=deps /repo/pnpm-lock.yaml /repo/pnpm-workspace.yaml /repo/package.json ./
COPY --from=deps /repo/apps/server/package.json apps/server/package.json
COPY --from=deps /repo/apps/web/package.json apps/web/package.json

# Dependency trees (root virtual store + per-workspace symlinks)
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/server/node_modules ./apps/server/node_modules

# Compiled server + generated Prisma client
COPY --from=build /repo/apps/server/dist ./apps/server/dist
COPY --from=build /repo/apps/server/src/generated ./apps/server/src/generated

# Source files still needed at runtime: Prisma migrations, schema, seed, config
COPY apps/server/prisma ./apps/server/prisma
COPY apps/server/prisma.config.ts ./apps/server/prisma.config.ts

# Entrypoint applies pending migrations before launching the CMD.
COPY --chmod=755 apps/server/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN mkdir -p /data/uploads

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:' + (process.env.PORT || 3000) + '/docs-json', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "/repo/apps/server/dist/main"]

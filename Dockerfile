FROM node:24-alpine AS base

# Step 1. Install dependencies and build the application
FROM base AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN test -n "$NEXT_PUBLIC_TURNSTILE_SITE_KEY" || \
    (echo "NEXT_PUBLIC_TURNSTILE_SITE_KEY must be provided as a build argument" >&2; exit 1)
RUN npm run build

# Step 2. Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist

USER nextjs

EXPOSE 3000

CMD ["node", "dist/server.js"]

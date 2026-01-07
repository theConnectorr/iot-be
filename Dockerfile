FROM oven/bun:latest AS builder
WORKDIR /app

COPY package.json bun.lock ./
COPY prisma ./prisma/
COPY prisma.config.ts ./prisma.config.ts

RUN bun install --frozen-lockfile

COPY . .

ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

RUN bunx prisma generate

RUN bun run build

FROM oven/bun:latest AS runner
WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile --production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3000

CMD ["sh", "-c", "bunx prisma migrate deploy && bun run -r tsconfig-paths/register dist/src/main.js"]
FROM node:18-alpine AS base

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY prisma ./prisma
COPY . .

RUN pnpm prisma generate
RUN pnpm build

# Copy GraphQL and generated schemas
RUN cp -r src/generated dist/ || true
RUN cp -r src/modules dist/modules || true

EXPOSE 4000

CMD ["sh", "-c", "pnpm prisma migrate deploy && node dist/index.js"]

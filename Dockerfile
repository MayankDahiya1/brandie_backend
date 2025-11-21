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

# Copy generated Prisma client
RUN cp -r src/generated dist/

# Copy GraphQL schema files
RUN find src/modules -name "*.graphql" -exec sh -c 'mkdir -p "dist/$(dirname "$1" | sed "s|^src/||")" && cp "$1" "dist/$(echo "$1" | sed "s|^src/||")"' _ {} \;

EXPOSE 4000

CMD ["sh", "-c", "pnpm prisma migrate deploy && node dist/index.js"]

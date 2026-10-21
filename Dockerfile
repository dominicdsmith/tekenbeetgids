# Build stap
FROM oven/bun:alpine AS build
WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile || bun install

COPY . .
RUN bun run build

# Runner stap
FROM oven/bun:alpine AS runner
WORKDIR /app

# Kopieer de complete .output map (inclusief public assets & server)
COPY --from=build /app/.output ./.output

ENV PORT=8080
ENV HOST=0.0.0.0
ENV NODE_ENV=production

EXPOSE 8080

CMD ["bun", "run", ".output/server/index.mjs"]

FROM oven/bun:alpine AS build
WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install

COPY . .
RUN bun run build

FROM oven/bun:alpine AS runner
WORKDIR /app

# Kopieer de gebouwde output van Nuxt
COPY --from=build /app/.output ./.output

ENV PORT=8080
ENV HOST=0.0.0.0
ENV NODE_ENV=production

EXPOSE 8080

CMD ["bun", "run", ".output/server/index.mjs"]

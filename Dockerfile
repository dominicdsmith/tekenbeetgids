FROM oven/bun:alpine AS build
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install
COPY . .
RUN bun run build

FROM oven/bun:alpine AS runner
WORKDIR /app
COPY --from=build /app/.output ./.output

ENV PORT=8080
EXPOSE 8080

CMD ["bun", "run", ".output/server/index.mjs"]

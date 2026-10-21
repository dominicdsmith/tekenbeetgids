FROM oven/bun:alpine AS build
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install
COPY . .
RUN bun run build

FROM oven/bun:alpine AS runner
WORKDIR /app
RUN bun install -g serve

# Kopieer de hele app-map inclusief build-resultaat
COPY --from=build /app /app

ENV PORT=8080
EXPOSE 8080

# Laat serve automatisch zoeken naar de juiste build-map in de werkmap
CMD ["serve", "-s", ".", "-l", "8080"]

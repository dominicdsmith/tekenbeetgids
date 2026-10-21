FROM oven/bun:alpine AS build
WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install

COPY . .
RUN bun run build

FROM oven/bun:alpine AS runner
WORKDIR /app

# Kopieer de gebouwde Vite output vanuit de dist-map
COPY --from=build /app/dist ./dist

# Installeer de statische file server
RUN bun install -g serve

ENV PORT=8080
EXPOSE 8080

# Start de server met SPA routing (-s zorgt dat alle router-knoppen blijven werken)
CMD ["serve", "dist", "-s", "-l", "8080"]

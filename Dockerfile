FROM oven/bun:alpine AS build
WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install

COPY . .
RUN bun run build

FROM oven/bun:alpine AS runner
WORKDIR /app

# Installeer een eenvoudige, snellehttp-server via Bun
RUN bun install -g serve

# Kopieer de volledige app of de outputmap (we vangen beide op)
COPY --from=build /app/dist ./dist

ENV PORT=8080
EXPOSE 8080

CMD ["serve", "-s", "dist", "-l", "8080"]

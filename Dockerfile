FROM oven/bun:alpine AS build
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install
COPY . .
RUN bun run build

FROM oven/bun:alpine AS runner
WORKDIR /app
RUN bun install -g serve

# Kopieer de gegenereerde outputmap (Vite exporteert standaard naar dist)
COPY --from=build /app/dist /app/dist

ENV PORT=8080
EXPOSE 8080

CMD ["serve", "-s", "dist", "-l", "8080"]

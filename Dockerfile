FROM oven/bun:alpine AS build
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install
COPY . .
RUN bun run build

FROM oven/bun:alpine AS runner
WORKDIR /app
RUN bun install -g serve

# Kopieer alleen de dist-map die zojuist tijdens de build is aangemaakt
COPY --from=build /app/dist ./dist

ENV PORT=8080
EXPOSE 8080

# Serveer direct vanuit de dist-map met SPA routing ingeschakeld
CMD ["serve", "-s", "dist", "-l", "8080"]

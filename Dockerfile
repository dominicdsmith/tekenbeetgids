FROM oven/bun:alpine AS build
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install
COPY . .
RUN bun run build

FROM oven/bun:alpine AS runner
WORKDIR /app
RUN bun install -g serve

# Kopieer alles wat de build-stap heeft opgeleverd direct naar de werkmap
COPY --from=build /app ./ 

ENV PORT=8080
EXPOSE 8080

# Laat de server zoeken in de huidige map of de public/dist mappen die er nu zijn
CMD ["serve", "-s", ".", "-l", "8080"]

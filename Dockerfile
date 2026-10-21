FROM oven/bun:alpine
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install
COPY . .
RUN bun run build

ENV PORT=8080
EXPOSE 8080

# We gebruiken Bun's eigen ingebouwde serve-functie om de dist-map (of .output/public) te serveren
# Standaard bouwt Vite naar 'dist'. Laten we de map pakken die gegarandeerd je app bevat:
CMD ["bun", "x", "serve", "dist", "-l", "8080", "-s"]

FROM oven/bun:alpine
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install
COPY . .
RUN bun run build
RUN bun install -g serve

ENV PORT=8080
EXPOSE 8080

# Laat de server naar de .output-map wijzen voor de SPA
CMD ["serve", "-s", ".output", "-l", "8080"]

FROM oven/bun:alpine
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install
COPY . .
RUN bun run build
RUN bun install -g sirv-cli

ENV PORT=8080
EXPOSE 8080

CMD ["sirv", ".output/public", "--port", "8080", "--single", "--host"]

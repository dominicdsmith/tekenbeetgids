FROM oven/bun:alpine
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install
COPY . .
RUN bun run build
RUN bun install -g serve

ENV PORT=8080
EXPOSE 8080

CMD ["serve", "-s", "dist", "-l", "8080"]

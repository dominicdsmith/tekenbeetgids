FROM oven/bun:alpine
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install
COPY . .
RUN bun run build

# We installeren een heel klein, bewezen pakketje dat specifiek voor SPA's is ontworpen
RUN bun install -g http-server

ENV PORT=8080
EXPOSE 8080

# http-server serveert de .output/public map en stuurt alle routes automatisch door (-P of --proxy / -S voor SPA)
CMD ["http-server", ".output/public", "-p", "8080", "--spa"]

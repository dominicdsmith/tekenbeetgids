# Stap 1: Bouw de app met Bun
FROM oven/bun:alpine AS builder
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install
COPY . .
RUN bun run build

# Stap 2: Serveer de bestanden ultralicht en robuust via Nginx
FROM nginx:alpine

# Kopieer de gebouwde webbestanden naar Nginx's public HTML map
COPY --from=builder /app/.output/public /usr/share/nginx/html

# Zorg dat Nginx luistert naar poort 8080 (wat Cloud Run vereist)
RUN sed -i 's/listen       80;/listen       8080;/g' /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

# Stap 1: Bouw de app met Bun
FROM oven/bun:alpine AS builder
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install
COPY . .
RUN bun run build

# Stap 2: Serveer via Nginx
FROM nginx:alpine

# Kopieer de gebouwde bestanden naar Nginx
COPY --from=builder /app/.output/public /usr/share/nginx/html

# Schrijf direct de juiste Nginx SPA configuratie weg
RUN echo 'server { listen 8080; server_name localhost; location / { root /usr/share/nginx/html; index index.html index.htm; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

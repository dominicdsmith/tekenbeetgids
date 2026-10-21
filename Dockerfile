# Stap 1: Bouw de app met Bun
FROM oven/bun:alpine AS builder
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install
COPY . .
RUN bun run build

# Stap 2: Serveer via Nginx
FROM nginx:alpine

# Kopieer de gebouwde bestanden direct naar de juiste map
COPY --from=builder /app/.output/public /usr/share/nginx/html

# Maak een simpele Nginx config aan voor SPA routing en poort 8080
RUN echo 'server { ' > /etc/nginx/conf.d/default.conf \
    && echo '    listen 8080;' >> /etc/nginx/conf.d/default.conf \
    && echo '    location / { ' >> /etc/nginx/conf.d/default.conf \
    && echo '        root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf \
    && echo '        index index.html index.htm;' >> /etc/nginx/conf.d/default.conf \
    && echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/default.conf \
    && echo '    } ' >> /etc/nginx/conf.d/default.conf \
    && echo '} ' >> /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

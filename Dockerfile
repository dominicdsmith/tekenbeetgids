# Stap 1: Bouw de applicatie met Bun
FROM oven/bun:latest AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install
COPY . .
RUN bun run build

# Stap 2: Serveer via Nginx
FROM nginx:alpine
# Verwijder de standaard Nginx welkomstpagina
RUN rm -rf /usr/share/nginx/html/*

# Kopieer de gebouwde bestanden vanuit de builder stap naar de Nginx webroot
COPY --from=builder /app/dist /usr/share/nginx/html

# Pas Nginx aan om te luisteren op poort 8080 (verplicht voor Cloud Run)
RUN sed -i 's/listen       80;/listen       8080;/g' /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

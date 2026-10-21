# Stap 1: Bouw de React/Vite app met Bun
FROM oven/bun:latest AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install
COPY . .
RUN bun run build

# Stap 2: Serveer de bestanden via Nginx op poort 8080 (vereist door Cloud Run)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Pas Nginx aan om op poort 8080 te luisteren i.p.v. poort 80
RUN sed -i 's/listen       80;/listen       8080;/g' /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

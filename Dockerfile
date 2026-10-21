FROM oven/bun:alpine AS build
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install
COPY . .
RUN bun run build

FROM nginx:alpine
# Verwijder de standaard Nginx welkomstpagina's
RUN rm -rf /usr/share/nginx/html/*

# Kopieer de gebouwde Nuxt bestanden
COPY --from=build /app/.output/public /usr/share/nginx/html

# Zorg dat Nginx luistert op poort 8080 (vereist voor Cloud Run)
RUN sed -i 's/listen  *80;/listen 8080;/g' /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

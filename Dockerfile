FROM oven/bun:alpine
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install
COPY . .
RUN bun run build

# We maken een heel simpel server.js bestand aan dat de SPA correct afhandelt
RUN echo 'const express = require("express");' > server.js \
    && echo 'const path = require("path");' >> server.js \
    && echo 'const app = express();' >> server.js \
    && echo 'const PORT = process.env.PORT || 8080;' >> server.js \
    && echo 'app.use(express.static(path.join(__dirname, ".output/public")));' >> server.js \
    && echo 'app.get("*", (req, res) => { res.sendFile(path.join(__dirname, ".output/public/index.html")); });' >> server.js \
    && echo 'app.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });' >> server.js

RUN bun install express

ENV PORT=8080
EXPOSE 8080

CMD ["bun", "run", "server.js"]

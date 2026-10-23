# Bun/Vite builds in GitHub Actions; only the generated Node server is shipped.
FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080
COPY --chown=node:node .output/ .output/
USER node
EXPOSE 8080
CMD ["node", ".output/server/index.mjs"]
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --chown=node:node server.js index.html ./
COPY --chown=node:node data/*.json.gz data/*.json.br ./data/
USER node
EXPOSE 8080
CMD ["node", "--max-old-space-size=64", "server.js"]

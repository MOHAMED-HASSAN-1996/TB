# TalkBridge — Node.js runtime (works on any Docker-capable host: Koyeb, EdgeOne, etc.)
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev || npm install

COPY . .

# Build must run with dev deps present, so re-install full deps then build.
RUN npm install && npm run build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]

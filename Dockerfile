# TalkBridge on HuggingFace Spaces (free, no credit card).
# HF Spaces sets $PORT (default 7860). Nitro listens on it.
FROM node:20-slim

WORKDIR /app
ENV NODE_ENV=production

# Install deps (leverage cache)
COPY package*.json ./
RUN npm install

# Build the app
COPY . .
RUN npm run build

EXPOSE 7860
ENV PORT=7860
CMD ["node", ".output/server/index.mjs"]

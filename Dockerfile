# TalkBridge — free deployment Dockerfile (Node/Nitro server)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.output /app/.output
COPY --from=build /app/node_modules /app/node_modules
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]

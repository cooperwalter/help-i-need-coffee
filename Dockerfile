FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM node:22-slim
WORKDIR /app
COPY --from=builder /app/dist dist
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/package.json package.json
EXPOSE 3000
CMD ["node", "dist/server/server.js"]

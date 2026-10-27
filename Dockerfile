# Build stage
FROM node:22-alpine AS build
WORKDIR /src

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Publish stage - copy built files to shared volume
FROM node:22-alpine AS runtime
RUN apk add --no-cache rsync

WORKDIR /app
COPY --from=build /src/dist ./dist

CMD ["sh", "-c", "rsync -a --delete dist/ /srv/www/ && echo 'Frontend published to /srv/www'"]

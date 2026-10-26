FROM node:22-alpine

WORKDIR /app

# install dependencies first so Docker can cache this step
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# the backend URL is baked in at build time (the browser calls it directly)
ARG VITE_API_URL=http://127.0.0.1:8000
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

EXPOSE 5173

# serve the built app
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "5173"]

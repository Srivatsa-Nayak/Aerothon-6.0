# Build the static site
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Empty = the UI calls /api on its own origin; nginx proxies that to the backend.
ARG VITE_API_URL=""
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# Serve it with an unprivileged nginx (listens on 8080, runs under OpenShift's random UID)
FROM nginxinc/nginx-unprivileged:1.27-alpine
# Where nginx forwards /api requests; override at runtime.
ENV BACKEND_URL=http://backend:5000
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080

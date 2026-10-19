FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
ENV PORT=5000
EXPOSE 5000
# Non-root; OpenShift will substitute its own random UID, which still works since nothing is written to disk.
USER node
CMD ["node", "server.js"]

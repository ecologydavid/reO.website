# re.O case admin service: two files, no dependencies.
FROM node:24-alpine
WORKDIR /app
COPY rules.mjs server.mjs ./
USER node
ENV PORT=8080
CMD ["node", "server.mjs"]

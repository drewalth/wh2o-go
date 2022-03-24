FROM node:lts as dependencies
WORKDIR /wh2o-next
COPY package.json package-lock.json ./
RUN npm ci

FROM node:lts as builder
WORKDIR /wh2o-next
COPY . .
COPY --from=dependencies /wh2o-next/node_modules ./node_modules
RUN npm run build

FROM node:lts as runner
WORKDIR /wh2o-next
ENV NODE_ENV production
# If you are using a custom next.config.js file, uncomment this line.
 COPY --from=builder /wh2o-next/next.config.js ./
COPY --from=builder /wh2o-next/public ./public
COPY --from=builder /wh2o-next/.next ./.next
COPY --from=builder /wh2o-next/node_modules ./node_modules
COPY --from=builder /wh2o-next/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]

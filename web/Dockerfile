# Using buster-slim because google-closure-compiler-linux
# is dynamically linked to glibc.
# TODO: Check if buster-slim or alpine with glibc is smaller
FROM node:15-buster-slim as dev
WORKDIR /srv
COPY package.json ./
COPY yarn.lock ./
RUN yarn
COPY . ./
RUN yarn build
EXPOSE 3000
CMD ["yarn", "start"]

FROM alpine as prod
WORKDIR /srv
RUN apk add rsync --update
COPY --from=dev /srv/dist/ /srv/dist/
CMD ["rsync", "-vh", "-a", "--delete", "/srv/dist/", "/fe-data/web/"]

# Using buster-slim because google-closure-compiler-linux
# is dynamically linked to glibc.
# TODO: Check if buster-slim or alpine with glibc is smaller
FROM node:15-buster-slim as dev
WORKDIR /srv
COPY package.json yarn.lock ./
RUN yarn
COPY . ./
RUN yarn build
RUN cp -R dist/ dist_backup/
EXPOSE 3000
CMD ["yarn", "start"]

FROM alpine as prod
WORKDIR /srv
COPY --from=dev /srv/dist /srv/dist_backup
CMD ["cp", "-R", "/srv/dist_backup/", "/srv/dist/web"]

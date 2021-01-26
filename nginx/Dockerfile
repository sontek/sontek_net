FROM nginx:alpine
RUN apk add rsync certbot --update
COPY nginx.conf /etc/nginx/ngxinx.conf
COPY ssl.conf /etc/nginx/conf.d/ssl.conf.template
COPY http.conf /etc/nginx/conf.d/http.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.d/



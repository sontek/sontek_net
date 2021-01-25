#!/usr/bin/env sh
set -eu

domains="sontek.net,www.sontek.net"
rsa_key_size=4096
conf_path="/etc/letsencrypt/"
web_path="/var/www/certbot/"
email="john@sontek.net"

if [ -d "$conf_path/live/sontek.net/" ]; then
  echo "### Existing data found for $domains. Not running certbot. Using SSL nginx"
  envsubst < /etc/nginx/conf.d/ssl.conf.template > /etc/nginx/conf.d/default.conf 
else
  echo "### No SSL data found for $domains. Running certbot. Using http nginx"
  envsubst < /etc/nginx/conf.d/http.conf.template > /etc/nginx/conf.d/default.conf 

  if [ ! -e "$conf_path/options-ssl-nginx.conf" ] || [ ! -e "$conf_path/ssl-dhparams.pem" ]; then
    echo "### Downloading recommended TLS parameters ..."
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$conf_path/options-ssl-nginx.conf"
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$conf_path/ssl-dhparams.pem"
    echo
  fi
  echo "### Running nginx so certbot can use it"
  nginx
  certbot certonly \
    --webroot \
    -w /var/www/certbot/ \
    --email=$email \
    -d $domains \
    --agree-tos
#    --dry-run \
  echo "### Stopping nginx now that certbot has ran"
  nginx -s stop
  envsubst < /etc/nginx/conf.d/ssl.conf.template > /etc/nginx/conf.d/default.conf 
fi

exec "$@"


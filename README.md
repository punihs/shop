# API

[![Build Status](https://drone.shoppre.com/api/badges/shoppre/api/status.svg)](https://drone.shoppre.com/shoppre/api) [![Coverage Status](https://coveralls.io/repos/github/shoppre/api/badge.svg?t=3LfehZ)](https://coveralls.io/github/shoppre/api)
# In Production
```sh
git clone https://github.com/shoppre/api

npm i --production
# create systemd service unit file using `sudo nano /etc/systemd/system/api.service`
sudo systemctl enable api
sudo systemctl start api
```

# For Developers

```sh
git clone https://github.com/shoppre/api
npm i
npm start
```

Ports
pf-api & 5007
accounts 4999
ops 5002
member 5003
pay-api 5005
ship-api 5008

```bash
sudo nano /etc/nginx/conf.d/s3.ap-southeast-1.amazonaws.test.conf
server {
  listen 80;
  server_name s3.ap-south-1.amazonaws.test s3.us-west-2.amazonaws.test;
  root /home/pulse/SFS/s3.ap-southeast-1.shoppre.test;
  index index.html;
}

# add `10.0.0.200 s3.ap-south-1.amazonaws.test`
# add `10.0.0.200 s3.us-west-2.amazonaws.test`
sudo nano /etc/hosts

# testing nginx config
sudo nginx -t

# if above command show success
sudo systemctl restart nginx 
```

# To start ui for chrome onesignal notifications

```sh
http-server  -S -o
npm run event:fire
```
# Staging Settings
```bash
server {
  listen  80;
  server_name    staging-ops.shoppre.com;
  return         301 https://$server_name$request_uri;
}

server {
  listen 443 ssl;
  server_name staging-ops.shoppre.com;
  root /home/pulse/shoppre/ops.dist/client;

  location = /socket.io/socket.io.js {
    proxy_redirect off;
    proxy_set_header   X-Real-IP         $remote_addr;
    proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;
    proxy_set_header   Host              $http_host;
    proxy_pass http://127.0.0.1:5000/socket.io/socket.io.js;
  }

  include frontend;
}


```

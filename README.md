# API

[![Build Status](https://drone.shoppre.com/api/badges/shoppre/api/status.svg)](https://drone.shoppre.com/shoppre/api)

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
api 5000
accounts 5001
ops 5002
member 5003

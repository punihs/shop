# HeadHonchos API


# In Production
```sh
git clone https://github.com/quezx/hapi

npm i --production
# create systemd service unit file using `sudo nano /etc/systemd/system/hapi.service`
sudo systemctl enable hapi
sudo systemctl start hapi
```

# For Developers

```sh
git clone https://github.com/quezx/hapi
npm i
npm start
```

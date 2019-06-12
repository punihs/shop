#!/usr/bin/env bash
cd /home/pulse/shoppre/shop;
git reset --hard;
git remote update origin;
git checkout staging;
git pull origin staging;

# shop API
npm install --production;
npm run migrate;
npm run seed;
kill -HUP $(/usr/sbin/lsof -i:4000 -t);
cd ..

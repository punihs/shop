#!/usr/bin/env bash
cd /home/pulse/shoppre/parcel;
git reset --hard;
git remote update origin;
git checkout staging;
git pull origin staging;

# Parcel API
npm install --production;
npm run migrate;
npm run seed;
kill -HUP $(/usr/sbin/lsof -i:5007 -t);


cd lambda;
npm i --production;
npm run email-deploy;
kill -HUP $(/usr/sbin/lsof -i:5004 -t);
cd ..

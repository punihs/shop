const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const oauthComponent = require('./../components/oauth/express');
const config = require('./environment');
const routes = require('../routes');
const db = require('../conn/sqldb');
const responseTime = require('response-time');
const { activityLogger } = require('../components/log');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.on('finish', () => activityLogger({ db })(req, res, next));
    next();
  });
  if (config.env !== 'production') app.use(morgan('dev'));
  app.use(express.static(`${config.root}/public`));
  app.use(bodyParser.json());
  app.use(responseTime());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(cors());
  app.enable('trust proxy');
  app.set('view engine', 'jade');
  app.set('views', `${config.root}/server/app`);
  app.set('appPath', path.join(config.root, 'client'));
  oauthComponent(app, routes);
};


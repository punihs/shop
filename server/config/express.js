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
const helmet = require('helmet');
const { apiLogger } = require('../components/log');
const logger = require('../components/logger');
const rateLimit = require('./ratelimit');

module.exports = (app) => {
  if (config.env !== 'production') app.use(morgan('dev'));
  app.use(responseTime());
  app.use(apiLogger(db));
  app.use(helmet());
  rateLimit(app, db);
  app.use(express.static(`${config.root}/public`));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(cors());
  app.enable('trust proxy');
  app.use(logger.transports.sentry.raven.requestHandler(true));
  app.set('view engine', 'jade');
  app.set('views', `${config.root}/server/app`);
  app.set('appPath', path.join(config.root, 'client'));
  oauthComponent(app, routes);
};


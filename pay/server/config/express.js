const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const responseTime = require('response-time');
const helmet = require('helmet');

const config = require('./environment');
const routes = require('../routes');
const db = require('../conn/sqldb');
const { activityLogger } = require('../components/log');
const { apiLogger } = require('../components/log');
const logger = require('../components/logger');
const rateLimit = require('./ratelimit');

module.exports = (a) => {
  const app = a;
  app.use((req, res, next) => {
    res.on('finish', () => activityLogger({ db })(req, res, next));
    next();
  });
  Object.assign(app.locals, { pretty: true });
  if (config.env !== 'production') app.use(morgan('dev'));
  app.enable('trust proxy');
  app.use(responseTime());
  app.use(apiLogger(db));
  app.use(helmet());
  app.use(rateLimit('api', db));
  app.use(express.static(`${config.root}/public`));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(cors());
  app.use(logger.transports.sentry.raven.requestHandler(true));
  app.set('view engine', 'jade');
  app.set('views', `${config.root}/server/app`);
  app.set('appPath', path.join(config.root, 'client'));
  app.use(rateLimit('pay', db));

  routes(app);
};


const path = require('path');
const cors = require('cors');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const oauthComponent = require('./../components/oauth/express');
const config = require('./environment');
const routes = require('../routes');

module.exports = (app) => {
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(cors());
  app.enable('trust proxy');
  app.set('view engine', 'jade');
  app.set('views', `${config.root}/server/app`);
  app.set('appPath', path.join(config.root, 'client'));
  oauthComponent(app, routes);
};


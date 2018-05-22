/**
 * Main application routes
 */
const express = require('express');

const { name, version } = require('../package.json');

const oAuth = require('./components/oauth');
const logger = require('./components/logger');
const authenticate = require('./components/oauth/authenticate');

// - Routers
const login = require('./api/login');
const orders = require('./api/order');
const search = require('./api/search');
const packages = require('./api/package');
const packageItem = require('./api/packageItem');
const packageItemCategory = require('./api/packageItemCategory');
const shipment = require('./api/shipment');
const shipmentPackage = require('./api/shipment/package');
const address = require('./api/address');
const user = require('./api/user');
const shippingRate = require('./api/shippingRate');
const web = require('./routes/web');

module.exports = (app) => {
  web(app);
  app.use('/api/user', login);
  app.use('/api/search', search);
  app.use('/api/packages', authenticate(), packages);
  app.use('/api/address', authenticate(), address);
  app.use('/api/shipments', authenticate(), shipment, shipmentPackage);
  app.use('/api/orders', authenticate(), orders);
  app.use('/api/shippingRates', shippingRate);
  app.use('/api/packageItems', authenticate(), packageItem);
  app.use('/api/packageItemCategories', authenticate(), packageItemCategory);
  app.use('/api/users', user);
  app.get('/secured', authenticate(), (req, res) => res.json({ name, version }));

  app.get('/', (req, res) => res.json({ name, version }));
  app.use(express.static(app.get('appPath')));
  app.use(oAuth.errorHandler());

  // All undefined asset or api routes should return a 404
  app.use((e, req, res, next) => {
    if (!next) return null;
    const err = e;
    const { body, headers, user: u } = req;

    logger.error(err.message, err, {
      url: req.originalUrl,
      body,
      headers,
      user: u,
    });

    return res.status(500).json({ message: err.message, stack: err.stack });
  });
  app.route('/*').get((req, res) => res.status(404).json({ message: '404' }));
};

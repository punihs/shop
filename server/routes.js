/**
 * Main application routes
 */
const express = require('express');


const { name, version } = require('../package.json');

const oAuth = require('./components/oauth');
const logger = require('./components/logger');
const authenticate = require('./components/oauth/authenticate');

// - Routers
const packages = require('./api/package');
const personalShopperPackage = require('./api/package/personalShopperPackage');
const packageItem = require('./api/packageItem');
const packageItems = require('./api/package/item');
const packageCharge = require('./api/package/charge');
const specialRequest = require('./api/package/specialRequest');
const userShippingPreference = require('./api/user/shippingPreference');
const packageItemCategory = require('./api/packageItemCategory');
const transaction = require('./api/transaction');
const address = require('./api/address');
const user = require('./api/user');
const userPublic = require('./api/user');
const userDocument = require('./api/userDocument');
const country = require('./api/country');
const health = require('./api/health');
const store = require('./api/store');
const userPackage = require('./api/user/package');
const follower = require('./api/package/follower');
const minio = require('./conn/minio/minio.route');

module.exports = (app) => {
  app.use('/api/health', health);
  app.use('/api/minio', authenticate(), minio);
  app.use('/api/public/packages', personalShopperPackage);
  app.use(
    '/api/packages',
    packages, // auth did in router ie., api/package/index.js
    authenticate(),
    packageItems,
    personalShopperPackage,
    packageCharge,
    specialRequest,
    follower,
  );
  app.use('/api/addresses', authenticate(), address);
  app.use('/api/transactions', transaction);
  app.use('/api/userDocuments', authenticate(), userDocument);
  app.use('/api/countries', country);
  app.use('/api/packageItems', authenticate(), packageItem);
  app.use('/api/packageItemCategories', authenticate(), packageItemCategory);
  app.use('/api/users/public', userPublic);
  app.use(
    '/api/users',
    authenticate(),
    user,
    userPackage,
    userShippingPreference,
  );
  app.use('/api/stores', store);
  app.get('/secured', authenticate(), (req, res) => res.json({ name, version }));

  app.get('/health', (req, res) => res.json({ name, version }));
  app.use(express.static(app.get('appPath')));
  app.use(oAuth.errorHandler());
  app.use(logger.transports.sentry.raven.errorHandler());

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

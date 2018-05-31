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
const packageMeta = require('./api/package/meta');
const shippingPreference = require('./api/shippingPreference');
const packageItemCategory = require('./api/packageItemCategory');
const shipment = require('./api/shipment');
const shipmentPackage = require('./api/shipment/package');
const address = require('./api/address');
const user = require('./api/user');
const pricing = require('./api/pricing');
const transaction = require('./api/transaction');
const userDocument = require('./api/userDocument');
const country = require('./api/country');
const shippingPartner = require('./api/shippingPartner');
const health = require('./api/health');
const seo = require('./api/seo');
const faqCategory = require('./api/faqCategory');
const webRoutes = require('./webRoutes');

module.exports = (app) => {
  webRoutes(app);
  app.use('/api/health', health);
  app.use('/api/seo', seo);
  app.use('/api/user', login);
  app.use('/api/search', search);
  app.use('/api/packages', authenticate(), packages, packageMeta);
  app.use('/api/shippingPartners', shippingPartner);
  app.use('/api/addresses', authenticate(), address);
  app.use('/api/shipments', authenticate(), shipment, shipmentPackage);
  app.use('/api/shippingPreference', authenticate(), shippingPreference);
  app.use('/api/transactions', authenticate(), transaction);
  app.use('/api/userDocuments', authenticate(), userDocument);
  app.use('/api/countries', country);
  app.use('/api/orders', authenticate(), orders);
  app.use('/api/pricing', pricing);
  app.use('/api/packageItems', authenticate(), packageItem);
  app.use('/api/packageItemCategories', authenticate(), packageItemCategory);
  app.use('/api/users', user);
  app.use('/api/faqs', faqCategory);
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

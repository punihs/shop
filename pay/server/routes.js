/**
 * Main application routes
 */
const express = require('express');

const { name, version } = require('../package.json');

const logger = require('./components/logger');

// - Routers
const transaction = require('./api/transaction');
// const loyaltyHistory = require('./api/loyaltyHistory');
const paymentGateway = require('./api/paymentGateway');
const paytm = require('./api/paymentGateway/paytm');
const axis = require('./api/paymentGateway/axis');
// const coupon = require('./api/coupon');
// const redemption = require('./api/redemption');


module.exports = (app) => {
  app.use('/api/transactions', transaction);
  // app.use('/api/loyaltyHistories', authenticate(), loyaltyHistory);
  // app.use('/api/redemptions', authenticate(), redemption);
  // app.use('/api/coupons', coupon);
  app.use('/api/paymentGateways', paymentGateway);
  app.use('/api/paytm', paytm);
  app.use('/api/axis', axis);

  app.get('/health', (req, res) => res.json({ name, version }));
  app.use(express.static(app.get('appPath')));
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

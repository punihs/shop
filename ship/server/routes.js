/**
 * Main application routes
 */
const express = require('express');

const { name, version } = require('../package.json');

const oAuth = require('./components/oauth');
const logger = require('./components/logger');
const authenticate = require('./components/oauth/authenticate');

// - Routers
const search = require('./api/search');
const shipment = require('./api/shipment');
const shipmentComment = require('./api/shipment/comment');
const user = require('./api/user');
const userPublic = require('./api/user');
const pricing = require('./api/pricing');
const notification = require('./api/notification');
const userDocument = require('./api/userDocument');
const country = require('./api/country');
const review = require('./api/review');
const feedback = require('./api/feedback');
const shippingPartnerShipments = require('./api/shippingPartner/shipment');
const health = require('./api/health');
const place = require('./api/place');
const estimation = require('./api/estimation');
const userShipment = require('./api/user/shipment');
const shipmentFollower = require('./api/shipment/follower');
const shipmentTypes = require('./api/shipmentType');
const minio = require('./conn/minio/minio.route');
const cron = require('./cron');

module.exports = (app) => {
  app.use('/api/health', health);
  app.use('/api/minio', authenticate(), minio);
  app.use('/api/search', search);
  app.use('/api/shippingPartners', shippingPartnerShipments);
  app.use('/api/public/shipments', shipment);
  app.use(
    '/api/shipments',
    authenticate(),
    shipment,
    shipmentComment,
    shipmentFollower,
  );
  app.use('/api/notifications', authenticate(), notification);
  app.use('/api/userDocuments', authenticate(), userDocument);
  app.use('/api/countries', country);
  app.use('/api/reviews', review);
  app.use('/api/feedbacks', feedback);
  app.use('/api/pricing', pricing);
  app.use('/api/users/public', userPublic);
  app.use(
    '/api/users',
    user,
    authenticate(),
    userShipment,
  );
  app.use('/api/crons', cron);
  app.use('/api/places', place);
  app.use('/api/estimations', estimation);
  app.use('/api/shipmentTypes', shipmentTypes);
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

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
const packageComment = require('./api/package/comment');
const packageItem = require('./api/packageItem');
const packageItems = require('./api/package/item');
const packageCharge = require('./api/package/charge');
const specialRequest = require('./api/package/specialRequest');
const shippingPreference = require('./api/shippingPreference');
const packageItemCategory = require('./api/packageItemCategory');
const shipment = require('./api/shipment');
const shipmentComment = require('./api/shipment/comment');
const shipmentPackage = require('./api/shipment/package');
const personalShopperPackage = require('./api/personalShopperPackage');
const address = require('./api/address');
const user = require('./api/user');
const pricing = require('./api/pricing');
const transaction = require('./api/transaction');
const campaign = require('./api/campaign');
const notification = require('./api/notification');
const loyaltyHistory = require('./api/loyaltyHistory');
const userDocument = require('./api/userDocument');
const country = require('./api/country');
const review = require('./api/review');
const category = require('./api/category');
const feedback = require('./api/feedback');
const shippingPartner = require('./api/shippingPartner');
const health = require('./api/health');
const seo = require('./api/seo');
const paymentGateway = require('./api/paymentGateway');
const paytm = require('./api/paymentGateway/paytm');
const axis = require('./api/paymentGateway/axis');
const passwordReset = require('./api/passwordReset');
const faqCategory = require('./api/faqCategory');
const place = require('./api/place');
const store = require('./api/store');
const estimation = require('./api/estimation');
const coupon = require('./api/coupon');
const userPackage = require('./api/user/package');
const userShipment = require('./api/user/shipment');
const emailPreference = require('./api/emailPreference');
const emailTemplate = require('./api/emailTemplate');
const photoRequest = require('./api/package/photoRequest');
const follower = require('./api/package/follower');
const shipmentFollower = require('./api/shipment/follower');
const shipmentTypes = require('./api/shipmentType');
const webRoutes = require('./webRoutes');
const minio = require('./conn/minio/minio.route');
const cron = require('./cron');

module.exports = (app) => {
  webRoutes(app);
  app.use('/api/health', health);
  app.use('/api/minio', authenticate(), minio);
  app.use('/api/seo', seo);
  app.use('/api/user', login);
  app.use('/api/search', search);
  app.use(
    '/api/packages',
    packages, // auth did in router ie., api/package/index.js
    authenticate(),
    packageItems,
    packageComment,
    packageCharge,
    specialRequest,
    photoRequest,
    follower,
  );
  app.use('/api/shippingPartners', shippingPartner);
  app.use('/api/addresses', authenticate(), address);
  app.use(
    '/api/shipments',
    authenticate(),
    shipment,
    shipmentPackage,
    shipmentComment,
    shipmentFollower,
  );
  app.use('/api/shippingPreference', authenticate(), shippingPreference);
  app.use('/api/transactions', authenticate(), transaction);
  app.use('/api/campaigns', authenticate(), campaign);
  app.use('/api/notifications', authenticate(), notification);
  app.use('/api/loyaltyHistories', authenticate(), loyaltyHistory);
  app.use('/api/personalShopperPackages', authenticate(), personalShopperPackage);
  app.use('/api/userDocuments', authenticate(), userDocument);
  app.use('/api/countries', country);
  app.use('/api/reviews', review);
  app.use('/api/categories', category);
  app.use('/api/feedbacks', feedback);
  app.use('/api/orders', authenticate(), orders);
  app.use('/api/pricing', pricing);
  app.use('/api/packageItems', authenticate(), packageItem);
  app.use('/api/packageItemCategories', authenticate(), packageItemCategory);
  app.use(
    '/api/users',
    authenticate(),
    user,
    userPackage,
    userShipment,
  );
  app.use('/api/faqs', faqCategory);
  app.use('/api/crons', cron);
  app.use('/api/places', place);
  app.use('/api/stores', store);
  app.use('/api/paymentGateways', paymentGateway);
  app.use('/api/paytm', authenticate(), paytm);
  app.use('/api/axis', authenticate(), axis);
  app.use('/api/passwordReset', passwordReset);
  app.use('/api/estimations', estimation);
  app.use('/api/shipmentTypes', shipmentTypes);
  app.use('/api/coupons', coupon);
  app.use('/api/emailPreferences', authenticate(), emailPreference);
  app.use('/api/emailTemplates', authenticate(), emailTemplate);
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

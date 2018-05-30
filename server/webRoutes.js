/**
 * Public application routes
 */

// - Routers
const shippingPartner = require('./app/shippingPartner');

module.exports = (app) => {
  app.use('/shipping-partners', shippingPartner);
};

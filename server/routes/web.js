// const shipRequest = require('./../app/shipRequest');
const partner = require('./../app/shippingPartner');

module.exports = (app) => {
  // /app.use('/shipments', shipRequest);
  app.use('/shipping_partners', partner);
};

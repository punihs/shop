const shipment = require('./../app/shipment');
const shippingPartner = require('./../app/shippingPartner');

module.exports = (app) => {
  app.use('/shipments', shipment);
  app.use('/shipping_partners', shippingPartner);
};

/**
 * Public application routes
 */

// - Routers
const home = require('./app/home');
const services = require('./app/service');
const consolidationService = require('./app/consolidationService');
const browseCategories = require('./app/browseCategories');
const howItWork = require('./app/howItWork');
const pricing = require('./app/pricing');
const about = require('./app/about');
const faq = require('./app/faq');
const country = require('./app/country');
const contact = require('./app/contact');
const review = require('./app/review');
const schedulePickup = require('./app/schedulePickup');

const shippingPartner = require('./app/shippingPartner');
// const shippingPartnerDetail = require('./app/shippingPartnerDetail');
const paymentGateway = require('./app/paymentGateway');
const store = require('./app/store');
const state = require('./app/state');
const feedback = require('./app/feedback');
const privacyPolicy = require('./app/privacyPolicy');
const refundAndCancellation = require('./app/refundAndCancellation');
const countryGuide = require('./app/countryGuide');
const dhl = require('./app/dhl');
const virtualAddress = require('./app/virtualAddress');
const shopShip = require('./app/shopShip');
const sellerShipping = require('./app/sellerShipping');
const termsAndConditions = require('./app/termsAndConditions');

module.exports = (app) => {
  app.use('/', home);
  app.use('/services', services);
  app.use('/consolidation-service', consolidationService);
  app.use('/how-it-works', howItWork);
  app.use('/contact', contact);
  app.use('/about', about);
  app.use('/faqs', faq);
  app.use('/browse-categories', browseCategories);
  app.use('/pricing', pricing);
  app.use('/shipping-partners', shippingPartner);
  app.use('/payment-gateways', paymentGateway);
  app.use('/stores', store);
  app.use('/countries', country);
  app.use('/state', state);
  app.use('/reviews', review);
  app.use('/schedule-pickup', schedulePickup);
  app.use('/feedback', feedback);
  app.use('/privacy-Policy', privacyPolicy);
  app.use('/refund-and-cancellation-policy', refundAndCancellation);
  app.use('/country-guide', countryGuide);
  app.use('/dhl', dhl);
  app.use('/indian-virtual-address', virtualAddress);
  app.use('/shop-from-india-ship-worldwide', shopShip);
  app.use('/sellers-shipping', sellerShipping);
  app.use('/terms-and-conditions', termsAndConditions);
};

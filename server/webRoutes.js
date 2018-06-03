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
const contactUs = require('./app/contactUs');

const shippingPartner = require('./app/shippingPartner');
// const shippingPartnerDetail = require('./app/shippingPartnerDetail');
const paymentGateway = require('./app/paymentGateway');
const store = require('./app/store');
const city = require('./app/city');

module.exports = (app) => {
  app.use('/', home);
  app.use('/services', services);
  app.use('/consolidation-service', consolidationService);
  app.use('/how-it-works', howItWork);
  app.use('/contactUs', contactUs);
  app.use('/about', about);
  app.use('/faqs', faq);
  app.use('/browse-categories', browseCategories);
  app.use('/pricing', pricing);
  app.use('/shipping-partners', shippingPartner);
  app.use('/payment-gateways', paymentGateway);
  app.use('/stores', store);
  app.use('/countries', country);
  app.use('/cities', city);
  // app.use('/destinations', countryGuide);
  // app.use('/packages', countryGuide);  //itemName, storeName,storeId
  // app.use('/shipments', countryGuide); // dhl,paymentGateway,deliveryTime,price
  // app.use('/users', countryGuide);     //name,flipkart
  // app.use('/reviews', countryGuide);   // reviews
  // app.use('/coupons', countryGuide); //coupons
  // app.use('/sources', countryGuide); //objectType,link
  // app.use('/emails/', countryGuide);  //emails sent
  // app.use('/estimations', countryGuide); // estimation,source,countryid
  // app.use('/categories', countryGuide);  //
  // app.use('/states', countryGuide);  // states list-- parentid for
};

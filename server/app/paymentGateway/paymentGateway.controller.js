
const rp = require('request-promise');
const { URLS_API } = require('../../config/environment');


exports.show = (req, res, next) => Promise
  .all([
    rp(`${URLS_API}/api/paymentGateways/${req.params.slug}`, { json: true }),
  ])
  .then(([paymentGateway]) =>
    res
      .render('paymentGateway/show', Object
        .assign(paymentGateway, {
          logo: 'img/PayPal.png',
          title: 'Online Shopping: Best Stores for Shopping Online - PayPal CA',
          meta_description: 'Shop with PayPal at millions of online stores by logging in with just your email and password. Secure check out at eBay, Best Buy, Home Depot and more.',
          meta_title: 'Online Shopping: Best Stores for Shopping Online - PayPal CA',
        })))
  .catch(next);


const { URLS_MYACCOUNT, URLS_WWW } = require('../../config/environment');

exports.index = (req, res) => {
  res.render('sellerShipping/index', {
    URLS_MYACCOUNT,
    URLS_WWW,
    title: 'ShoppRe - Shop Indian Stores &amp; Ship Internationally | Courier Service',
    meta_description: 'Signup for Indian Address. Shop your favorite Indian store and Ship Internationally. India&#039;s #1 international courier, shipping and consolidation company.',
    meta_keywords: 'shop and ship, courier service, shoppre, consolidation company, indian store, ship internationally',
  });
};

const { URLS_MYACCOUNT, URLS_WWW } = require('../../config/environment');

exports.index = (req, res) => {
  res.render('about/index', {
    URLS_MYACCOUNT,
    URLS_WWW,
    title: 'About | Shoppre - International Shipping Partner',
    meta_disctription: 'Know how Shoppre a parcel forwarding &amp; international shipping services work for online shopping in India while ensuring fast service at unbelievably low prices.',
    meta_keywords: 'know how, shoppre, parcel forwarding, international shipping services, online shopping in india, fast service, dhl, fedex, dtdc',
  });
};

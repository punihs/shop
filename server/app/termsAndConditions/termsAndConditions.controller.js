const { URLS_MYACCOUNT, URLS_WWW } = require('../../config/environment');

exports.index = (req, res) => {
  res.render('privacyPolicy/index', {
    URLS_MYACCOUNT,
    s3BaseUrl: req.s3BaseUrl,
    URLS_WWW,
    title: 'Terms And Conditions | Shoppre - Shipping From India',
    meta_disctription: 'Terms and Conditions by Shoppre that applies to user must agree to adhere to the following guidelines when using this Website or Mobile App.',
    meta_keywords: 'terms and conditions, set of rules and guidelines user must agree, following guidelines, website, mobile app',
  });
};

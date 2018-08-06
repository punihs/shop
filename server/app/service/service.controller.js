const { URLS_API, URLS_MYACCOUNT } = require('../../config/environment');

exports.index = (req, res) => {
  res.render('service/index', {
    s3BaseUrl: req.s3BaseUrl,
    URLS_API,
    URLS_MYACCOUNT,
    title: 'Shoppre Services | Personal Shopper | Shop &amp; Ship Worldwide',
    meta_description: 'Enjoy fast and worry-free shipping experience. Our Personal Shopper will purchase the item on your behalf, using our Indian local card. Sign-up, Buy &amp; Ship Now!',
    meta_keywords: 'fast, worry-free shipping experience, personal shopper, ship worldwide, simply sign-up, buy now',
  });
};

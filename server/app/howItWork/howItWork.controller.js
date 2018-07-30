const { URLS_MYACCOUNT } = require('../../config/environment');

exports.index = (req, res) => {
  res.render('howItWork/index', {
    URLS_MYACCOUNT,
    s3BaseUrl: req.s3BaseUrl,
    title: 'How Does it Works | Shoppre - International Shipping Partner',
    meta_description: 'Learn more how Our personal Shoppre service manages and ship your packages from multiple Indian stores and delivered to your country in just 2 to 4 days!',
    meta_keywords: 'learn more, our personal shoppre service, manages, ship your packages, multiple indian stores, delivered to your country',
  });
};


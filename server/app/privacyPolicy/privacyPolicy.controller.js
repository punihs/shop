const { URLS_MYACCOUNT } = require('../../config/environment');

exports.index = (req, res) => {
  res.render('privacyPolicy/index', {
    URLS_MYACCOUNT,
    title: 'aboutpage',
    meta_disctription: 'discription',
    meta_title: 'metatital',
  });
};

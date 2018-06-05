const { URLS_MYACCOUNT } = require('../../config/environment');

exports.index = (req, res) => {
  res.render('review/index', {
    URLS_MYACCOUNT,
    title: 'review',
    meta_description: '',
    meta_title: '',
    reviews: {
      id: 1,
      review: 'good',
    },
  });
};

const { URLS_MYACCOUNT } = require('../../config/environment');

exports.index = (req, res) => {
  res.render('refundAndCancellation/index', {
    URLS_MYACCOUNT,
    s3BaseUrl: req.s3BaseUrl,
    title: 'Refund And Cancellation Policy - Shoppre',
    meta_disctription: 'Please read the refund policy, conditions carefully before making shipping, handling charges, membership dues, return fees, storage charges and any optional services.',
    meta_title: 'refund policy, conditions, shipping, handling charges, membership dues, return fees, storage charges',
  });
};

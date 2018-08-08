const { URLS_API } = require('../../config/environment');

exports.index = (req, res) => {
  res.render(
    'feedback/index',
    {
      URLS_API,
      s3BaseUrl: req.s3BaseUrl,
      title: 'Shoppre.com - Member Feedback Form | Shoppre',
      meta_disctription: 'How we are doing? Regarding your most recent shipment received through Shoppre.com, please leave your feedback, suggestion and provide us more information.',
      meta_keywords: 'shipment, suggestion, feedback, information, form',
    },
  );
};

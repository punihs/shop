const { URLS_API } = require('../../config/environment');

exports.index = (req, res) => {
  res.render(
    'feedback/index',
    {
      URLS_API,
      s3BaseUrl: req.s3BaseUrl,
      title: 'aboutpage',
      meta_disctription: 'discription',
      meta_title: 'metatital',
    },
  );
};

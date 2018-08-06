
const { URLS_API, URLS_MYACCOUNT } = require('../../config/environment');

exports.index = (req, res) => {
  res.render('consolidationService/index', {
    s3BaseUrl: req.s3BaseUrl,
    URLS_API,
    URLS_MYACCOUNT,
    title: 'Shoppre Consolidation Service - Save On Shipping Costs',
    meta_description: 'Shoppre help in reducing Shipping cost by Combining your packages from multiple stores to one tracking number, and save upto 60% - 80% on shipping rates!',
    meta_keywords: 'shoppre, consolidation service, save on shipping costs, multiple stores, packages',
  });
};

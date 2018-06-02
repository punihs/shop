
exports.index = (req, res) => {
  res.render('pricing/index', {
    title: 'pricing title',
    meta_description: 'pricing_metaDesctription',
    meta_title: 'pricing_metaTitle',
  });
};


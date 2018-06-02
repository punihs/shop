exports.index = (req, res) => {
  res.render('howItWork/index', {
    title: 'How-it-works',
    meta_description: 'how it works metaDesctription',
    meta_title: 'how it works metaTitle',
    discription: 'Description',
  });
};


exports.index = (req, res) => {
  res.render('browseCategories/index', {
    title: 'aboutpage',
    meta_disctription: 'discription',
    meta_title: 'metatital',
  });
};

exports.index = (req, res) => {
  res.render('about/index', { title: 'aboutpage', meta_disctription: 'discription', meta_title: 'metatital' });
};

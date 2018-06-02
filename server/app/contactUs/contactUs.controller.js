exports.index = (req, res) => {
  res.render('contactUs/index', {
    title: 'ContactUs',
    meta_description: 'Contact Desctrioption',
    meta_title: 'Contact meta_title ',
  });
};

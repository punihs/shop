exports.index = (req, res) => {
  res.render(
    'feedback/index',
    {
      title: 'aboutpage',
      meta_disctription: 'discription',
      meta_title: 'metatital',
    },
  );
};

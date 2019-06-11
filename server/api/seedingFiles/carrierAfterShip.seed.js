module.exports = () => [
  {
    slug: 'aramex',
    carrier: 'Aramex',
  }, {
    slug: 'fedex',
    carrier: 'Zipter-fedex',
  },
].map(x => ({ ...x, active: 1 }));

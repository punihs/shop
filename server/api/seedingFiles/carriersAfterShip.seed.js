module.exports = () => [
  {
    slug: 'tnt',
    carrier: 'TNT',
  }, {
    slug: 'ecom-express',
    carrier: 'Ecom Express',
  }, {
    slug: 'delhivery',
    carrier: 'Delhivery',
  }, {
    slug: 'tnt-fr',
    carrier: 'TNT France',
  }, {
    slug: 'india-post',
    carrier: 'India Post Domestic',
  }, {
    slug: 'india-post-int',
    carrier: 'India Post International',
  }, {
    slug: 'dtdc-express',
    carrier: 'DTDC Express Global PTE LTD',
  }, {
    slug: 'dpd',
    carrier: 'DPD',
  }].map(x => ({ ...x, active: 1 }));

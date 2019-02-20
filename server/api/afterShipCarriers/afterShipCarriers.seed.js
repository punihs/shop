module.exports = () => [
  {
    slug: 'aramex',
    carrier: 'Art logistics Aromex',
  }, {
    slug: 'xpressbees',
    carrier: 'Insta xpressBees',
  }, {
    slug: 'dtdc',
    carrier: 'Dtdc',
  }, {
    slug: 'usps',
    carrier: 'USPS',
  }, {
    slug: 'ups',
    carrier: 'Art logistics UPS',
  }, {
    slug: 'fedex',
    carrier: 'Fedex',
  }, {
    slug: 'fedex',
    carrier: 'Insta fedex',
  }, {
    slug: 'fedex',
    carrier: 'Art logistics Fedex',
  }, {
    slug: 'fedex',
    carrier: 'Aipex-fedex',
  }, {
    slug: 'dhl',
    carrier: 'DHL',
  }, {
    slug: 'dhl',
    carrier: 'Art logistics dhl',
  }, {
    slug: 'dhl',
    carrier: 'Apiex dhl',
  },
].map(x => ({ ...x, active: 1 }));

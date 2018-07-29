const rp = require('request-promise');
const { URLS_API } = require('../../config/environment');
const { URLS_MYACCOUNT, s3BaseUrl } = require('../../config/environment');


exports.index = (req, res, next) => Promise
  .all([
    rp(`${URLS_API}/api/countries`, { json: true }),
    rp(`${URLS_API}/api/reviews`, { json: true }),
  ])
  .then(([countries, reviews]) => {
    res.render('pricing/index', {
      title: 'Pricing | Shipping Cost Calculator - Shoppre',
      meta_description: 'Get the right plan that suits your need and calculate your shipping costs from India to any country. Save upto 75% on shipping rates!',
      meta_keywords: 'calculate your shipping costs, from india to any country, save 75% on shipping rates, repackaging service, shipping calculator',
      countries,
      reviews,
      URLS_MYACCOUNT,
      s3BaseUrl,
      states: [
        {
          state: 'AP',
          name: 'Andhra Pradesh',
        },
        {
          state: 'AR',
          name: 'Arunachal Pradesh',
        },
        {
          state: 'AS',
          name: 'Assam',
        },
        {
          state: 'BR',
          name: 'Bihar',
        },
        {
          state: 'CT',
          name: 'Chhattisgarh',
        },
        {
          state: 'GA',
          name: 'Goa',
        },
        {
          state: 'GJ',
          name: 'Gujarat',
        },
        {
          state: 'HR',
          name: 'Haryana',
        },
        {
          state: 'HP',
          name: 'Himachal Pradesh',
        },
        {
          state: 'JK',
          name: 'Jammu & Kashmir',
        },
        {
          state: 'JH',
          name: 'Jharkhand',
        },
        {
          state: 'KA',
          name: 'Karnataka',
        },
        {
          state: 'KL',
          name: 'Kerala',
        },
        {
          state: 'MP',
          name: 'Madhya Pradesh',
        },
        {
          state: 'MH',
          name: 'Maharashtra',
        },
        {
          state: 'MN',
          name: 'Manipur',
        },
        {
          state: 'ML',
          name: 'Meghalaya',
        },
        {
          state: 'stateMZ',
          name: 'Mizoram',
        },
        {
          state: 'NL',
          name: 'Nagaland',
        },
        {
          state: 'OR',
          name: 'Odisha',
        },
        {
          state: 'PB',
          name: 'Punjab',
        },
        {
          state: 'RJ',
          name: 'Rajasthan',
        },
        {
          state: 'SK',
          name: 'Sikkim',
        },
        {
          state: 'TN',
          name: 'Tamil Nadu',
        },
        {
          state: 'TR',
          name: 'Tripura',
        },
        {
          state: 'UK',
          name: 'Uttarakhand',
        },
        {
          state: 'UP',
          name: 'Uttar Pradesh',
        },
        {
          state: 'WB',
          name: 'West Bengal',
        },
        {
          state: 'AN',
          name: 'Andaman & Nicobar',
        },
        {
          state: 'CH',
          name: 'Chandigarh',
        },
        {
          state: 'DN',
          name: 'Dadra and Nagar Haveli',
        },
        {
          state: 'DD',
          name: 'Daman & Diu',
        },
        {
          state: 'DL',
          name: 'Delhi',
        },
        {
          state: 'LD',
          name: 'Lakshadweep',
        },
        {
          state: 'PY',
          name: 'Puducherry',
        }],
    });
  })
  .catch(next);

const fs = require('fs');

const fedex = require('./../dtdc/data/fedex.countries');
const country = require('./data/countries');

const extraCountriesInFedex = [
  { country: 'Ivory Coast', country_code: 'CI' },
  { country: 'Netherlands Antilles', country_code: 'AN' },
  { country: 'Somaliland, Rep Of (North Somalia)', country_code: 'SO' },
  { country: 'Turkmenistan', country_code: 'TM' },
  { country: 'Western Sahara', country_code: 'EH' },
];

const countries = {
  dhl: country.concat(extraCountriesInFedex),
  fedex,
};

const updated = countries.fedex.map((fc) => {
  const fedexCountry = fc;
  const dhlMap = countries.dhl.find(dhlCountry => (dhlCountry.country === fedexCountry.country));
  fedexCountry.country_code = dhlMap ? dhlMap.country_code : null;
  return fedexCountry;
});

fs.writeFileSync('./../dtdc/data/fedex.country_codes.json', JSON.stringify(updated));

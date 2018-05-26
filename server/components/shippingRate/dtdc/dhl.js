const debug = require('debug');
const countries = require('./data/countries');
const data = require('./data/dhl');

const log = debug('components/shippingRate/dtdc/dhl');

const getMultiplier = ({ zone, weight }) => data.multiplier.find((x) => {
  const [from, to] = x.weight.split(' to ');
  if (!(weight >= from && weight <= to)) return false;
  return x;
})[zone];

const getPrice = ({
  country = 'US',
  weight = 0.5,
  type: t = 'doc',
}) => {
  let type = t;
  log('dhl', { type, country, weight });
  if (weight > 2.5 && type === 'doc') type = 'nondoc';

  const maxContinuousWeight = data[type][data[type].length - 1].weight;

  const ctry = countries.find(x => (x.country_code === country));

  if (weight <= maxContinuousWeight) {
    return data[type].find(x => (x.weight === weight))[ctry.zone];
  }

  return getPrice({
    weight: maxContinuousWeight,
    country,
    type,
  }) + ((weight - maxContinuousWeight) * getMultiplier({ zone: ctry.zone, weight, country }));
};


module.exports = getPrice;

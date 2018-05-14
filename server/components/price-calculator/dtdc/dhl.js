
const countries = require('./data/countries');
const data = require('./data/dhl');

const getMultiplier = ({ zone, weight }) => data.multiplier.find((x) => {
  const [from, to] = x.weight.split(' to ');
  if (!(weight >= from && weight <= to)) return false;
  return x;
})[zone];

const getPrice = ({
  country = 'US',
  weight = 0.5,
  type = 'doc',
}) => {
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

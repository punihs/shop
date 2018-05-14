
const doc = require('./doc.json');
const nondoc = require('./nondoc.json');
const multiplier = require('./multiplier.json');
const countries = require('./countries.json');

const types = {
  doc,
  nondoc,
};

const maxContinuousWeight = nondoc[nondoc.length - 1].weight;


const getMultiplier = ({ zone, weight }) => multiplier.find((x) => {
  const [from, to] = x.weight.split(' to ');
  if (!(weight >= from && weight <= to)) return false;
  return x;
})[zone];

const getPrice = ({
  country = 'US',
  weight = 0.5,
  type = 'doc',
}) => {
  const ctry = countries.find(x => (x.country_code === country));

  if (weight <= maxContinuousWeight) {
    return types[type].find(x => (x.weight === weight))[ctry.zone];
  }

  return getPrice({
    weight: maxContinuousWeight,
    country,
    type,
  }) + ((weight - maxContinuousWeight) * getMultiplier({ zone: ctry.zone, weight, country }));
};

module.exports = getPrice;

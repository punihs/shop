const debug = require('debug');
const data = require('./data/dtdc');
const dtdcDhlMap = require('./data/dtdc-dhl-map');

const log = debug('components/shippingRate/dtdc/self');

const getBaseRates = ({ weight: w, country, type: t }) => {
  let type = t;
  let weight = w;
  if (type === 'nondoc' && weight < 0.5) weight = 0.5;
  log('dtdcself', { weight, country, type });
  const countryAsPerDtdcExcel = dtdcDhlMap[country];
  const dtdcWeightConversionFactor = 1000;
  const weightLikeDtdcExcel = weight * dtdcWeightConversionFactor;

  if (weight > 2 && type === 'doc') type = 'nondoc';

  const baseMinimumWeight = 0.5;
  const currentWeightSlabFactor = weight / 0.5; // every half(0.5) kg price will be multiplied
  log('currentWeightSlabFactor', currentWeightSlabFactor);

  // doc 1, 1.5, 2kg
  if (type === 'doc' && weightLikeDtdcExcel > 500 && weightLikeDtdcExcel <= 2000) {
    return currentWeightSlabFactor * getBaseRates({ weight: baseMinimumWeight, type, country });
  } else if (weightLikeDtdcExcel > 500 && weightLikeDtdcExcel <= 5000) { // - 2-5kg doc/nondoc
    const base500GramPrice = getBaseRates({
      type: 'nondoc',
      weight: baseMinimumWeight,
      country,
    });

    const additional500GramCount = currentWeightSlabFactor - 1;
    log('additional500GramCount', additional500GramCount);
    log('countryAsPerDtdcExcel', countryAsPerDtdcExcel);

    const chargeForAddtional500Gram = data.nondoc
      .find(x => (x.country === countryAsPerDtdcExcel)).additional_500_gram_cost;

    log('base500GramPrice', base500GramPrice);
    log('chargeForAddtional500Gram', chargeForAddtional500Gram);
    return base500GramPrice + (additional500GramCount * chargeForAddtional500Gram);
  } else if (weightLikeDtdcExcel > 5000) {
    log('nondoc', weightLikeDtdcExcel);

    const nonDocRate = data[type].find(x => (x.country === countryAsPerDtdcExcel));
    log('nonDocRate', nonDocRate);

    let baseRate;
    Object.keys(nonDocRate).some((fromTo) => {
      const [from, to] = fromTo.split(' to ').map(Number);
      if (weightLikeDtdcExcel > from && weightLikeDtdcExcel <= to) {
        baseRate = nonDocRate[fromTo];
        return true;
      }
      return false;
    });

    return baseRate * Math.ceil(weight);
  }

  // weight doc for 0.25 & 0.5
  return data[type].find(x => (x.country === countryAsPerDtdcExcel))[weightLikeDtdcExcel];
};

module.exports = getBaseRates;

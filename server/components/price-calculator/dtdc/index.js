const data = require('./data/dtdc');
const dtdcDhlMap = require('./data/dtdc-dhl-map');

const getBaseRates = ({ weight, country, type: t }) => {
  let type = t;
  const countryAsPerDtdcExcel = dtdcDhlMap[country];
  const dtdcWeightConversionFactor = 1000;
  const weightLikeDtdcExcel = weight * dtdcWeightConversionFactor;

  if (weight > 2 && type === 'doc') type = 'nondoc';

  const baseMinimumWeight = 0.5;
  const currentWeightSlabFactor = weight / 0.5; // every half(0.5) kg price will be multiplied

  // doc 1, 1.5, 2kg
  if (type === 'doc' && weightLikeDtdcExcel > 500 && weightLikeDtdcExcel <= 2000) {
    return currentWeightSlabFactor * getBaseRates({ weight: baseMinimumWeight, type, country });
  } else if (weightLikeDtdcExcel >= 2000 && weightLikeDtdcExcel <= 5000) { // - 2-5kg doc/nondoc
    const base500GramPrice = getBaseRates({
      type: 'nondoc',
      weight: baseMinimumWeight,
      country,
    });

    const additional500GramCount = currentWeightSlabFactor - 1;

    const chargeForAddtional500Gram = data.nondoc
      .find(x => (x.country === countryAsPerDtdcExcel)).additional500GramCost;

    return base500GramPrice + (additional500GramCount * chargeForAddtional500Gram);
  } else if (weightLikeDtdcExcel > 5000) {
    const nonDocRate = data[type].find(x => (x.country === countryAsPerDtdcExcel));
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

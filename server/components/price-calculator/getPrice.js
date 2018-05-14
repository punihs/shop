const dtdc = require('./dtdc/index');
const dhl = require('./dhl/getPrice');
const dtdcfedex = require('./dtdc/fedex');
const dtdcdhl = require('./dtdc/dhl');
const dtdceco = require('./dtdc/eco');

const providers = {
  dtdc,
  dhl,
  dtdcfedex,
  dtdcdhl,
  dtdceco,
};

const otherCharges = {
  fuelSurcharge: 1.22,
  gst: 1.18,
  profit: 1.25,
};

const getPrice = (params, provider) => {
  const baseCost = providers[provider](params);
  const baseCostWithProfit = baseCost * otherCharges.profit;
  const gst = Math.ceil(baseCostWithProfit * (otherCharges.gst - 1));
  const fuelSurcharge = Math.ceil(baseCostWithProfit * (otherCharges.fuelSurcharge - 1));
  return {
    baseCost_from_upstream: baseCost,
    baseCost: baseCostWithProfit,
    gst,
    fuel_surcharge: fuelSurcharge,
    final_cost: baseCost + gst + fuelSurcharge,
  };
};

module.exports = params => params.providers.map(provider => getPrice(params, provider));

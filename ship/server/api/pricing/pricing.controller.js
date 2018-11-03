const debug = require('debug');
const dtdc = require('../../components/pricing/dtdc/index');
const dhl = require('../../components/pricing/dhl/getPrice');
const dtdcfedex = require('../../components/pricing/dtdc/fedex');
const dtdcdhl = require('../../components/pricing/dtdc/dhl');
const dtdceco = require('../../components/pricing/dtdc/eco');

const shippingPartners = {
  dtdc,
  dhl,
  dtdcfedex,
  dtdcdhl,
  dtdceco,
};
const {
  CONSIGNMENT_TYPES: { DOC, NONDOC },
} = require('../../config/constants');

const log = debug('s.pricing.controller');
const priceCalculator = require('../../components/pricing');
const { Country, ShippingRate, Review } = require('../../conn/sqldb');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.calcShipping = async (req, res, next) => {
  if (!Number(req.query.countryId)) return res.status(400).json();
  try {
    const { countryId, type } = req.query;
    const weight = Number(req.query.weight);
    const docType = weight <= 2 ? type : 'nondoc';
    let rate = '';
    const options = {
      attributes: ['amount'],
      where: {
        country_id: countryId,
        consignment_type: docType,
        minimum: {
          $lt: weight,
        },
      },
    };

    if (weight <= 300) {
      options.where.maximum = {
        $gte: weight,
      };
    } else {
      options.where.maximum = 0;
    }
    log('optionsRate', JSON.stringify(options));
    rate = await ShippingRate
      .find(options);

    log('rate', rate);
    if (rate) {
      const amount = (rate.rate_type === 'fixed') ? rate.amount : rate.amount * weight;
      log('-----------amount', amount);
      const { discount_percentage } = await Country
        .findById(countryId, {
          raw: true,
          attributes: ['discount_percentage'],
        });

      return res.json({
        standard_amount: rate.amount,
        discount_amount: rate.amount * (discount_percentage / 100),
        final_amount: ((100 - discount_percentage) / 100) * (rate.amount),
        discount_percentage,
      });
    }
    return res.json(false);
  } catch (e) {
    next(e);
  }
};

exports.index = (req, res) => {
  req.query.weight = Number(req.query.weight);
  const prs = Object.keys(shippingPartners);

  const prices = priceCalculator.getPrice(Object.assign(req.query, { providers: prs }));

  if (req.query.all) {
    return res.json({
      prices: prices
        .map((x, i) => {
          const y = x;
          y.shippingPartner = prs[i];
          return y;
        }),
    });
  }

  const { shippingPartner } = req.query;

  if (!Object.keys(shippingPartners).includes(shippingPartner)) {
    return res.json({ error: 'shippingPartner not available please try dtdc only' });
  }

  return res.json({
    price: shippingPartners[shippingPartner](req.query),
  });
};

exports.expressive = (req, res) => {
  const {
    query, country, type, service, shippingPartner,
  } = req.query;
  let q = '';
  let a = `with ${shippingPartner} `;

  const map = {
    price: {
      usa: {
        dhl: {
          doc: 500,
          nondoc: 300,
        },
      },
    },
    type: {
      doc: 'Document',
      nondoc: 'Other than document',
    },
  };

  let equery;
  if (query === 'price') {
    if (['price', 'pricing', 'cost', 'rate'].includes(query)) equery = 'cost';
    q = `how much it ${equery} to send ${service} to ${country} through ${shippingPartner}`;
    const currentShippingPartner = map[query][country];
    if (currentShippingPartner instanceof Object) {
      Object.keys(currentShippingPartner).forEach((sp) => {
        const currentTypeMap = currentShippingPartner[sp];
        Object.keys(currentTypeMap).forEach((t) => {
          a += `for ${map.type[t]}: Rs.${currentTypeMap[t]}\n`;
        });
      });
    }
  }

  if (type && type === 'doc') q += ` for ${map.type[type]}`;

  return res.json({
    q,
    a,
  });
};

exports.shipCalculate = async (req, res) => {
  let { weight } = req.body;
  const option = {
    attributes: ['id', 'discount_percentage'],
    where: { iso2: req.body.country },
  };
  const country = await Country
    .find(option);

  const discountPercent = country.discount_percentage;

  if (req.body.length && req.body.width && req.body.height) {
    const volume = req.body.length * req.body.width * req.body.height;
    let dWeight = '';
    if (req.body.scale === 'in') {
      dWeight = volume / 305;
    } else {
      dWeight = volume / 5000;
    }
    if (dWeight > weight) {
      weight = dWeight;
    }
  }
  const { unit } = req.body;
  const IS_BELOW_300 = weight <= 300;
  let type = req.body.weight <= 2 ? req.body.type : 'nondoc';
  if (unit === 'lbs') {
    weight *= 0.45;
  }
  type = type === 'nondoc' ? NONDOC : DOC;

  const optionShippingRate = {
    attributes: ['rate_type', 'amount', 'timerange'],
    where: {
      country_id: country.id,
      consignment_type: type,
      minimum: {
        $lt: weight,
      },
      maximum: { [IS_BELOW_300 ? '$gte' : '$eq']: IS_BELOW_300 ? weight : 0 },
    },
  };


  const rates = await ShippingRate
    .findAll(optionShippingRate);
  let amount = 0;
  let rate = 0;
  if (rates.length) {
    const prices = {};
    // eslint-disable-next-line no-restricted-syntax
    for (rate of rates) {
      log('dfgdfgdsfgdsfg', rates.length);
      amount = rate.rate_type === 'fixed' ? rate.amount : rate.amount * weight;
      log('amount', amount);
      amount = amount.toFixed(2);
      prices.time = rate.timerange;
      prices.amount = amount;
      prices.discountPercent = discountPercent;
      log('amount', discountPercent);
      log('prices', prices);
    }
    log({ prices });
    return res.json({ error: '0', prices });
  }
  return res.json({ error: '1' });
};

exports.customerPricing = async (req, res) => {
  const { weight } = req.body;
  const itemType = req.body.type;
  const countryId = req.body.country;
  // const { unit } = req.body;


  const option = {
    attributes: ['id', 'discount_percentage'],
    where: { id: countryId },
  };
  const country = await Country
    .find(option);
  const discountPercent = country.discount_percentage;
  const type = weight <= 2 ? itemType : 'nondoc';

  const optionShip = {
    attributes: ['id', 'amount'],
    where: {
      country_id: country.id,
      consignment_type: type,
      minimum: {
        $lt: weight,
      },
    },
  };

  if (weight <= 300) {
    optionShip.where = {
      maximum: {
        $gte: weight,
      },
    };
  } else {
    optionShip.where = {
      maximum: 0,
    };
  }
  // log({ optionShip });
  const rate = await ShippingRate
    .find(optionShip);
  // log({ rate });
  const optionReview = {
    where: {
      approved_by: '1',
    },
    limit: Number(req.query.limit) || 20,
    offset: Number(req.query.offset) || 0,
    order: ['updated_at'],
  };
  const reviews = await Review
    .findAll(optionReview);
  const optionCountries = {
    attributes: ['id', 'name'],
    where: {
      is_shipping_available: 1,
    },
    order: ['name'],
  };
  const countries = await Country
    .findAll(optionCountries);
  let time = '';
  let amount = '';
  let discountAmount = '';
  let finalAmount = '';
  if (rate) {
    amount = rate.rate_type === 'fixed' ? rate.amount : rate.amount * weight;
    time = rate.timerange;
    log({ discountPercent });
    log({ amount });
    discountAmount = (discountPercent / 100) * amount;
    log(discountAmount);
    finalAmount = Math.round((amount - discountAmount), 2);
    log({ finalAmount });
  }
  return res.json({
    reviews,
    countries,
    time,
    amount,
    discountPercent,
    finalAmount,
    weight,
    itemType,
    countryId,
  });
};


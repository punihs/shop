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

const { WebhookClient } = require('dialogflow-fulfillment');
const { Card, Suggestion } = require('dialogflow-fulfillment');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

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

function welcome(agent) {
  agent.add('Welcome to my agent!');
}

function fallback(agent) {
  agent.add('I didn\'t understand');
  agent.add('I\'m sorry, can you try again?');
}

function yourFunctionHandler(agent) {
  agent.add('This message is from Dialogflow\'s Cloud Functions for Firebase editor!');
  agent.add(new Card({
    title: 'Title: this is a card title',
    imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
    text: 'This is the body text of a card.  You can even use line\n  breaks and emoji! 💁',
    buttonText: 'This is a button',
    buttonUrl: 'https://assistant.google.com/',
  }));
  agent.add(new Suggestion('Quick Reply'));
  agent.add(new Suggestion('Suggestion'));
  agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' } });
}

function googleAssistantHandler(agent) {
  const conv = agent.conv(); // Get Actions on Google library conv instance
  conv.ask('Hello from the Actions on Google client library!'); // Use Actions on Google library
  agent.add(conv); // Add Actions on Google library responses to your agent's response
}

exports.ai = (request, response) => {
  const agent = new WebhookClient({ request, response });
  log(`Dialogflow Request headers: ${JSON.stringify(request.headers)}`);
  log(`Dialogflow Request body: ${JSON.stringify(request.body)}`);

  // Run the proper function handler based on the matched Dialogflow intent name
  const intentMap = new Map();
  intentMap.set('Order', yourFunctionHandler);
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);

  intentMap.set('Find', googleAssistantHandler);
  return agent.handleRequest(intentMap);
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
    where: { id: req.body.country },
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


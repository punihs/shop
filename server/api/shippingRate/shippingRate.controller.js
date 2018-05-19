const debug = require('debug');

const dtdc = require('../../components/price-calculator/dtdc/index');
const dhl = require('../../components/price-calculator/dhl/getPrice');
const dtdcfedex = require('../../components/price-calculator/dtdc/fedex');
const dtdcdhl = require('../../components/price-calculator/dtdc/dhl');
const dtdceco = require('../../components/price-calculator/dtdc/eco');

const providers = {
  dtdc,
  dhl,
  dtdcfedex,
  dtdcdhl,
  dtdceco,
};
const log = debug('pricing');
const priceCalculator = require('../../components/price-calculator');

const { WebhookClient } = require('dialogflow-fulfillment');
const { Card, Suggestion } = require('dialogflow-fulfillment');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.index = (req, res) => {
  req.query.weight = Number(req.query.weight);
  const prs = Object.keys(providers);

  const prices = priceCalculator.getPrice(Object.assign(req.query, { providers: prs }));

  if (req.query.all) {
    return res.json({
      prices: prices
        .map((x, i) => {
          const y = x;
          y.provider = prs[i];
          return y;
        }),
    });
  }

  const { provider } = req.query;

  if (!Object.keys(providers).includes(provider)) {
    return res.json({ error: 'provider not available please try dtdc only' });
  }

  return res.json({
    price: providers[provider](req.query),
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

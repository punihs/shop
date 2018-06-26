
const { root, CURRENT_EMAIL } = require('../config/environment');
const logger = require('../components/logger');

const ses = require('../conn/ses');

const r = require;

const emailBaseDir = `${root}/server/email`;

const [template, layout] = CURRENT_EMAIL.split('_');
const params = {
  Template: r(`${emailBaseDir}/${template}/${layout}/${layout}`).Template,
};

ses.createTemplate(params, (err, data) => {
  if (err) logger.log(err, err.stack);
  else logger.log(data);
});


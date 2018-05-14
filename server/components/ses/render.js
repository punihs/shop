
const { root, CURRENT_EMAIL } = require('../../config/environment');
const logger = require('../logger');

const ses = require('../../conn/ses');

const templateBaseDir = `${root}/server/components/ses/templates`;

/* eslint-disable global-require,import/no-dynamic-require */
const params = {
  Template: require(`${templateBaseDir}/${CURRENT_EMAIL}`).Template,
};

ses.createTemplate(params, (err, data) => {
  if (err) logger.log(err, err.stack);
  else logger.log(data);
});



const { CURRENT_EMAIL, root } = require('../../config/environment');
const logger = require('../logger');

const ses = require('../../conn/ses');

const { log } = console;

const [, Template] = (CURRENT_EMAIL || 'action-simple/gst').split('/');
const templateBaseDir = `${root}/server/components/ses/templates`;

/* eslint-disable global-require,import/no-dynamic-require */
ses.updateTemplate({
  Template: require(`${templateBaseDir}/${CURRENT_EMAIL}`).Template,
}, (error) => {
  log('err', error);
  if (error) return logger.log(error, error.stack); // an error occurred

  const TemplateData = JSON.stringify(require(`${root}/server/components/ses/templates/${CURRENT_EMAIL}`).TemplateData);

  return ses.sendTemplatedEmail({
    Source: '"Manjesh V from Shoppre.com" <manjeshpv@gmail.com>',
    Destination: {
      ToAddresses: ['manjeshpv@gmail.com'],
    },
    Template,
    TemplateData,
  }, (err, data) => {
    if (err) {
      log('err', err);
      return err;
    }
    return log('send', data);
  });
});

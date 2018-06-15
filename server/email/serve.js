
const { CURRENT_EMAIL, root } = require('../config/environment');
const logger = require('../components/logger');

const ses = require('../conn/ses');

const r = require;
const { log } = console;

const [template, layout] = CURRENT_EMAIL.split('_');
const emailBaseDir = `${root}/server/email`;
const templatePath = `${emailBaseDir}/${template}/${layout}/${layout}`;
/* eslint-disable global-require,import/no-dynamic-require */
ses.updateTemplate({
  Template: r(templatePath).Template,
}, (error) => {
  log('err', error);
  if (error) return logger.log(error, error.stack); // an error occurred

  const TemplateData = JSON.stringify(require(templatePath).TemplateData);

  return ses.sendTemplatedEmail({
    Source: '"Saneel from Shoppre.com" <saneel.es@shoppre.com>',
    ReplyToAddresses: ['support@shoppre.com'],
    Destination: {
      ToAddresses: ['manjeshpv@gmail.com'],
    },
    Template: CURRENT_EMAIL,
    TemplateData,
  }, (err, data) => {
    if (err) {
      log('err', err);
      return err;
    }
    return log('send', data);
  });
});

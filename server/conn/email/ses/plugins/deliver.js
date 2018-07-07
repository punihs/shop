const debug = require('debug');
const quarc = require('../connection');
const ses2rawEmail = require('../ses2rawEmail');

const log = debug('conn/email/ses/plugins/deliver');

module.exports = async ([params, emailLog]) => {
  log('deliver', { params, emailLog });
  if (params.attachments && !params.Subject) {
    return Promise.reject(new Error({ message: 'Email with attachment should have subject' }));
  }

  const promise = params.attachments
    ? ses2rawEmail(params, JSON.parse(params.TemplateData))
      .then(rawEmail => quarc
        .sendRawEmailAsync({
          RawMessage: {
            Data: rawEmail,
          },
        }))
    : quarc.sendTemplatedEmailAsync(params);

  return promise
    .then(status => [params, { ...emailLog, message_id: status.MessageId }, promise]);
};

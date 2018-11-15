const debug = require('debug');
const pulse = require('../connection');

const log = debug('conn/email/ses/plugins/deliver');

module.exports = async ([params, emailLog]) => {
  log('deliver', { params, emailLog });
  if (params.attachments && !params.Subject) {
    return Promise.reject(new Error({ message: 'Email with attachment should have subject' }));
  }

  const promise = pulse.sendTemplatedEmailAsync(params);

  return promise
    .then(status => [params, { ...emailLog, message_id: status.MessageId }, promise]);
};

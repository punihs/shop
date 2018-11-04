const { FROM_EMAIL, TO_EMAIL, REPLY_TO_EMAIL } = require('../../../config/environment');

const ses = require('./connection');

describe('send emails', () => {
  it('send emails', (done) => {
    ses
      .sendTemplatedEmailAsync({
        Source: `"Saneel from Shoppre" <${FROM_EMAIL}>`,
        ReplyToAddresses: [REPLY_TO_EMAIL],
        Destination: {
          ToAddresses: [TO_EMAIL],
        },
        Template: 'package_state-change_2',
        TemplateData: JSON.stringify({ }),
      })
      .then(() => done());
  });
});

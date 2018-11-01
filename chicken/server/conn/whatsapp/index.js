const rp = require('request-promise');
const fastq = require('fastq');

const logger = require('../../components/logger');
const Notify = require('../../components/notify');
// const { PREFIX } = require('../../config/environment');
const { URLS_SLACK } = require('../../config/environment');

// Process jobs from as many servers or processes as you like
const worker = (job, done) => {
  rp({
    method: 'POST',
    uri: 'https://staging-whatsapp.shoppre.com/api/send',
    body: job,
    json: true,
  }).then(() => done(null))
    .catch((err) => {
      done();
      const { response } = err;
      switch (response.statusCode) {
        case 500: {
          const text = response.body;
          if (text.includes('Unable to locate element: ._2EZ_m')) {
            return Notify.slack(['whatsapp Error',
              'NoSuchElementException: Message: Unable to locate element: ._2EZ_m"',
              `, while sending message to ${job.number}`,
              '*Please Restart Whatsapp Server*'].join(''), URLS_SLACK);
          }
          return Notify.slack(`whatsapp Error ${text}, while sending message to ${
            job.number}`, URLS_SLACK);
        }
        case 502:
          return Notify.slack(`whatsapp Error: "Server Down 502 Error", while sending message to ${
            job.number}.\n  'Please SDart Whatsapp Server'`, URLS_SLACK);
        case 504:
          return Notify.slack(`whatsapp Error: "504 Timeout Error", while sending message to ${
            job.number
          }.\n If problem still persists - Please Restart Whatsapp Server`, URLS_SLACK);
        default: {
          const qrCodeText = response.body;
          Notify.slack(`Whatsapp is logged out while sending message to ${
            job.number},
            Follow these steps to login again.
            1. Please copy this qr code text \`${qrCodeText}\`.
            2. Go to https://www.qr-code-generator.com/
            3. Select text from tab menu, paste it into the message box and hit create.
            4. Scan the Qr generated using whatsapp in your phone.`, URLS_SLACK);
        }
      }
      return logger.error('whatapp', err);
    });
};

const queue = fastq(worker, 1);

/* eslint no-control-regex: 0 */
const stripNonAscii = text => text.replace(/[^\x00-\x7F]/g, '');

// const MEENA = 9071032646;

exports.send = ({ number, message = 'Notifications awaiting for you in ShoppRe.com' }) => {
  if (!number) return null;
  // const mobileDev = PREFIX.includes('staging-') || !PREFIX.includes('https');

  // const number = mobileDev ? MEENA : mobile;
  const strippedMsg = stripNonAscii(message);


  return queue.push({ number, message: strippedMsg }, (err) => {
    if (err) logger.error('whatspap', err);
  });
};

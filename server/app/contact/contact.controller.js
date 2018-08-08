const rp = require('request-promise');
const { URLS_API, URLS_MYACCOUNT } = require('../../config/environment');

exports.index = (req, res, next) => Promise
  .all([
    rp(`${URLS_API}/api/countries`, { json: true }),
  ])
  .then(([countries]) => {
    res
      .render('contact/index', {
        s3BaseUrl: req.s3BaseUrl,
        URLS_API,
        URLS_MYACCOUNT,
        title: 'Contact | Shoppre - International Shipping Partner',
        meta_description: 'Have any questions or concerns? about your package or shipping services please call us at +91-8040944077 or start Live chat, Whatsapp with Team Shoppre.',
        meta_keywords: 'questions, concerns, about your package, shipping services, please call us, start live chat, whatsapp, team shoppre',
        countries,
      });
  })
  .catch(next);

exports.confirmation = (req, res) => {
  res
    .render('contact/confirmation', {
      s3BaseUrl: req.s3BaseUrl,
      URLS_API,
      URLS_MYACCOUNT,
      title: 'Thank you for your Feedback - Shoppre.com',
      meta_description: 'Thank you for your Feedback',
      meta_keywords: 'questions, concerns, about your package, shipping services, please call us, start live chat, whatsapp, team shoppre',
    });
};

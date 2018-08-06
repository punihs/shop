
const rp = require('request-promise');
const { URLS_API, URLS_MYACCOUNT } = require('../../config/environment');

exports.index = (req, res, next) => Promise
  .all([
    rp(`${URLS_API}/api/faqs`, { json: true }),
  ])
  .then(([faqCategory]) => {
    res.render('faq/index', Object
      .assign(faqCategory, {
        s3BaseUrl: req.s3BaseUrl,
        URLS_API,
        URLS_MYACCOUNT,
        title: 'FAQ | Shoppre - International Shipping Partner',
        meta_description: 'Frequently Asked Questions about Shoppre, international shipping services from India. More info such as membership plan, shipping rates, virtual address &amp; App',
        meta_keywords: 'frequently asked questions, membership plan, shipping rates, virtual address, app, account information, receipts',
      }));
  })
  .catch(next);

exports.show = (req, res, next) => Promise
  .all([
    rp(`${URLS_API}/api/faqs/${req.params.slug}`, { json: true }),
  ])
  .then(([faq]) =>
    res
      .render('faq/show', Object
        .assign(faq, {
          title: 'FAQ | Shoppre - International Shipping Partner',
          meta_description: 'Frequently Asked Questions about Shoppre, international shipping services from India. More info such as membership plan, shipping rates, virtual address &amp; App',
          meta_keywords: 'frequently asked questions, membership plan, shipping rates, virtual address, app, account information, receipts',
        })))
  .catch(next);


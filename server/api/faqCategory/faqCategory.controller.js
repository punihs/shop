const { FaqCategory, Faq } = require('./../../conn/sqldb');

exports.index = (req, res, next) => {
  const options = {
    attributes: ['id', 'name'],
    include: [{ model: Faq, attributes: ['id', 'question', 'answer'] }],
  };
  return FaqCategory
    .findAll(options)
    .then(faqCategory => res.json(faqCategory))
    .catch(next);
};


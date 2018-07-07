
const { EmailTemplate, EmailPreference } = require('../../conn/sqldb');

exports.index = (req, res, next) => Promise
  .all([
    EmailTemplate
      .findAll({
        attributes: ['id', 'name', 'description'],
        where: {
          group_id: req.user.group_id,
        },
        raw: true,
      }),
    EmailPreference.findAll({ where: { user_id: req.user.id }, raw: true }),
  ])
  .then(([emailTemplates, emailPreferences]) => {
    const templateIdPreference = emailPreferences
      .reduce((nxt, x) => ({ [x.email_template_id]: x.enabled }), {});

    const result = emailTemplates
      .map(x => ({ ...x, enabled: templateIdPreference[x.id] !== 0 }));
    return res.json(result);
  })
  .catch(next);

exports.show = (req, res, next) => {
  const { name } = req.params;
  const { type } = req.query;

  return EmailTemplate
    .find({
      attributes: ['body'],
      where: {
        name,
        type: type || 'default',
      },
    })
    .then(emailTemplate => res.json(emailTemplate))
    .catch(next);
};

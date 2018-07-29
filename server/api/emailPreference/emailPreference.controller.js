
const { EmailPreference } = require('../../conn/sqldb');

exports.show = (req, res, next) => EmailPreference
  .find({ where: { user_id: req.user_id } })
  .then(emailPreference => res.json(emailPreference))
  .catch(next);

exports.create = (req, res, next) => EmailPreference
  .findOrCreate({
    where: {
      user_id: req.user.id,
      email_template_id: 1,
    },
    defaults: {
      enabled: req.body.enabled,
    },
  })
  .then(([{ id }, created]) => {
    if (created) return res.json({ id });

    return EmailPreference
      .update({
        enabled: req.body.enabled,
      }, {
        where: { id },
      })
      .then(() => res.json({ id }));
  })
  .catch(next);

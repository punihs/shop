const debug = require('debug');
const logger = require('../../components/logger');
const { root, CURRENT_EMAIL } = require('../../config/environment');
const { EmailTemplate } = require('../../conn/sqldb');
const ses = require('../../conn/email/ses');

const log = debug('s-emails-lib-build');

const required = require;

exports.cmd = (e) => {
  const templateFullName = e || CURRENT_EMAIL || 'package_state-change';
  const [layout, template] = templateFullName.split('_');
  const emailBaseDir = `${root}/server/api/${layout}/emails`;

  const { Meta, Template } = required(`${emailBaseDir}/${template}/${template}`);

  // make entry if doesnt exists in qurac email_templates
  EmailTemplate
    .findOrCreate({
      where: { name: templateFullName },
      defaults: {
        group_id: Meta.group_id,
        description: Meta.description,
      },
    })
    .catch(err => logger.error('buildTemplate EmailTemplate error', err, templateFullName));

  log('createTemplateAsync:Template', Template);
  return ses.quarc
    .createTemplateAsync({ Template });
};

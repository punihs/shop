const debug = require('debug');
const logger = require('../../components/logger');
const { root, CURRENT_EMAIL } = require('../../config/environment');
const { EmailTemplate } = require('../../conn/sqldb');
const ses = require('../../conn/email/ses');

const log = debug('s-emails-lib-build');

const required = require;

exports.cmd = (e) => {
  log('e', e);
  const templateFullName = e || CURRENT_EMAIL;
  if (!templateFullName) throw Error('update CURRENT_EMAIL in .env');
  const [layout, template] = templateFullName.split('_');
  const emailBaseDir = `${root}/server/api/${layout}/emails`;

  const { Meta, instances } = required(`${emailBaseDir}/${template}/${template}`);
  return Promise.all(instances.map((x) => {
    const { Template, group_id: groupId } = x;

    // make entry if doesnt exists in qurac email_templates
    EmailTemplate
      .findOrCreate({
        where: { name: `${templateFullName}_${groupId}` },
        defaults: {
          // Todo: create table: email_template_groups
          group_id: groupId,
          description: Meta.description,
        },
      })
      .catch(err => logger.error('buildTemplate EmailTemplate error', err, templateFullName));

    log('createTemplateAsync:Template', Template);
    return ses.quarc
      .createTemplateAsync({ Template });
  }));
};

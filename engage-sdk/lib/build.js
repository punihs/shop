const debug = require('debug');
const rp = require('request-promise');
const logger = require('../../lambda/server/components/logger');
const { root, CURRENT_EMAIL, project } = require('../config');
// const { EmailTemplate } = require('../../conn/sqldb');
const ses = require('../../chicken/server/conn/email/ses');

const log = debug('s-emails-lib-build');

const required = require;

exports.cmd = (e) => {
  log('e', e);
  const templateFullName = e || CURRENT_EMAIL;
  if (!templateFullName) throw Error('update CURRENT_EMAIL in .env');
  const [layout, template] = templateFullName.split('_');
  const emailBaseDir = `${root}/${project}/server/api/${layout}/emails`;

  const { Meta, instances } = required(`${emailBaseDir}/${template}/${template}`);
  return Promise.all(instances.map((x) => {
    const { Template, group_id: groupId } = x;

    // make entry if doesnt exists in qurac email_templates
    rp({
      method: 'POST',
      url: 'http://localhost:6000/api/emailTemplates',
      json: true,
      body: {
        name: `${templateFullName}_${groupId}`,
        group_id: groupId,
        description: Meta.description,
      },
    })
      .catch(err => logger.error('buildTemplate EmailTemplate error', err, templateFullName));

    log('createTemplateAsync:Template', Template);
    return ses.pulse
      .createTemplateAsync({ Template });
  }));
};

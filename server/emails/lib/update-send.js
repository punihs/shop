
const ses = require('../../conn/email/ses');
const {
  SES_DIRECT, CURRENT_EMAIL, root, EMAIL_SOURCE, EMAIL_TO,
} = require('../../config/environment');

const required = require;

exports.cmd = (e) => {
  const templateFullName = e || CURRENT_EMAIL || 'package_state-change';
  const [layout, template] = templateFullName.split('_');
  const emailBaseDir = `${root}/server/api/${layout}/emails`;
  const { instances } = required(`${emailBaseDir}/${template}/${template}`);

  return Promise
    .all(instances
      .map((x) => {
        const {
          group_id: groupId, Template, TemplateData, attachments, Subject,
        } = x;
        const TemplateName = `${templateFullName}_${groupId}`;

        return ses.quarc
          .updateTemplateAsync({ Template })
          .then(() => {
            const email = {
              Source: EMAIL_SOURCE || 'notifications@cp.shoppre.com',
              Destination: {
                ToAddresses: [EMAIL_TO || 'vismaya@shoppre.com'],
              },
              Template: TemplateName,
              TemplateData: JSON.stringify(TemplateData),
            };

            if (attachments) {
              email.attachments = attachments;
              email.Subject = Subject;
            }

            return (SES_DIRECT === 'true'
              ? ses.quarc
              : ses)
              .sendTemplatedEmailAsync(email);
          });
      }));
};


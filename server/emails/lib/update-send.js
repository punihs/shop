
const ses = require('../../conn/email/ses');
const {
  SES_DIRECT, CURRENT_EMAIL, root, EMAIL_SOURCE, EMAIL_TO,
} = require('../../config/environment');

const required = require;


exports.cmd = (e) => {
  const templateFullName = e || CURRENT_EMAIL || 'Action-Ad_m-qd-jd-priority';
  const [layout, template] = templateFullName.split('_');
  const emailBaseDir = `${root}/server/api/${layout}/emails`;

  const {
    Template, TemplateData, attachments, Subject,
  } = required(`${emailBaseDir}/${template}/${template}`);


  return ses.quarc
    .updateTemplateAsync({ Template })
    .then(() => {
      const email = {
        Source: EMAIL_SOURCE || 'notifications@cp.shoppre.com',
        Destination: {
          ToAddresses: [EMAIL_TO || 'vismaya@shoppre.com'],
        },
        Template: templateFullName,
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
};

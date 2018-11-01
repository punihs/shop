const debug = require('debug');
const mailcomposer = require('mailcomposer');
const { render } = require('../../../components/hbs');
const renderForSES = require('../../../conn/email/ses/render');
const ses2mail = require('../../../components/ses2mail');
const Minio = require('../../../conn/minio');

const log = debug('conn/email/ses/ses2rawEmail');

module.exports = async (params, TemplateData) => {
  log('ses2rawEmail', TemplateData);
  const awsSesTemplateHtml = renderForSES({ TemplateName: params.Template });

  const htmlEmail = await render('ingore', TemplateData, awsSesTemplateHtml);

  const attachments = await Promise
    .all(params.attachments
      .map((x) => {
        if (!x.minio) return x;
        return Minio
          .getFileStream({ object: x.path })
          .then(stream => ({
            filename: x.filename,
            content: stream,
          }));
      }));

  const mail = mailcomposer({
    ...ses2mail({ ...params, Body: { Html: { Data: htmlEmail } }, Subject: TemplateData.subject }),
    attachments,
  });

  return new Promise((resolve, reject) => {
    mail.build((err, rawEmail) => {
      if (err) return reject(err);
      return resolve(rawEmail);
    });
  });
};

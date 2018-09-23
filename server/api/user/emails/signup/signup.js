const render = require('../../../../conn/email/ses/render');

const TemplateName = __dirname.split('/')
  .slice(-3)
  .filter(x => (x !== 'emails'))
  .join('_');

const { signup: TemplateData } = require('../../user.sample');

module.exports = {
  Meta: {
    description: 'Welcome Email',
  },
  instances: [{
    group_id: 1,
    TemplateData,
    Template: {
      TemplateName: `${TemplateName}_${1}`,
      SubjectPart: 'Welcome to Shoppre',
      HtmlPart: render({
        TemplateName: `${TemplateName}_${1}`,
        afterContent: ['global:cheers'],
      }),
    },
  }],
};

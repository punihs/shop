const render = require('../../../../conn/email/ses/render');
const { GROUPS } = require('../../../../config/constants');

const TemplateName = __dirname.split('/')
  .slice(-3)
  .filter(x => (x !== 'emails'))
  .join('_');

const { signup: TemplateData } = require('../../user.sample');

const { CUSTOMER } = GROUPS;

module.exports = {
  Meta: {
    description: 'Welcome Email',
  },
  instances: [{
    group_id: CUSTOMER,
    TemplateData,
    Template: {
      TemplateName: `${TemplateName}_${CUSTOMER}`,
      SubjectPart: 'Welcome to Shoppre',
      HtmlPart: render({
        TemplateName: `${TemplateName}_${CUSTOMER}`,
        afterContent: ['global:cheers'],
      }),
    },
  }],
};

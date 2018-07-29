
const { GROUPS: { CUSTOMER, OPS } } = require('../../../../config/constants');

const { CURRENT_EVENT_KEY } = require('../../../../config/environment');

const render = require('../../../../conn/email/ses/render');
const TemplateData = require('./state-change.data')[CURRENT_EVENT_KEY];

const TemplateName = __dirname.split('/')
  .slice(-3)
  .filter(x => (x !== 'emails'))
  .join('_');

module.exports = {
  Meta: {
    description: 'Invitation to view CV',
  },
  instances: [{
    group_id: CUSTOMER,
    TemplateData,
    Template: {
      TemplateName: `${TemplateName}_${CUSTOMER}`,
      SubjectPart: 'Your {{pkg.Store.name}} order #{{pkg.reference_code}} is received',
      HtmlPart: render({
        TemplateName: `${TemplateName}_${CUSTOMER}`,
        afterContent: ['global:cheers'],
      }),
    },
  }, {
    group_id: OPS,
    TemplateData,
    Template: {
      TemplateName: `${TemplateName}_${OPS}`,
      SubjectPart: '{{customer.name}}: {{pkg.Store.name}} order #{{pkg.reference_code}} is received',
      HtmlPart: render({
        TemplateName: `${TemplateName}_${OPS}`,
        extras: ['packageItems'],
        afterContent: ['global:cheers'],
      }),
    },
  }],
};

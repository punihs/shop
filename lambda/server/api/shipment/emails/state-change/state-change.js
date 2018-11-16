
const { GROUPS: { CUSTOMER } } = require('../../../../config/constants');

const { CURRENT_EVENT_KEY } = require('../../../../config/environment');

const render = require('../../../../../../engage-sdk/render');
const TemplateData = require('./state-change.data')[CURRENT_EVENT_KEY];
console.log('---------------\n\n')
console.log(JSON.stringify(TemplateData))
console.log('\n\n---------------')
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
      SubjectPart: '{{subject}}',
      HtmlPart: render({
        TemplateName: `${TemplateName}_${CUSTOMER}`,
        extras: ['header',],
        afterContent: ['global:cheers'],
      }),
    },
  }],
};


const { GROUPS: { CUSTOMER } } = require('../../../../config/constants');
const { emailSubject } = require('./subject');

const { CURRENT_EVENT_KEY } = require('../../../../config/environment');

const render = require('../../../../../../chicken-sdk/render');
const TemplateData = require('./state-change.data')[CURRENT_EVENT_KEY];

const TemplateName = __dirname.split('/')
  .slice(-3)
  .filter(x => (x !== 'emails'))
  .join('_');
const data = {
  eventKey: CURRENT_EVENT_KEY,
  packageId: 13,
};
const subject = emailSubject(data);

module.exports = {
  Meta: {
    description: 'Invitation to view CV',
  },
  instances: [{
    group_id: CUSTOMER,
    TemplateData,
    Template: {
      TemplateName: `${TemplateName}_${CUSTOMER}`,
      SubjectPart: subject,
      HtmlPart: render({
        TemplateName: `${TemplateName}_${CUSTOMER}`,
        extras: ['header', 'virtualAddress', 'items', 'footer', 'signature'],
        afterContent: ['global:cheers'],
      }),
    },
  }],
};

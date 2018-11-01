
const { GROUPS: { CUSTOMER } } = require('../../../../config/constants');

const { CURRENT_EVENT_KEY } = require('../../../../config/environment');

const render = require('../../../../../../sesmetrics-sdk/render');
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
      SubjectPart: 'Shipment Mails',
      HtmlPart: render({
        TemplateName: `${TemplateName}_${CUSTOMER}`,
        extras: ['header', 'virtualAddress', 'items', 'footer', 'signature'],
        afterContent: ['global:cheers'],
      }),
    },
  }],
};

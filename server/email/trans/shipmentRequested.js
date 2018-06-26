const getTemplate = require('../getTemplate');
const path = require('path');

const scriptName = path.basename(__filename);

const TemplateName = scriptName.slice(0, -3);
const layoutName = __dirname.split('/').pop();
const afterContent = ['afterContent'];

module.exports = {
  TemplateData: {
    order_id: '645-124-556',
    weight: '10',
    seller: 'FB seller',
    received: '21/05/2018',
    name: 'Meena',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    pin: '560034',
    code: '91',
    phone: '7675919744',
    line1: 'koramangala',
    line2: 'jakkasandra',
  },
  Template: {
    TemplateName,
    SubjectPart: 'We have received your shipment request | Shipment ID ',
    HtmlPart: getTemplate({
      layoutName,
      TemplateName,
      afterContent,
    }),
  },
};

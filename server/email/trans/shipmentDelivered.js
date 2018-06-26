const getTemplate = require('../getTemplate');
const path = require('path');

const scriptName = path.basename(__filename);

const TemplateName = scriptName.slice(0, -3);
const layoutName = __dirname.split('/').pop();
const afterContent = ['afterContent'];

module.exports = {
  TemplateData: {
    order_id: '476-678-443',
    updated_at: '21/05/2018',
  },
  Template: {
    TemplateName,
    SubjectPart: 'Shipment delivered | Earn 100 loyalty points | Shiment ID ',
    HtmlPart: getTemplate({
      layoutName,
      TemplateName,
      afterContent,
    }),
  },
};

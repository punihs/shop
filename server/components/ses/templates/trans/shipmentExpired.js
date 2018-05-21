const getTemplate = require('../../getTemplate');
const path = require('path');

const scriptName = path.basename(__filename);

const TemplateName = scriptName.slice(0, -3);
const layoutName = __dirname.split('/').pop();
const afterContent = ['afterContent'];

module.exports = {
  TemplateData: {
    final_amount: '1000',
    order_id: '678-445-445',
  },
  Template: {
    TemplateName,
    SubjectPart: 'Your ready-to-be shipped package is incurring a Storage Fee | Please Submit Payment immediately | Shipment ID ',
    HtmlPart: getTemplate({
      layoutName,
      TemplateName,
      afterContent,
    }),
  },
};

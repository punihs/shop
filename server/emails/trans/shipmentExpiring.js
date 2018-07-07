const getTemplate = require('../getTemplate');
const path = require('path');

const scriptName = path.basename(__filename);

const TemplateName = scriptName.slice(0, -3);
const layoutName = __dirname.split('/').pop();
const afterContent = ['afterContent'];

module.exports = {
  TemplateData: {
    final_amount: '1000',
    order_id: '564-978-244',
  },
  Template: {
    TemplateName,
    SubjectPart: 'Reminder: Submit Payment to avoid Storage Fees | Shipment ID  ',
    HtmlPart: getTemplate({
      layoutName,
      TemplateName,
      afterContent,
    }),
  },
};

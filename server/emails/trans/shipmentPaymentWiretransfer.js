const getTemplate = require('../getTemplate');
const path = require('path');

const scriptName = path.basename(__filename);

const TemplateName = scriptName.slice(0, -3);
const layoutName = __dirname.split('/').pop();
const afterContent = ['afterContent'];

module.exports = {
  TemplateData: {
    order_id: '645-124-556',
    final_amount: '10000',
  },
  Template: {
    TemplateName,
    SubjectPart: 'Your Payment via Wire-Transfer Not Yet Received | Shipment ID  ',
    HtmlPart: getTemplate({
      layoutName,
      TemplateName,
      afterContent,
    }),
  },
};

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
    estimated: '10111',
  },
  Template: {
    TemplateName,
    SubjectPart: 'Submit Payment | Your shipment is packed and weighed | Shipment ID ',
    HtmlPart: getTemplate({
      layoutName,
      TemplateName,
      afterContent,
    }),
  },
};
